package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.*;
import com.eduhub.eduhub_backend.repository.*;
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

    // 1. INITIATE PAYMENT
    @PostMapping("/pay")
    public ResponseEntity<?> initiatePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String phone,
            @RequestParam Long resourceId) {
        try {
            User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherResource resource = resourceRepository.findById(resourceId).orElseThrow();
            
            // Check if already bought
            boolean alreadyOwned = purchaseRepository.findByStudent(student).stream()
                    .anyMatch(p -> p.getResource().getId().equals(resourceId));
            if(alreadyOwned) return ResponseEntity.badRequest().body("You already own this resource.");

            Double amount = resource.getPrice();

            // Format Phone
            if (phone.startsWith("0")) phone = "254" + phone.substring(1);
            if (phone.startsWith("+")) phone = phone.substring(1);

            // Call M-Pesa
            String checkoutRequestId = mpesaService.sendStkPush(phone, amount, "EduHub");

            // Save Transaction (PENDING)
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setStudent(student);
            transaction.setResource(resource);
            transaction.setAmount(amount);
            transaction.setPhoneNumber(phone);
            transaction.setCheckoutRequestId(checkoutRequestId);
            transaction.setStatus("PENDING");
            transactionRepository.save(transaction);

            // RETURN JSON WITH ID (Important for polling)
            return ResponseEntity.ok(Map.of(
                "message", "STK Push Sent",
                "checkoutRequestId", checkoutRequestId
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Payment Failed: " + e.getMessage());
        }
    }

    // 2. CHECK STATUS ENDPOINT (New!)
    @GetMapping("/status/{checkoutRequestId}")
    public ResponseEntity<?> checkStatus(@PathVariable String checkoutRequestId) {
        PaymentTransaction transaction = transactionRepository.findByCheckoutRequestId(checkoutRequestId).orElse(null);
        
        if (transaction == null) {
            return ResponseEntity.status(404).body(Map.of("status", "NOT_FOUND"));
        }

        return ResponseEntity.ok(Map.of("status", transaction.getStatus()));
    }

    // 3. CALLBACK (Existing logic, no changes needed, just ensure it updates the DB)
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
                transaction.setStatus("COMPLETED");
                transactionRepository.save(transaction);

                // Create Purchase Logic... (Same as before)
                Purchase purchase = new Purchase(transaction.getStudent(), transaction.getResource(), LocalDateTime.now());
                purchase.setPrice(transaction.getAmount());
                purchaseRepository.save(purchase);
                
                // Notification Logic...
                Notification notif = new Notification(
                    transaction.getResource().getUser(),
                    "New Sale! " + transaction.getStudent().getName() + " bought " + transaction.getResource().getTitle(),
                    LocalDateTime.now(), false
                );
                notificationRepository.save(notif);
            } else {
                transaction.setStatus("FAILED");
                transactionRepository.save(transaction);
            }
        } catch (Exception e) { e.printStackTrace(); }
    }
}