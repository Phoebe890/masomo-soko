package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.PaymentTransaction;
import com.eduhub.eduhub_backend.entity.Purchase;
import com.eduhub.eduhub_backend.entity.TeacherResource;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.PaymentTransactionRepository;
import com.eduhub.eduhub_backend.repository.PurchaseRepository;
import com.eduhub.eduhub_backend.repository.TeacherResourceRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import com.eduhub.eduhub_backend.service.MpesaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal; // <--- CRITICAL IMPORT
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" }, allowCredentials = "true")
public class PaymentController {

    @Autowired private MpesaService mpesaService;
    @Autowired private PaymentTransactionRepository transactionRepository;
    @Autowired private TeacherResourceRepository resourceRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PurchaseRepository purchaseRepository;

    @PostMapping("/pay")
    public ResponseEntity<?> initiatePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> request) {
        
        try {
            if (userDetails == null) return ResponseEntity.status(401).body("Unauthorized");
            
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            
            // 1. Get Inputs safely
            Long resourceId = Long.valueOf(request.get("resourceId").toString());
            String phoneNumber = request.get("phoneNumber").toString();
            
            // FIX: Convert request amount (String/Double) to BigDecimal explicitly
            BigDecimal amountVal = new BigDecimal(request.get("amount").toString());
            
            TeacherResource resource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            // 2. Call Service (Now passing BigDecimal, matching the Service definition)
            Map<String, String> mpesaResponse = mpesaService.initiateStkPush(phoneNumber, amountVal);

            // 3. Save Transaction
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setUser(user);
            transaction.setResource(resource);
            transaction.setAmount(amountVal); // Save as BigDecimal
            transaction.setPhoneNumber(phoneNumber);
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setStatus("PENDING");
            
            // Save IDs from M-Pesa response
            transaction.setMerchantRequestId(mpesaResponse.get("MerchantRequestID"));
            transaction.setCheckoutRequestId(mpesaResponse.get("CheckoutRequestID"));

            transactionRepository.save(transaction);

            return ResponseEntity.ok(Map.of(
                "message", "STK Push initiated", 
                "checkoutRequestId", transaction.getCheckoutRequestId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Payment initiation failed: " + e.getMessage());
        }
    }

    @PostMapping("/callback")
    public void mpesaCallback(@RequestBody String callbackJson) {
        try {
            System.out.println("M-Pesa Callback: " + callbackJson);

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> map = mapper.readValue(callbackJson, Map.class);
            Map<String, Object> body = (Map<String, Object>) map.get("Body");
            Map<String, Object> stkCallback = (Map<String, Object>) body.get("stkCallback");

            String checkoutRequestId = (String) stkCallback.get("CheckoutRequestID");
            int resultCode = (int) stkCallback.get("ResultCode"); 

            PaymentTransaction transaction = transactionRepository.findByCheckoutRequestId(checkoutRequestId).orElse(null);

            if (transaction != null) {
                if (resultCode == 0) {
                    transaction.setStatus("COMPLETED");
                    
                    // Grant Access
                    Purchase purchase = new Purchase(transaction.getUser(), transaction.getResource(), LocalDateTime.now());
                    // Use doubleValue() to convert back if Entity expects Double, 
                    // otherwise change Purchase entity to use BigDecimal too.
                    purchase.setPrice(transaction.getResource().getPrice()); 
                    purchaseRepository.save(purchase);
                    
                } else {
                    transaction.setStatus("FAILED");
                }
                transactionRepository.save(transaction);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @GetMapping("/status/{checkoutRequestId}")
    public ResponseEntity<?> checkStatus(@PathVariable String checkoutRequestId) {
        PaymentTransaction transaction = transactionRepository.findByCheckoutRequestId(checkoutRequestId).orElse(null);
        if (transaction == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("status", transaction.getStatus()));
    }
}