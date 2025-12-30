package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.dto.TeacherResourceDTO;
import com.eduhub.eduhub_backend.entity.Purchase;
import com.eduhub.eduhub_backend.entity.TeacherResource;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.entity.Review;
import com.eduhub.eduhub_backend.entity.Notification;
import com.eduhub.eduhub_backend.repository.PurchaseRepository;
import com.eduhub.eduhub_backend.repository.TeacherResourceRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import com.eduhub.eduhub_backend.repository.ReviewRepository;
import com.eduhub.eduhub_backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(
    origins = { "http://localhost:5173", "http://localhost:3000" }, 
    allowCredentials = "true",
    allowedHeaders = "*"
)
public class StudentController {

    @Autowired private UserRepository userRepository;
    @Autowired private TeacherResourceRepository teacherResourceRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private NotificationRepository notificationRepository;

    private User getAuthenticatedStudent(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getStudentDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User student = getAuthenticatedStudent(userDetails);
            if (student == null) return ResponseEntity.status(401).body("User not found");

            List<Purchase> purchases = purchaseRepository.findByStudent(student);
            
            int downloads = purchases.size();
            int sessions = 0; 
            int wishlist = 0; 

            double totalSpent = purchases.stream()
                    .mapToDouble(p -> p.getPrice() != null ? p.getPrice() : 0.0)
                    .sum();

            TeacherResourceDTO recentPurchaseDTO = null;
            if (!purchases.isEmpty()) {
                Purchase lastPurchase = purchases.get(purchases.size() - 1);
                recentPurchaseDTO = new TeacherResourceDTO(lastPurchase.getResource());
            }
            
            Map<String, Object> response = new HashMap<>();
            
            Map<String, String> studentInfo = new HashMap<>();
            studentInfo.put("name", student.getName());
            studentInfo.put("email", student.getEmail());
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("downloads", downloads);
            stats.put("sessions", sessions);
            stats.put("wishlist", wishlist);
            stats.put("totalSpent", totalSpent);

            response.put("student", studentInfo);
            response.put("stats", stats);
            response.put("recentPurchase", recentPurchaseDTO);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error loading dashboard");
        }
    }

    @GetMapping("/purchases")
    public ResponseEntity<?> getStudentPurchases(@AuthenticationPrincipal UserDetails userDetails) {
        User student = getAuthenticatedStudent(userDetails);
        if (student == null) return ResponseEntity.status(401).body("Unauthorized");

        List<Purchase> purchases = purchaseRepository.findByStudent(student);
        
        List<TeacherResourceDTO> resources = purchases.stream()
                .map(p -> new TeacherResourceDTO(p.getResource(), reviewRepository.findByResource(p.getResource())))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("resources", resources));
    }

    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("resourceId") Long resourceId) {
        
        User student = getAuthenticatedStudent(userDetails);
        if (student == null) return ResponseEntity.status(401).body("Unauthorized");

        TeacherResource resource = teacherResourceRepository.findById(resourceId).orElse(null);
        if (resource == null) return ResponseEntity.status(404).body("Resource not found");

        boolean alreadyPurchased = purchaseRepository.findByStudent(student).stream()
                .anyMatch(p -> p.getResource().getId().equals(resourceId));
        if (alreadyPurchased) return ResponseEntity.badRequest().body("Resource already purchased");

        Purchase purchase = new Purchase(student, resource, LocalDateTime.now());
        purchase.setPrice(resource.getPrice()); 
        purchaseRepository.save(purchase);

        Notification notification = new Notification(
                resource.getUser(),
                "Student " + student.getName() + " purchased '" + resource.getTitle() + "'",
                LocalDateTime.now(),
                false);
        notificationRepository.save(notification);

        return ResponseEntity.ok("Purchase successful");
    }

    @GetMapping("/download/{resourceId}")
    public ResponseEntity<?> downloadResource(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long resourceId) {
        User student = getAuthenticatedStudent(userDetails);
        if (student == null) return ResponseEntity.status(401).body("Unauthorized");

        List<Purchase> purchases = purchaseRepository.findByStudent(student);
        boolean hasPurchased = purchases.stream().anyMatch(p -> p.getResource().getId().equals(resourceId));
        
        if (!hasPurchased) return ResponseEntity.status(403).body("You have not purchased this resource");

        TeacherResource resource = teacherResourceRepository.findById(resourceId).orElse(null);
        if (resource == null) return ResponseEntity.status(404).body("Resource not found");

        try {
            String fileUrl = resource.getFilePath();
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(fileUrl)).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to retrieve file URL");
        }
    }

    @GetMapping("/order-history")
    public ResponseEntity<?> getOrderHistory(@AuthenticationPrincipal UserDetails userDetails) {
        User student = getAuthenticatedStudent(userDetails);
        if (student == null) return ResponseEntity.status(401).body("Unauthorized");

        List<Purchase> purchases = purchaseRepository.findByStudent(student);
        
        List<Map<String, Object>> orders = purchases.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("purchasedAt", p.getPurchasedAt());
            map.put("price", p.getPrice() != null ? p.getPrice() : p.getResource().getPrice());
            map.put("resource", new TeacherResourceDTO(p.getResource()));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("orders", orders));
    }

    @PostMapping("/review")
    public ResponseEntity<?> submitReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("resourceId") Long resourceId,
            @RequestParam("rating") int rating,
            @RequestParam("comment") String comment) {
        
        User student = getAuthenticatedStudent(userDetails);
        if (student == null) return ResponseEntity.status(401).body("Unauthorized");

        TeacherResource resource = teacherResourceRepository.findById(resourceId).orElse(null);
        if (resource == null) return ResponseEntity.status(404).body("Resource not found");

        if (reviewRepository.existsByResourceAndStudent(resource, student)) {
            return ResponseEntity.badRequest().body("Already reviewed");
        }

        Review review = new Review(resource, student, rating, comment, LocalDateTime.now());
        reviewRepository.save(review);
        return ResponseEntity.ok("Review submitted");
    }

    @GetMapping("/account-settings")
    public ResponseEntity<?> getAccountSettings(@AuthenticationPrincipal UserDetails userDetails) {
        User student = getAuthenticatedStudent(userDetails);
        if (student == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(Map.of("name", student.getName(), "email", student.getEmail()));
    }

    @PostMapping("/account-settings")
    public ResponseEntity<?> updateAccountSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("name") String name) {
        User student = getAuthenticatedStudent(userDetails);
        if (student == null) return ResponseEntity.status(401).body("Unauthorized");
        
        student.setName(name);
        userRepository.save(student);
        return ResponseEntity.ok("Settings updated");
    }
}