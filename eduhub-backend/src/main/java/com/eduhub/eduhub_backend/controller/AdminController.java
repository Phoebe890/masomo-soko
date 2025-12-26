package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.*;
import com.eduhub.eduhub_backend.repository.*;
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

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeacherResourceRepository resourceRepository;
    @Autowired
    private PurchaseRepository purchaseRepository;
    @Autowired
    private WithdrawalRepository withdrawalRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private TeacherProfileRepository teacherProfileRepository;

    // 1. DASHBOARD STATS
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            long totalUsers = userRepository.count();
            long totalResources = resourceRepository.count();

            // Fix NPE by checking for null price
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
            return ResponseEntity.status(500).body("Error calculating stats: " + e.getMessage());
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
        if (withdrawal == null)
            return ResponseEntity.notFound().build();

        if ("approve".equals(action)) {
            withdrawal.setStatus("PAID");
            notificationRepository.save(new Notification(
                    withdrawal.getTeacher(),
                    "Withdrawal of KES " + withdrawal.getAmount() + " sent successfully.",
                    LocalDateTime.now(), false));
        } else if ("reject".equals(action)) {
            withdrawal.setStatus("REJECTED");
            // Ideally refund the balance here
        }
        withdrawalRepository.save(withdrawal);
        return ResponseEntity.ok("Updated");
    }

    // 3. USER MANAGEMENT
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "User status updated",
                "enabled", user.isEnabled()));
    }

    // 6. DELETE USER (Hard Delete)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null)
                return ResponseEntity.notFound().build();

            // Delete Profile if Teacher
            TeacherProfile profile = teacherProfileRepository.findByUserId(id).orElse(null);
            if (profile != null)
                teacherProfileRepository.delete(profile);

            // Delete User
            userRepository.delete(user);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete user: " + e.getMessage());
        }
    }

    // 4. CHANGE ROLE
    @PostMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();

        String newRole = body.get("role").toUpperCase(); // Ensure uppercase (STUDENT, TEACHER)

        // Validation
        if (!List.of("STUDENT", "TEACHER", "ADMIN").contains(newRole)) {
            return ResponseEntity.badRequest().body("Invalid Role");
        }

        // Prevent banning yourself or demoting the last Admin (Optional safety)
        if ("ADMIN".equals(user.getRole()) && "STUDENT".equals(newRole)) {
            // Logic to prevent removing the main admin could go here
        }

        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok("Role updated to " + newRole);
    }

    // 5. CONTENT MODERATION
    @GetMapping("/resources")
    public ResponseEntity<?> getAllResources() {
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        resourceRepository.deleteById(id);
        return ResponseEntity.ok("Resource deleted");
    }
}