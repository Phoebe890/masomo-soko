package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.*;
import com.eduhub.eduhub_backend.repository.*;
import com.eduhub.eduhub_backend.service.EmailProducer;
import org.springframework.beans.factory.annotation.Autowired;
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
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private TeacherResourceRepository resourceRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private WithdrawalRepository withdrawalRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private TeacherProfileRepository teacherProfileRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private PaymentTransactionRepository transactionRepository; // Added this
    @Autowired private EmailProducer emailProducer;

    // 1. DASHBOARD STATS
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            long totalUsers = userRepository.count();
            long totalResources = resourceRepository.count();

            double totalVolume = purchaseRepository.findAll().stream()
                    .mapToDouble(p -> p.getPrice() != null ? p.getPrice() : 0.0)
                    .sum();

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
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error calculating stats");
        }
    }

    // 2. PAYOUTS
    @GetMapping("/payouts")
    public ResponseEntity<?> getAllWithdrawals() {
        List<Withdrawal> withdrawals = withdrawalRepository.findAll(Sort.by(Sort.Direction.DESC, "requestedAt"));
        List<Map<String, Object>> result = withdrawals.stream().map(w -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", w.getId());
            map.put("teacherName", w.getTeacher().getName());
            map.put("amount", w.getAmount());
            map.put("mpesaNumber", w.getMpesaNumber());
            map.put("status", w.getStatus());
            map.put("date", w.getRequestedAt());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/payouts/{id}/{action}")
    public ResponseEntity<?> processPayout(@PathVariable Long id, @PathVariable String action) {
        Withdrawal withdrawal = withdrawalRepository.findById(id).orElse(null);
        if (withdrawal == null) return ResponseEntity.notFound().build();

        if ("approve".equals(action)) {
            withdrawal.setStatus("PAID");
            notificationRepository.save(new Notification(
                    withdrawal.getTeacher(),
                    "Withdrawal of KES " + withdrawal.getAmount() + " sent successfully.",
                    LocalDateTime.now(), false));
            try {
                emailProducer.sendEmail(withdrawal.getTeacher().getEmail(), "Payout Processed", "Your withdrawal has been processed.");
            } catch (Exception e) {}
            
        } else if ("reject".equals(action)) {
            withdrawal.setStatus("REJECTED");
            TeacherProfile profile = teacherProfileRepository.findByUserId(withdrawal.getTeacher().getId()).orElse(null);
            if (profile != null) {
                profile.setAccountBalance(profile.getAccountBalance() + withdrawal.getAmount());
                teacherProfileRepository.save(profile);
            }
        }
        withdrawalRepository.save(withdrawal);
        return ResponseEntity.ok("Updated");
    }

    // 3. USER MANAGEMENT (LIST)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("enabled", u.isEnabled());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

   // 4. USER MANAGEMENT (BAN/UNBAN WITH EMAIL)
    @PostMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        boolean newStatus = !user.isEnabled();
        user.setEnabled(newStatus);
        userRepository.save(user);

        // --- SEND EMAIL NOTIFICATION ---
        try {
            String subject = newStatus ? "Account Activated - EduHub" : "Account Suspended - EduHub";
            String body = newStatus 
                ? "Hello " + user.getName() + ",\n\nYour account has been reactivated. You can now log in."
                : "Hello " + user.getName() + ",\n\nYour account has been suspended by the administrator due to a violation of our terms. Please contact support for more information.";
            
            emailProducer.sendEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send ban/unban email: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "message", "User status updated",
                "enabled", user.isEnabled()));
    }
    // 5. USER MANAGEMENT (CHANGE ROLE)
    @PostMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        String newRole = body.get("role").toUpperCase();
        if (!List.of("STUDENT", "TEACHER", "ADMIN").contains(newRole)) return ResponseEntity.badRequest().body("Invalid Role");

        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok("Role updated");
    }

    // 6. DELETE USER (CLEANUP ALL DEPENDENCIES)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) return ResponseEntity.notFound().build();

            // A. Clean up TEACHER Data
            TeacherProfile profile = teacherProfileRepository.findByUserId(id).orElse(null);
            if (profile != null) teacherProfileRepository.delete(profile);

            List<TeacherResource> resources = resourceRepository.findByUserId(id);
            if (resources != null && !resources.isEmpty()) {
                resourceRepository.deleteAll(resources);
            }
            
            // B. Clean up STUDENT Data (Purchases & Reviews)
            List<Purchase> purchases = purchaseRepository.findByStudent(user);
            if (purchases != null && !purchases.isEmpty()) purchaseRepository.deleteAll(purchases);
            
            List<Review> reviews = reviewRepository.findByStudent(user);
            if (reviews != null && !reviews.isEmpty()) reviewRepository.deleteAll(reviews);
            
            // C. Clean up WITHDRAWALS
            List<Withdrawal> withdrawals = withdrawalRepository.findByTeacherOrderByRequestedAtDesc(user);
            if (withdrawals != null && !withdrawals.isEmpty()) withdrawalRepository.deleteAll(withdrawals);

            // D. Clean up PAYMENT TRANSACTIONS (As Student)
            List<PaymentTransaction> studentTxns = transactionRepository.findByStudent(user);
            if (studentTxns != null && !studentTxns.isEmpty()) transactionRepository.deleteAll(studentTxns);

            // E. Finally Delete User
            userRepository.delete(user);
            
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.status(500).body("Failed to delete user: " + e.getMessage());
        }
    }

    // 7. CONTENT MODERATION (LIST)
    @GetMapping("/resources")
    public ResponseEntity<?> getAllResources() {
        List<TeacherResource> resources = resourceRepository.findAll();
        List<Map<String, Object>> result = resources.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("title", r.getTitle());
            map.put("subject", r.getSubject());
            map.put("price", r.getPrice());
            map.put("filePath", r.getFilePath());
            map.put("previewImageUrl", r.getPreviewImageUrl());
            
            if (r.getUser() != null) {
                Map<String, String> userMap = new HashMap<>();
                userMap.put("name", r.getUser().getName());
                map.put("user", userMap);
            } else {
                map.put("user", Map.of("name", "Unknown"));
            }
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // 8. CONTENT MODERATION (TAKEDOWN)
    @PostMapping("/resources/{id}/takedown")
    public ResponseEntity<?> takedownResource(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            TeacherResource resource = resourceRepository.findById(id).orElse(null);
            if (resource == null) return ResponseEntity.notFound().build();

            String reason = body.getOrDefault("reason", "Violation of terms");
            User teacher = resource.getUser();

            Notification notif = new Notification(
                teacher,
                "URGENT: Your resource '" + resource.getTitle() + "' was removed. Reason: " + reason,
                LocalDateTime.now(),
                false
            );
            notificationRepository.save(notif);

            try {
                emailProducer.sendEmail(
                    teacher.getEmail(),
                    "Resource Removed",
                    "Your resource '" + resource.getTitle() + "' was removed. Reason: " + reason
                );
            } catch (Exception e) {}

            resourceRepository.delete(resource);
            return ResponseEntity.ok("Removed");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        resourceRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}