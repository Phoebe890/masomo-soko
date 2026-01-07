package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.*;
import com.eduhub.eduhub_backend.repository.*;
import com.eduhub.eduhub_backend.service.EmailProducer;
import com.eduhub.eduhub_backend.service.MpesaService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PaymentController {

    @Autowired private MpesaService mpesaService;
    @Autowired private UserRepository userRepository;
    @Autowired private TeacherResourceRepository resourceRepository;
    @Autowired private PaymentTransactionRepository transactionRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private TeacherProfileRepository teacherProfileRepository;
    @Autowired private EmailProducer emailProducer;

    // 1. INITIATE PAYMENT
    @PostMapping("/pay")
    public ResponseEntity<?> initiatePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String phone,
            @RequestParam Long resourceId) {
        try {
            User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherResource resource = resourceRepository.findById(resourceId).orElseThrow();
            
            boolean alreadyOwned = purchaseRepository.findByStudent(student).stream()
                    .anyMatch(p -> p.getResource().getId().equals(resourceId));
            if(alreadyOwned) return ResponseEntity.badRequest().body("You already own this resource.");

            Double amount = resource.getPrice();

            if (phone.startsWith("0")) phone = "254" + phone.substring(1);
            if (phone.startsWith("+")) phone = phone.substring(1);

            String checkoutRequestId = mpesaService.sendStkPush(phone, amount, "EduHub");

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setStudent(student);
            transaction.setResource(resource);
            transaction.setAmount(amount);
            transaction.setPhoneNumber(phone);
            transaction.setCheckoutRequestId(checkoutRequestId);
            transaction.setStatus("PENDING");
            transactionRepository.save(transaction);

            return ResponseEntity.ok(Map.of(
                "message", "STK Push Sent",
                "checkoutRequestId", checkoutRequestId
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Payment Failed: " + e.getMessage());
        }
    }

    // 2. CHECK STATUS
    @GetMapping("/status/{checkoutRequestId}")
    public ResponseEntity<?> checkStatus(@PathVariable String checkoutRequestId) {
        PaymentTransaction transaction = transactionRepository.findByCheckoutRequestId(checkoutRequestId).orElse(null);
        if (transaction == null) return ResponseEntity.status(404).body(Map.of("status", "NOT_FOUND"));
        return ResponseEntity.ok(Map.of("status", transaction.getStatus()));
    }

    // 3. CALLBACK
    @PostMapping("/callback")
    public void mpesaCallback(@RequestBody String callbackJson) {
        System.out.println("M-Pesa Callback: " + callbackJson);
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(callbackJson);
            JsonNode stkCallback = root.path("Body").path("stkCallback");
            String checkoutRequestId = stkCallback.path("CheckoutRequestID").asText();
            int resultCode = stkCallback.path("ResultCode").asInt();

            PaymentTransaction transaction = transactionRepository.findByCheckoutRequestId(checkoutRequestId).orElse(null);
            if (transaction == null) return;

            if (resultCode == 0) {
                // SUCCESS
                transaction.setStatus("COMPLETED");
                transactionRepository.save(transaction);

                // A. Create Purchase Record
                Purchase purchase = new Purchase(transaction.getStudent(), transaction.getResource(), LocalDateTime.now());
                purchase.setPrice(transaction.getAmount());
                purchaseRepository.save(purchase);

                // B. Calculations
                Double amountPaid = transaction.getAmount();
                Double teacherShare = amountPaid * 0.90; // 90%

                // C. Credit Wallet
                User teacherUser = transaction.getResource().getUser();
                TeacherProfile profile = teacherProfileRepository.findByUserId(teacherUser.getId()).orElse(null);
                
                if (profile != null) {
                    Double currentBalance = profile.getAccountBalance() != null ? profile.getAccountBalance() : 0.0;
                    profile.setAccountBalance(currentBalance + teacherShare);
                    teacherProfileRepository.save(profile);
                }
                
                // D. Notify Teacher (In-App)
                Notification notif = new Notification(
                    teacherUser,
                    "New Sale: '" + transaction.getResource().getTitle() + "' sold for KES " + amountPaid,
                    LocalDateTime.now(), false
                );
                notificationRepository.save(notif);

                // E. SEND EMAILS (UPDATED SECTION)
                try {
                    // 1. Email to Student
                    emailProducer.sendEmail(
                        transaction.getStudent().getEmail(),
                        "Receipt: " + transaction.getResource().getTitle(),
                        "Dear " + transaction.getStudent().getName() + ",\n\n" +
                        "Thank you for purchasing '" + transaction.getResource().getTitle() + "'.\n" +
                        "You can now access and download this resource from your dashboard.\n\n" +
                        "Happy Learning,\nEduHub Team"
                    );

                    // 2. Email to Teacher (MORE INFORMATIVE)
                    String teacherSubject = "New Sale: " + transaction.getResource().getTitle();
                    String teacherBody = String.format(
                        "Dear %s,\n\n" +
                        "Great news! You have made a new sale on EduHub.\n\n" +
                        "Transaction Details:\n" +
                        "------------------------------------------------\n" +
                        "Resource: %s\n" +
                        "Student: %s\n" +
                        "Sale Amount: KES %.2f\n" +
                        "Your Earnings (90%%): KES %.2f\n" +
                        "Date: %s\n" +
                        "------------------------------------------------\n\n" +
                        "This amount has been credited to your wallet.\n\n" +
                        "Keep creating great content!\n" +
                        "The EduHub Team",
                        teacherUser.getName(),
                        transaction.getResource().getTitle(),
                        transaction.getStudent().getName(),
                        amountPaid,
                        teacherShare,
                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))
                    );

                    emailProducer.sendEmail(teacherUser.getEmail(), teacherSubject, teacherBody);

                } catch (Exception emailEx) { 
                    System.err.println("Email Error: " + emailEx.getMessage()); 
                }

            } else {
                // Handle Failures
                if (resultCode == 1032) transaction.setStatus("CANCELLED");
                else if (resultCode == 1037) transaction.setStatus("TIMEOUT");
                else transaction.setStatus("FAILED");
                
                transactionRepository.save(transaction);
            }
        } catch (Exception e) { e.printStackTrace(); }
    }
}