package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.*;
import com.eduhub.eduhub_backend.repository.*;
import com.eduhub.eduhub_backend.service.EmailProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
/*
 * NOTE: @CrossOrigin is removed from here.
 * It is now managed centrally in SecurityConfig.java to avoid 403 conflicts.
 */
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private TeacherResourceRepository resourceRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private WithdrawalRepository withdrawalRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private TeacherProfileRepository teacherProfileRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private PaymentTransactionRepository transactionRepository;
    @Autowired private EmailProducer emailProducer;

    // --- 1. DASHBOARD STATS ---
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            long totalUsers = userRepository.count();
            long totalResources = resourceRepository.count();

            // Calculate volume from successful PaymentTransactions
            double totalVolume = transactionRepository.findAll().stream()
                    .filter(t -> t.getStatus() != null &&
                           ("COMPLETED".equalsIgnoreCase(t.getStatus()) || "SUCCESS".equalsIgnoreCase(t.getStatus())))
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount().doubleValue() : 0.0)
                    .sum();

            // Platform Revenue (e.g., 10% commission)
            double platformRevenue = totalVolume * 0.10;

            long pendingPayouts = withdrawalRepository.findAll().stream()
                    .filter(w -> "PENDING".equals(w.getStatus()))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalResources", totalResources);
            stats.put("totalVolume", totalVolume);
            stats.put("platformRevenue", platformRevenue);
            stats.put("pendingPayouts", pendingPayouts);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error calculating admin stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error calculating stats: " + e.getMessage());
        }
    }

   // --- 2. PAYOUTS MANAGEMENT ---
    @PostMapping("/payouts/{id}/{action}")
    public ResponseEntity<?> processPayout(@PathVariable Long id, @PathVariable String action) {
        Withdrawal withdrawal = withdrawalRepository.findById(id).orElse(null);
        if (withdrawal == null) return ResponseEntity.notFound().build();

        if ("approve".equals(action)) {
            withdrawal.setStatus("PAID");
            notificationRepository.save(new Notification(
                    withdrawal.getTeacher(),
                    "Withdrawal of KES " + withdrawal.getAmount() + " has been processed.",
                    LocalDateTime.now(), false));

            try {
                // PROFESSIONAL EMAIL FOR APPROVAL
                String subject = "Withdrawal Successful - Masomo Soko";
                String body = "<h3>Hello " + withdrawal.getTeacher().getName() + ",</h3>" +
                              "<p>Good news! Your withdrawal request of <strong>KES " + withdrawal.getAmount() + "</strong> has been processed successfully.</p>" +
                              "<p>The funds have been sent to your registered M-Pesa number. Thank you for your valuable contribution to the Masomo Soko community.</p>";
                
                emailProducer.sendEmail(withdrawal.getTeacher().getEmail(), subject, body);
            } catch (Exception e) {
                System.err.println("CRITICAL: Failed to queue email for payout confirmation (ID: " + id + "): " + e.getMessage());
            }

        } else if ("reject".equals(action)) {
            withdrawal.setStatus("REJECTED");
            TeacherProfile profile = teacherProfileRepository.findByUserId(withdrawal.getTeacher().getId()).orElse(null);
            if (profile != null) {
                profile.setAccountBalance(profile.getAccountBalance() + withdrawal.getAmount());
                teacherProfileRepository.save(profile);
            }

             try {
                // PROFESSIONAL EMAIL FOR REJECTION
                String subject = "Withdrawal Request Update - Masomo Soko";
                String body = "<h3>Hello " + withdrawal.getTeacher().getName() + ",</h3>" +
                              "<p>We were unable to process your withdrawal request of <strong>KES " + withdrawal.getAmount() + "</strong> at this time.</p>" +
                              "<p>The amount has been returned to your account balance. If you believe this is an error or need further clarification, please reply to this email or contact support.</p>";
                
                emailProducer.sendEmail(withdrawal.getTeacher().getEmail(), subject, body);
            } catch (Exception e) {
                System.err.println("CRITICAL: Failed to queue email for payout rejection (ID: " + id + "): " + e.getMessage());
            }
        }

        withdrawalRepository.save(withdrawal);
        return ResponseEntity.ok("Payout status updated");
    }

    // --- 5. RESOURCE MANAGEMENT (Takedown) ---
    @PostMapping("/resources/{id}/takedown")
    public ResponseEntity<?> takedownResource(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TeacherResource resource = resourceRepository.findById(id).orElse(null);
        if (resource == null) return ResponseEntity.notFound().build();

        String reason = body.getOrDefault("reason", "Violation of platform terms and conditions");
        notificationRepository.save(new Notification(resource.getUser(), "Resource removed: " + reason, LocalDateTime.now(), false));

        try {
            // PROFESSIONAL EMAIL FOR TAKEDOWN
            String subject = "Resource Removal Notification - Masomo Soko";
            String body = "<h3>Hello " + resource.getUser().getName() + ",</h3>" +
                          "<p>We are writing to inform you that your resource titled <strong>\"" + resource.getTitle() + "\"</strong> has been removed from Masomo Soko.</p>" +
                          "<p><strong>Reason for removal:</strong> " + reason + "</p>" +
                          "<p>If you have questions regarding this action, please reach out to our administrative team.</p>";
            
            emailProducer.sendEmail(resource.getUser().getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to queue email for resource takedown (Resource ID: " + id + "): " + e.getMessage());
        }

        resourceRepository.delete(resource);
        return ResponseEntity.ok("Resource removed");
    }