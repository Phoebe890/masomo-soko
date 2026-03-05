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
@Autowired private StudentActivityRepository studentActivityRepository;
    // --- 1. DASHBOARD STATS ---
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            long totalUsers = userRepository.count();
            long totalResources = resourceRepository.count();

            double totalVolume = transactionRepository.findAll().stream()
                    .filter(t -> t.getStatus() != null &&
                           ("COMPLETED".equalsIgnoreCase(t.getStatus()) || "SUCCESS".equalsIgnoreCase(t.getStatus())))
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount().doubleValue() : 0.0)
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
            return ResponseEntity.status(500).body("Error calculating stats: " + e.getMessage());
        }
    }

    // --- 2. PAYOUTS MANAGEMENT ---
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
            notificationRepository.save(new Notification(withdrawal.getTeacher(), "Withdrawal of KES " + withdrawal.getAmount() + " processed.", LocalDateTime.now(), false));
            try {
                String subject = "Withdrawal Successful - Masomo Soko";
                String body = "<h3>Hello " + withdrawal.getTeacher().getName() + ",</h3><p>Your withdrawal of <strong>KES " + withdrawal.getAmount() + "</strong> has been processed to M-Pesa.</p>";
                emailProducer.sendEmail(withdrawal.getTeacher().getEmail(), subject, body);
            } catch (Exception e) { System.err.println("Email fail: " + e.getMessage()); }
        } else if ("reject".equals(action)) {
            withdrawal.setStatus("REJECTED");
            teacherProfileRepository.findByUserId(withdrawal.getTeacher().getId()).ifPresent(p -> {
                p.setAccountBalance(p.getAccountBalance() + withdrawal.getAmount());
                teacherProfileRepository.save(p);
            });
        }
        withdrawalRepository.save(withdrawal);
        return ResponseEntity.ok("Payout updated");
    }

    // --- 3. USER MANAGEMENT ---
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Boolean enabled = null;
        if ("ACTIVE".equalsIgnoreCase(status)) enabled = true;
        else if ("BANNED".equalsIgnoreCase(status)) enabled = false;

        String roleFilter = (role != null && !role.equals("ALL")) ? role : null;
        Page<User> userPage = userRepository.searchUsers(search, roleFilter, enabled, pageable);

        return ResponseEntity.ok(userPage.map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("enabled", u.isEnabled());
            return map;
        }));
    }

    @PostMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("enabled", user.isEnabled()));
    }

@DeleteMapping("/users/{id}")
public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    try {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        // 1. DELETE STUDENT ACTIVITIES FIRST 
        studentActivityRepository.deleteByUser(user);

        // 2. Student Cleanup
        transactionRepository.deleteAll(transactionRepository.findByUser(user));
        reviewRepository.deleteAll(reviewRepository.findByStudent(user));
        purchaseRepository.deleteAll(purchaseRepository.findByStudent(user));
        
        // 3. Teacher Resource Cleanup
        List<TeacherResource> resources = resourceRepository.findByUserId(id);
        for (TeacherResource r : resources) {
            transactionRepository.deleteAll(transactionRepository.findByResource(r));
            purchaseRepository.deleteAll(purchaseRepository.findByResource(r));
            reviewRepository.deleteAll(reviewRepository.findByResource(r));
            resourceRepository.delete(r);
        }
        
        // 4. Payouts (Withdrawals) Cleanup
        withdrawalRepository.deleteAll(withdrawalRepository.findByTeacher(user));

        // 5. Notifications Cleanup 
        List<Notification> notes = notificationRepository.findByTeacherOrderByCreatedAtDesc(user);
        notificationRepository.deleteAll(notes);

        // 6. Profile Cleanup
        teacherProfileRepository.findByUserId(id).ifPresent(p -> teacherProfileRepository.delete(p));

        // 7. Finally, delete the User
        userRepository.delete(user);
        
        return ResponseEntity.ok(Map.of("message", "User and all associated data deleted successfully"));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Delete failed: " + e.getMessage());
    }
}
    // --- 4. RESOURCE MANAGEMENT ---
    @GetMapping("/resources")
    public ResponseEntity<?> getAllResources() {
        return ResponseEntity.ok(resourceRepository.findAll().stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("title", r.getTitle());
            map.put("subject", r.getSubject());
            map.put("price", r.getPrice());
            map.put("filePath", r.getFilePath());
            map.put("user", Map.of("name", r.getUser() != null ? r.getUser().getName() : "Unknown"));
            return map;
        }).collect(Collectors.toList()));
    }
@PostMapping("/users/{id}/role")
public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
    try {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String newRole = body.get("role");
        if (newRole == null) return ResponseEntity.badRequest().body("Role is required");
        
        user.setRole(newRole.toUpperCase());
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "User role updated to " + newRole));
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Error updating role: " + e.getMessage());
    }
}
    @PostMapping("/resources/{id}/takedown")
    public ResponseEntity<?> takedownResource(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TeacherResource resource = resourceRepository.findById(id).orElse(null);
        if (resource == null) return ResponseEntity.notFound().build();

        String reason = body.getOrDefault("reason", "Violation of terms");
        notificationRepository.save(new Notification(resource.getUser(), "Resource removed: " + reason, LocalDateTime.now(), false));

        try {
            String subject = "Resource Removed - Masomo Soko";
            String content = "<h3>Hello " + resource.getUser().getName() + ",</h3><p>Your resource <strong>" + resource.getTitle() + "</strong> was removed for: " + reason + "</p>";
            emailProducer.sendEmail(resource.getUser().getEmail(), subject, content);
        } catch (Exception e) { System.err.println("Email fail: " + e.getMessage()); }

        resourceRepository.delete(resource);
        return ResponseEntity.ok("Resource removed");
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        resourceRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}