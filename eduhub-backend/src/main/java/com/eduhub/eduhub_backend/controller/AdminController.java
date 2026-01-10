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
            } catch (Exception e) {
                // **ADDED ERROR LOGGING HERE**
                System.err.println("CRITICAL: Failed to queue email for payout confirmation (ID: " + id + "): " + e.getMessage());
                e.printStackTrace();
                // Decide if you want to return an error or just log and continue
            }

        } else if ("reject".equals(action)) {
            withdrawal.setStatus("REJECTED");
            TeacherProfile profile = teacherProfileRepository.findByUserId(withdrawal.getTeacher().getId()).orElse(null);
            if (profile != null) {
                profile.setAccountBalance(profile.getAccountBalance() + withdrawal.getAmount());
                teacherProfileRepository.save(profile);
            }
            // Optionally send an email about rejection
             try {
                emailProducer.sendEmail(
                    withdrawal.getTeacher().getEmail(),
                    "Payout Rejected - EduHub",
                    "Your withdrawal request of KES " + withdrawal.getAmount() + " has been rejected. Please contact support for details."
                );
            } catch (Exception e) {
                // **ADDED ERROR LOGGING HERE**
                System.err.println("CRITICAL: Failed to queue email for payout rejection (ID: " + id + "): " + e.getMessage());
                e.printStackTrace();
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

            // --- 1. CLEANUP AS STUDENT (Buying/Paying) ---
            
            // Delete Transactions made BY this user
            List<PaymentTransaction> userTransactions = transactionRepository.findByUser(user);
            transactionRepository.deleteAll(userTransactions);

            // Delete Reviews written BY this user
            List<Review> reviewsWritten = reviewRepository.findByStudent(user);
            reviewRepository.deleteAll(reviewsWritten);

            // Delete Purchases made BY this user
            List<Purchase> purchasesMade = purchaseRepository.findByStudent(user);
            purchaseRepository.deleteAll(purchasesMade);

            // --- 2. CLEANUP AS TEACHER (Selling/Receiving) ---

            // Delete Withdrawals
            List<Withdrawal> withdrawals = withdrawalRepository.findAll().stream()
                    .filter(w -> w.getTeacher().getId().equals(id))
                    .collect(Collectors.toList());
            withdrawalRepository.deleteAll(withdrawals);

            // Handle Resources owned by this user
            List<TeacherResource> resources = resourceRepository.findByUserId(id);
            for (TeacherResource resource : resources) {
                // A. Delete Transactions linked to this resource (CRITICAL FIX)
                List<PaymentTransaction> resourceTransactions = transactionRepository.findByResource(resource);
                transactionRepository.deleteAll(resourceTransactions);

                // B. Delete Sales (Purchases) of this resource
                List<Purchase> sales = purchaseRepository.findByResource(resource);
                purchaseRepository.deleteAll(sales);

                // C. Delete Reviews of this resource
                List<Review> resourceReviews = reviewRepository.findByResource(resource);
                reviewRepository.deleteAll(resourceReviews);
                
                // D. Finally, Delete the Resource
                resourceRepository.delete(resource);
            }

            // Delete Teacher Profile
            teacherProfileRepository.findByUserId(id).ifPresent(p -> teacherProfileRepository.delete(p));

            // --- 3. FINAL CLEANUP ---

            // Delete Notifications
            List<Notification> notifications = notificationRepository.findAll().stream()
                    .filter(n -> n.getTeacher().getId().equals(id))
                    .collect(Collectors.toList());
            notificationRepository.deleteAll(notifications);

            // Delete User
            userRepository.delete(user);
            
            return ResponseEntity.ok("User and all related data deleted successfully");
            
        } catch (Exception e) {
            System.err.println("CRITICAL: Error deleting user (ID: " + id + "): " + e.getMessage());
            e.printStackTrace(); 
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
            // You must send these fields for the frontend to view the file/image
            map.put("filePath", r.getFilePath()); 
            map.put("coverImageUrl", r.getCoverImageUrl());
            map.put("curriculum", r.getCurriculum()); // Helpful for display too
            

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

        // **ADD ERROR LOGGING FOR EMAIL**
        try {
            emailProducer.sendEmail(
                resource.getUser().getEmail(),
                "Resource Removed - EduHub",
                "Your resource titled '" + resource.getTitle() + "' has been removed due to: " + reason
            );
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to queue email for resource takedown (Resource ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
        }

        resourceRepository.delete(resource);
        return ResponseEntity.ok("Resource removed");
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        try {
            resourceRepository.deleteById(id);
            return ResponseEntity.ok("Deleted");
        } catch (Exception e) {
            System.err.println("Error deleting resource (ID: " + id + "): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Delete failed: " + e.getMessage());
        }
    }
}