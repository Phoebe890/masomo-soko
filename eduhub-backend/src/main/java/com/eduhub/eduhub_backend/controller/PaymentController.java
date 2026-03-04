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
import com.eduhub.eduhub_backend.service.EmailProducer;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.eduhub.eduhub_backend.entity.Notification;
import com.eduhub.eduhub_backend.repository.NotificationRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
    @Autowired private EmailProducer emailProducer; 
@Autowired private NotificationRepository notificationRepository;
    @PostMapping("/pay")
    public ResponseEntity<?> initiatePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> request) {
        
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body("Please log in to purchase this resource.");
            }
            
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
             
         if ("TEACHER".equals(user.getRole())) {
            return ResponseEntity.status(403).body("Access Denied: Teachers cannot purchase resources. Please log in with a Student account.");
        }
            if (request.get("resourceId") == null || request.get("amount") == null) {
                return ResponseEntity.status(400).body("Invalid request data.");
            }

            Long resourceId = Long.valueOf(request.get("resourceId").toString());
            String phoneNumber = request.get("phoneNumber").toString();
            BigDecimal amountVal = new BigDecimal(request.get("amount").toString());
            
            TeacherResource resource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new RuntimeException("Resource not found"));

            Map<String, String> mpesaResponse = mpesaService.initiateStkPush(phoneNumber, amountVal);

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setUser(user);
            transaction.setResource(resource);
            transaction.setAmount(amountVal);
            transaction.setPhoneNumber(phoneNumber);
            transaction.setTransactionDate(LocalDateTime.now());
            transaction.setStatus("PENDING");
            transaction.setMerchantRequestId(mpesaResponse.get("MerchantRequestID"));
            transaction.setCheckoutRequestId(mpesaResponse.get("CheckoutRequestID"));

            transactionRepository.save(transaction);

            return ResponseEntity.ok(Map.of(
                "message", "STK Push initiated", 
                "checkoutRequestId", transaction.getCheckoutRequestId()
            ));

        } catch (java.io.IOException e) {
            String errorMsg = e.getMessage();
            return ResponseEntity.status(400).body(errorMsg);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Could not initiate payment.");
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
                    
                    // 1. Grant Access
                    Purchase purchase = new Purchase(transaction.getUser(), transaction.getResource(), LocalDateTime.now());
                    purchase.setPrice(transaction.getResource().getPrice()); 
                    purchaseRepository.save(purchase);

                    // 2. Extract M-Pesa Receipt Number from Metadata
                    String mpesaReceipt = "N/A";
                    try {
                        Map<String, Object> metadata = (Map<String, Object>) stkCallback.get("CallbackMetadata");
                        List<Map<String, Object>> items = (List<Map<String, Object>>) metadata.get("Item");
                        for (Map<String, Object> item : items) {
                            if ("MpesaReceiptNumber".equals(item.get("Name"))) {
                                mpesaReceipt = item.get("Value").toString();
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Could not extract M-Pesa receipt: " + e.getMessage());
                    }

                    // 3. SEND PROFESSIONAL HTML EMAIL
                    sendProfessionalReceipt(transaction.getUser(), transaction.getResource(), mpesaReceipt);
                     // 4. NOTIFY TEACHER 
                    sendTeacherSaleAlert(transaction.getResource().getUser(), transaction.getUser(), transaction.getResource());

                    // 5. SAVE DASHBOARD NOTIFICATION FOR TEACHER
                    notificationRepository.save(new Notification(
                        transaction.getResource().getUser(),
                        "New Sale! " + transaction.getUser().getName() + " purchased your resource '" + transaction.getResource().getTitle() + "'",
                        LocalDateTime.now(),
                        false
                    ));
                    
                } else {
                    transaction.setStatus("FAILED");
                }
                transactionRepository.save(transaction);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    // Helper to extract receipt safely
    private String extractMpesaReceipt(Map<String, Object> stkCallback) {
        try {
            List<Map<String, Object>> items = (List<Map<String, Object>>) ((Map<String, Object>) stkCallback.get("CallbackMetadata")).get("Item");
            for (Map<String, Object> item : items) {
                if ("MpesaReceiptNumber".equals(item.get("Name"))) return item.get("Value").toString();
            }
        } catch (Exception e) { return "N/A"; }
        return "N/A";
    }

    // --- TEACHER EMAIL LOGIC ---
    private void sendTeacherSaleAlert(User teacher, User student, TeacherResource resource) {
        String subject = "New Sale Confirmed: KES " + resource.getPrice();
        
        String htmlContent = 
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; color: #333;'>" +
            "  <div style='text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 10px;'>" +
            "    <h1 style='color: #10b981; margin: 0;'>Masomo Soko</h1>" +
            "    <p style='font-size: 14px; color: #666; font-weight: bold;'>You've made a sale!</p>" +
            "  </div>" +
            "  <div style='padding: 20px 0;'>" +
            "    <p>Hello <strong>" + teacher.getName() + "</strong>,</p>" +
            "    <p>Congratulations! A student has just purchased one of your resources. Your earnings have been updated in your dashboard.</p>" +
            "    <div style='background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #10b981;'>" +
            "      <p style='margin: 5px 0;'><strong>Resource Sold:</strong> " + resource.getTitle() + "</p>" +
            "      <p style='margin: 5px 0;'><strong>Purchased By:</strong> " + student.getName() + "</p>" +
            "      <p style='margin: 5px 0;'><strong>Your Earnings:</strong> KES " + resource.getPrice() + "</p>" +
            "    </div>" +
            "    <div style='text-align: center; margin-top: 30px;'>" +
            "      <a href='https://masomosoko.co.ke/dashboard/teacher' style='background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>View Teacher Dashboard</a>" +
            "    </div>" +
            "  </div>" +
            "  <p style='font-size: 11px; color: #999; text-align: center; margin-top: 40px;'>" +
            "    This is a notification from Masomo Soko." +
            "  </p>" +
            "</div>";

        try {
            emailProducer.sendEmail(teacher.getEmail(), subject, htmlContent);
        } catch (Exception e) {
            System.err.println("Failed to send teacher sale alert: " + e.getMessage());
        }
    }

    private void sendProfessionalReceipt(User user, TeacherResource resource, String receiptNo) {
        String subject = "Receipt for your purchase: " + resource.getTitle();
        
        // Professional HTML Template
        String htmlContent = 
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; color: #333;'>" +
            "  <div style='text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;'>" +
            "    <h1 style='color: #2563eb; margin: 0;'>Masomo Soko</h1>" +
            "    <p style='font-size: 12px; color: #666;'>Empowering Educators, Inspiring Learners</p>" +
            "  </div>" +
            "  <div style='padding: 20px 0;'>" +
            "    <p>Hello <strong>" + user.getName() + "</strong>,</p>" +
            "    <p>Thank you for your purchase! Your payment has been confirmed, and the resource is now available in your library.</p>" +
            "    <div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
            "      <p style='margin: 5px 0;'><strong>Resource:</strong> " + resource.getTitle() + "</p>" +
            "      <p style='margin: 5px 0;'><strong>Price:</strong> KES " + resource.getPrice() + "</p>" +
            "      <p style='margin: 5px 0;'><strong>M-Pesa Receipt:</strong> " + receiptNo + "</p>" +
            "      <p style='margin: 5px 0;'><strong>Date:</strong> " + LocalDateTime.now().toString().substring(0, 10) + "</p>" +
            "    </div>" +
            "    <div style='text-align: center; margin-top: 30px;'>" +
            "      <a href='https://masomosoko.co.ke/dashboard/student' style='background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Access My Resource</a>" +
            "    </div>" +
            "  </div>" +
            "  <p style='font-size: 11px; color: #999; text-align: center; margin-top: 40px;'>" +
            "    This is an automated receipt. If you have any questions, please contact info@masomosoko.co.ke" +
            "  </p>" +
            "</div>";

        try {
            emailProducer.sendEmail(user.getEmail(), subject, htmlContent);
        } catch (Exception e) {
            System.err.println("Failed to send professional email: " + e.getMessage());
        }
    }

    @GetMapping("/status/{checkoutRequestId}")
    public ResponseEntity<?> checkStatus(@PathVariable String checkoutRequestId) {
        PaymentTransaction transaction = transactionRepository.findByCheckoutRequestId(checkoutRequestId).orElse(null);
        if (transaction == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("status", transaction.getStatus()));
    }
}