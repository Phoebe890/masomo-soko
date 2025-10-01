package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.Purchase;
import com.eduhub.eduhub_backend.entity.TeacherResource;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.PurchaseRepository;
import com.eduhub.eduhub_backend.repository.TeacherResourceRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import com.eduhub.eduhub_backend.repository.ReviewRepository;
import com.eduhub.eduhub_backend.entity.Review;
import com.eduhub.eduhub_backend.entity.Notification;
import com.eduhub.eduhub_backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class StudentController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeacherResourceRepository teacherResourceRepository;
    @Autowired
    private PurchaseRepository purchaseRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseResource(@RequestParam("email") String email,
            @RequestParam("resourceId") Long resourceId) {
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null || !"STUDENT".equalsIgnoreCase(student.getRole())) {
            return ResponseEntity.status(404).body("Student not found");
        }
        TeacherResource resource = teacherResourceRepository.findById(resourceId).orElse(null);
        if (resource == null) {
            return ResponseEntity.status(404).body("Resource not found");
        }
        // Check if already purchased
        boolean alreadyPurchased = purchaseRepository.findByStudent(student).stream()
                .anyMatch(p -> p.getResource().getId().equals(resourceId));
        if (alreadyPurchased) {
            return ResponseEntity.badRequest().body("Resource already purchased");
        }
        Purchase purchase = new Purchase(student, resource, LocalDateTime.now());
        purchaseRepository.save(purchase);
        // Create notification for teacher
        Notification notification = new Notification(
                resource.getUser(),
                "Student " + student.getName() + " purchased your resource '" + resource.getTitle() + "'",
                LocalDateTime.now(),
                false);
        notificationRepository.save(notification);
        return ResponseEntity.ok("Purchase successful");
    }

    @PostMapping("/review")
    public ResponseEntity<?> submitReview(@RequestParam("email") String email,
            @RequestParam("resourceId") Long resourceId,
            @RequestParam("rating") int rating,
            @RequestParam("comment") String comment) {
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null || !"STUDENT".equalsIgnoreCase(student.getRole())) {
            return ResponseEntity.status(404).body("Student not found");
        }
        TeacherResource resource = teacherResourceRepository.findById(resourceId).orElse(null);
        if (resource == null) {
            return ResponseEntity.status(404).body("Resource not found");
        }
        if (reviewRepository.existsByResourceAndStudent(resource, student)) {
            return ResponseEntity.badRequest().body("You have already reviewed this resource");
        }
        Review review = new Review(resource, student, rating, comment, java.time.LocalDateTime.now());
        reviewRepository.save(review);
        return ResponseEntity.ok("Review submitted");
    }

    @GetMapping("/review/check")
    public ResponseEntity<?> hasReviewed(@RequestParam("email") String email,
            @RequestParam("resourceId") Long resourceId) {
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null || !"STUDENT".equalsIgnoreCase(student.getRole())) {
            return ResponseEntity.status(404).body("Student not found");
        }
        TeacherResource resource = teacherResourceRepository.findById(resourceId).orElse(null);
        if (resource == null) {
            return ResponseEntity.status(404).body("Resource not found");
        }
        boolean exists = reviewRepository.existsByResourceAndStudent(resource, student);
        return ResponseEntity.ok(java.util.Map.of("reviewed", exists));
    }

    @GetMapping("/purchases")
    public ResponseEntity<?> getStudentPurchases(@RequestParam("email") String email) {
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null || !"STUDENT".equalsIgnoreCase(student.getRole())) {
            return ResponseEntity.status(404).body("Student not found");
        }
        var purchases = purchaseRepository.findByStudent(student);
        var resources = purchases.stream()
                .map(p -> new com.eduhub.eduhub_backend.dto.TeacherResourceDTO(p.getResource(),
                        reviewRepository.findByResource(p.getResource())))
                .toList();
        return ResponseEntity.ok(new java.util.HashMap<>() {
            {
                put("resources", resources);
            }
        });
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getStudentDashboard(@RequestParam("email") String email) {
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null || !"STUDENT".equalsIgnoreCase(student.getRole())) {
            return ResponseEntity.status(404).body("Student not found");
        }
        var purchases = purchaseRepository.findByStudent(student);
        var resources = purchases.stream()
                .map(p -> new com.eduhub.eduhub_backend.dto.TeacherResourceDTO(p.getResource())).toList();
        com.eduhub.eduhub_backend.dto.TeacherResourceDTO recentPurchase = resources.isEmpty() ? null
                : resources.get(resources.size() - 1);
        return ResponseEntity.ok(new java.util.HashMap<>() {
            {
                put("student", new java.util.HashMap<>() {
                    {
                        put("name", student.getName());
                        put("firstName", student.getName()); // or split if needed
                        put("avatar", null); // Add avatar if available
                    }
                });
                put("stats", new java.util.HashMap<>() {
                    {
                        put("downloads", resources.size());
                        put("sessions", 0); // Placeholder
                        put("wishlist", 0); // Placeholder
                    }
                });
                put("recentPurchase", recentPurchase);
                // Optionally add orderHistory: put("orderHistory", ...)
            }
        });
    }

    @GetMapping("/download/{resourceId}")
    public ResponseEntity<?> downloadResource(@RequestParam("email") String email, @PathVariable Long resourceId) {
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null || !"STUDENT".equalsIgnoreCase(student.getRole())) {
            return ResponseEntity.status(404).body("Student not found");
        }
        var purchases = purchaseRepository.findByStudent(student);
        boolean hasPurchased = purchases.stream().anyMatch(p -> p.getResource().getId().equals(resourceId));
        if (!hasPurchased) {
            return ResponseEntity.status(403).body("You have not purchased this resource");
        }
        TeacherResource resource = teacherResourceRepository.findById(resourceId).orElse(null);
        if (resource == null) {
            return ResponseEntity.status(404).body("Resource not found");
        }
        java.nio.file.Path filePath = java.nio.file.Paths.get(resource.getFilePath());
        if (!java.nio.file.Files.exists(filePath)) {
            return ResponseEntity.status(404).body("File not found");
        }
        try {
            org.springframework.core.io.Resource fileResource = new org.springframework.core.io.UrlResource(
                    filePath.toUri());
            return org.springframework.http.ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filePath.getFileName().toString() + "\"")
                    .body(fileResource);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to download file");
        }
    }

    @GetMapping("/order-history")
    public ResponseEntity<?> getOrderHistory(@RequestParam("email") String email) {
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null || !"STUDENT".equalsIgnoreCase(student.getRole())) {
            return ResponseEntity.status(404).body("Student not found");
        }
        var purchases = purchaseRepository.findByStudent(student);
        var orders = purchases.stream().map(p -> new java.util.HashMap<String, Object>() {
            {
                put("id", p.getId());
                put("purchasedAt", p.getPurchasedAt());
                put("resource", new com.eduhub.eduhub_backend.dto.TeacherResourceDTO(p.getResource()));
                put("price", p.getResource().getPrice());
            }
        }).toList();
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {
            {
                put("orders", orders);
            }
        });
    }

    @GetMapping("/account-settings")
    public ResponseEntity<?> getAccountSettings(@RequestParam("email") String email) {
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null || !"STUDENT".equalsIgnoreCase(student.getRole())) {
            return ResponseEntity.status(404).body("Student not found");
        }
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {
            {
                put("name", student.getName());
                put("email", student.getEmail());
                // Add more fields as needed
            }
        });
    }

    @PostMapping("/account-settings")
    public ResponseEntity<?> updateAccountSettings(@RequestParam("email") String email,
            @RequestParam("name") String name) {
        User student = userRepository.findByEmail(email).orElse(null);
        if (student == null || !"STUDENT".equalsIgnoreCase(student.getRole())) {
            return ResponseEntity.status(404).body("Student not found");
        }
        student.setName(name);
        userRepository.save(student);
        return ResponseEntity.ok("Account settings updated");
    }
}