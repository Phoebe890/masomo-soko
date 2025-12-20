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
    @Autowired private TeacherProfileRepository teacherProfileRepository; // ADDED THIS
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
            
            // Check Duplicate
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

                // B. Credit Teacher Wallet (90% Split)
                User teacherUser = transaction.getResource().getUser();
                TeacherProfile profile = teacherProfileRepository.findByUserId(teacherUser.getId()).orElse(null);
                
                if (profile != null) {
                    Double amountPaid = transaction.getAmount();
                    Double teacherShare = amountPaid * 0.90; // 90%
                    
                    Double currentBalance = profile.getAccountBalance() != null ? profile.getAccountBalance() : 0.0;
                    profile.setAccountBalance(currentBalance + teacherShare);
                    teacherProfileRepository.save(profile);
                    System.out.println("Wallet Credited: " + teacherShare);
                }
                
                // C. Notify Teacher
                Notification notif = new Notification(
                    transaction.getResource().getUser(),
                    "New Sale! + KES " + (transaction.getAmount() * 0.90) + " added to wallet.",
                    LocalDateTime.now(), false
                );
                notificationRepository.save(notif);

                // D. Send Emails
                try {
                    emailProducer.sendEmail(
                        transaction.getStudent().getEmail(),
                        "EduHub Receipt: " + transaction.getResource().getTitle(),
                        "Thank you for your purchase of " + transaction.getResource().getTitle() + "."
                    );
                    emailProducer.sendEmail(
                        transaction.getResource().getUser().getEmail(),
                        "New Sale Alert! 💰",
                        "You just earned money from a new sale!"
                    );
                } catch (Exception emailEx) { System.err.println("Email Error: " + emailEx.getMessage()); }

            } else {
                transaction.setStatus("FAILED");
                transactionRepository.save(transaction);
            }
        } catch (Exception e) { e.printStackTrace(); }
    }
}