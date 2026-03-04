package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.service.EmailProducer;
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
import com.eduhub.eduhub_backend.service.FileUploadService;
import com.eduhub.eduhub_backend.service.StudentAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" }, allowCredentials = "true", allowedHeaders = "*")
public class StudentController {

    @Autowired
    private FileUploadService fileUploadService;
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
    @Autowired
    private EmailProducer emailProducer;
    @Autowired
    private StudentAnalyticsService analyticsService;

    private User getAuthenticatedStudent(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getStudentDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User student = getAuthenticatedStudent(userDetails);
            if (student == null) return ResponseEntity.status(401).body("User not found");

            // Log activity for the day whenever dashboard is accessed
            analyticsService.logActivity(student);

            List<Purchase> purchases = purchaseRepository.findByStudent(student);

            int downloads = purchases.size();
            int sessions = 0; // Future roadmap logic
            int wishlist = 0; // Future roadmap logic

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
            
            // Add  Streak and Chart Data
            response.put("streak", analyticsService.getStreakData(student.getId()));
            response.put("activityChart", analyticsService.getChartData(student.getId()));

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
     if ("TEACHER".equals(student.getRole())) {
        return ResponseEntity.status(403).body("Access Denied: Teachers cannot add resources to a library.");
    }

        TeacherResource resource = teacherResourceRepository.findById(resourceId).orElse(null);
        if (resource == null) return ResponseEntity.status(404).body("Resource not found");

        boolean alreadyPurchased = purchaseRepository.findByStudent(student).stream()
                .anyMatch(p -> p.getResource().getId().equals(resourceId));
        if (alreadyPurchased) return ResponseEntity.badRequest().body("Resource already purchased");

        Purchase purchase = new Purchase(student, resource, LocalDateTime.now());
        purchase.setPrice(resource.getPrice());
        purchaseRepository.save(purchase);

        boolean isFree = (resource.getPrice() == null || resource.getPrice() <= 0);

        if (isFree) {
            notificationRepository.save(new Notification(
                    resource.getUser(),
                    "Student " + student.getName() + " added your free resource '" + resource.getTitle() + "' to their library.",
                    LocalDateTime.now(), false));

            try {
                String subject = "New Free Download: " + resource.getTitle();
                String body = "<h3>Hello " + resource.getUser().getName() + ",</h3>" +
                        "<p>A student has just added your free resource <strong>\"" + resource.getTitle() + "\"</strong> to their library.</p>";
                emailProducer.sendEmail(resource.getUser().getEmail(), subject, body);
            } catch (Exception e) { System.err.println("Email failed: " + e.getMessage()); }

        } else {
            notificationRepository.save(new Notification(
                    resource.getUser(),
                    "New Sale! Student " + student.getName() + " purchased '" + resource.getTitle() + "'",
                    LocalDateTime.now(), false));

            try {
                String subject = "New Sale Alert!";
                String body = "<h3>Hello " + resource.getUser().getName() + ",</h3>" +
                        "<p>Congratulations! You have a new sale for <strong>" + resource.getTitle() + "</strong>.</p>";
                emailProducer.sendEmail(resource.getUser().getEmail(), subject, body);
            } catch (Exception e) { System.err.println("Email failed: " + e.getMessage()); }
        }

        return ResponseEntity.ok("Resource added to library");
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

        // Real Activity Logging on download/access
        analyticsService.logActivity(student);

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

        Map<String, Object> settings = new HashMap<>();
        settings.put("name", student.getName());
        settings.put("email", student.getEmail());
        settings.put("profilePicPath", student.getProfilePicPath());

        return ResponseEntity.ok(settings);
    }

    @PostMapping("/account-settings")
    public ResponseEntity<?> updateAccountSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic) {

        User student = getAuthenticatedStudent(userDetails);
        if (student == null) return ResponseEntity.status(401).body("Unauthorized");

        if (name != null && !name.isBlank()) {
            student.setName(name);
        }

        if (profilePic != null && !profilePic.isEmpty()) {
            try {
                String filePath = fileUploadService.uploadFile(profilePic, "profiles");
                student.setProfilePicPath(filePath);
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Failed to upload profile picture");
            }
        }

        userRepository.save(student);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated");
        response.put("profilePicPath", student.getProfilePicPath());
        return ResponseEntity.ok(response);
    }
}