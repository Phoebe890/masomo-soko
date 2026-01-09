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
            notificationRepository.save(new Notification(
                    withdrawal.getTeacher(),
                    "Withdrawal of KES " + withdrawal.getAmount() + " has been processed.",
                    LocalDateTime.now(), false));
            
            try {
                emailProducer.sendEmail(
                    withdrawal.getTeacher().getEmail(), 
                    "Payout Processed - EduHub", 
                    "Your withdrawal request of KES " + withdrawal.getAmount() + " was successful."
                );
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
        return ResponseEntity.ok("Payout status updated");
    }

    // --- 3. USER MANAGEMENT (PAGINATED & FILTERED) ---
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        
        Boolean enabled = null;
        if ("ACTIVE".equalsIgnoreCase(status)) enabled = true;
        else if ("BANNED".equalsIgnoreCase(status)) enabled = false;

        String roleFilter = (role != null && !role.equals("ALL")) ? role : null;
        String searchFilter = (search != null && !search.isEmpty()) ? search : null;

        // Custom repository method: searchUsers(search, role, enabled, pageable)
        Page<User> userPage = userRepository.searchUsers(searchFilter, roleFilter, enabled, pageable);
        
        Page<Map<String, Object>> dtoPage = userPage.map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("enabled", u.isEnabled());
            return map;
        });

        return ResponseEntity.ok(dtoPage);
    }

    // --- 4. USER ACTIONS (BAN, ROLE, DELETE) ---
    @PostMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("enabled", user.isEnabled()));
    }

    @PostMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        String newRole = body.get("role").toUpperCase();
        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok("Role updated");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) return ResponseEntity.notFound().build();

            // Cascade deletes manually for related entities
            teacherProfileRepository.findByUserId(id).ifPresent(p -> teacherProfileRepository.delete(p));
            List<TeacherResource> resources = resourceRepository.findByUserId(id);
            if (!resources.isEmpty()) resourceRepository.deleteAll(resources);
            
            userRepository.delete(user);
            return ResponseEntity.ok("User deleted");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Delete failed: " + e.getMessage());
        }
    }

    // --- 5. RESOURCE MANAGEMENT ---
    @GetMapping("/resources")
    public ResponseEntity<?> getAllResources() {
        List<TeacherResource> resources = resourceRepository.findAll();
        List<Map<String, Object>> result = resources.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("title", r.getTitle());
            map.put("subject", r.getSubject());
            map.put("price", r.getPrice());
            map.put("user", Map.of("name", r.getUser() != null ? r.getUser().getName() : "Unknown"));
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/resources/{id}/takedown")
    public ResponseEntity<?> takedownResource(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TeacherResource resource = resourceRepository.findById(id).orElse(null);
        if (resource == null) return ResponseEntity.notFound().build();

        String reason = body.getOrDefault("reason", "Violation of terms");
        // Notify and delete
        notificationRepository.save(new Notification(resource.getUser(), "Resource removed: " + reason, LocalDateTime.now(), false));
        resourceRepository.delete(resource);
        return ResponseEntity.ok("Resource removed");
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        resourceRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}