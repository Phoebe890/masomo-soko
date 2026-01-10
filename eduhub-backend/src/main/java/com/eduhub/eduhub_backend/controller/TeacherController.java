package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.dto.TeacherResourceDTO;
import com.eduhub.eduhub_backend.entity.*;
import com.eduhub.eduhub_backend.repository.*;
import com.eduhub.eduhub_backend.service.FileUploadService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(
    origins = { "http://localhost:5173", "http://localhost:3000", "https://masomosoko.co.ke", "https://www.masomosoko.co.ke" }, 
    allowCredentials = "true",
    allowedHeaders = "*"
)
public class TeacherController {

    @Autowired private FileUploadService fileUploadService;
    @Autowired private TeacherProfileRepository teacherProfileRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TeacherResourceRepository teacherResourceRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private NotificationRepository notificationRepository;

    // Helper to ensure profile exists
    private TeacherProfile getOrCreateProfile(User user) {
        return teacherProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    TeacherProfile newProfile = new TeacherProfile();
                    newProfile.setUser(user);
                    return teacherProfileRepository.save(newProfile);
                });
    }

    // --- 1. DASHBOARD (Includes Notifications) ---
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId()).orElse(null);
            
            // A. Fetch Resources
            List<TeacherResource> resources = teacherResourceRepository.findByUserId(user.getId());
            if (resources == null) resources = new ArrayList<>();

            // B. Calculate Stats (Sales & Balance)
            long totalSales = 0;
            Double currentBalance = 0.0;

            if (!resources.isEmpty()) {
                try {
                    List<Long> resourceIds = resources.stream().map(TeacherResource::getId).toList();
                    if(!resourceIds.isEmpty()) {
                        totalSales = purchaseRepository.countByResourceIdIn(resourceIds);
                        Double bal = purchaseRepository.sumPriceByResourceIdIn(resourceIds);
                        currentBalance = (bal != null) ? bal : 0.0;
                    }
                } catch (Exception e) { e.printStackTrace(); }
            }

            // C. Convert to DTOs (including reviews)
            List<TeacherResourceDTO> resourceDtos = resources.stream().map(res -> {
                List<Review> reviews = reviewRepository.findByResource(res);
                return new TeacherResourceDTO(res, reviews);
            }).collect(Collectors.toList());

            // D. CRITICAL: Fetch Notifications for this teacher
            List<Notification> notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(user);

            // E. Build Response
            Map<String, Object> response = new HashMap<>();
            response.put("resources", resourceDtos);
            response.put("totalSales", totalSales);
            response.put("currentBalance", currentBalance);
            response.put("profile", profile);
            response.put("notifications", notifications); // <--- Sent to frontend

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // --- 2. ONBOARDING ---
    @PostMapping("/onboarding")
    public ResponseEntity<?> onboarding(
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
            @RequestParam("bio") String bio,
            @RequestParam("subjects") String subjectsJson,
            @RequestParam("grades") String gradesJson,
            @RequestParam(value = "paymentNumber", required = false) String paymentNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired");

            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherProfile profile = getOrCreateProfile(user);

            ObjectMapper mapper = new ObjectMapper();
            List<String> subjects = new ArrayList<>();
            try { if(subjectsJson != null && !subjectsJson.isEmpty()) subjects = mapper.readValue(subjectsJson, new TypeReference<List<String>>(){}); } catch(Exception e){}
            
            List<String> grades = new ArrayList<>();
            try { if(gradesJson != null && !gradesJson.isEmpty()) grades = mapper.readValue(gradesJson, new TypeReference<List<String>>(){}); } catch(Exception e){}

            profile.setBio(bio);
            profile.setSubjects(subjects);
            profile.setGrades(grades);
            
            if (paymentNumber != null && !paymentNumber.isEmpty()) {
                profile.setPaymentNumber(paymentNumber);
            }

            if (profilePic != null && !profilePic.isEmpty()) {
                Map uploadResult = fileUploadService.uploadFile(profilePic);
                profile.setProfilePicPath((String) uploadResult.get("secure_url"));
            }

            teacherProfileRepository.save(profile);
            return ResponseEntity.ok("Profile updated");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed: " + e.getMessage());
        }
    }

    // --- 3. GET SETTINGS ---
    @GetMapping("/settings")
    public ResponseEntity<?> getTeacherSettings(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherProfile profile = teacherProfileRepository.findByUserId(currentUser.getId()).orElse(null);
            
            boolean isZoomConnected = currentUser.getZoomAccessToken() != null && !currentUser.getZoomAccessToken().isEmpty();

            Map<String, Object> responseData = new HashMap<>();
            Map<String, String> userData = new HashMap<>();
            userData.put("name", currentUser.getName());
            userData.put("email", currentUser.getEmail());
            
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("user", userData);
            
            if (profile != null) {
                profileData.put("bio", profile.getBio());
                profileData.put("subjects", profile.getSubjects());
                profileData.put("grades", profile.getGrades());
                profileData.put("paymentNumber", profile.getPaymentNumber());
                profileData.put("profilePicPath", profile.getProfilePicPath()); 
            }

            responseData.put("profile", profileData);
            responseData.put("isZoomConnected", isZoomConnected);
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching settings");
        }
    }

    // --- 4. UPLOAD RESOURCE ---
    @PostMapping("/resources")
    public ResponseEntity<?> uploadResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("subject") String subject,
            @RequestParam("grade") String grade,
            @RequestParam("curriculum") String curriculum,
            @RequestParam("pricing") String pricing,
            @RequestParam(value = "price", required = false) Double price,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            
            TeacherResource resource = new TeacherResource();
            resource.setTitle(title);
            resource.setDescription(description);
            resource.setSubject(subject);
            resource.setGrade(grade);
            resource.setCurriculum(curriculum);
            resource.setPricing(pricing);
            resource.setPrice(price);
            resource.setUser(user);
            resource.setPreviewEnabled(true);

            Map uploadResult = fileUploadService.uploadFile(file);
            resource.setFilePath((String) uploadResult.get("secure_url"));
            
            if (thumbnail != null && !thumbnail.isEmpty()) {
                Map thumbResult = fileUploadService.uploadFile(thumbnail);
                resource.setCoverImageUrl((String) thumbResult.get("secure_url"));
                resource.setHasPreview(true);
            } else {
                resource.setHasPreview(fileUploadService.generatePreviewImageUrl(uploadResult) != null);
            }

            teacherResourceRepository.save(resource);
            return ResponseEntity.ok("Uploaded successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // --- 5. UPDATE RESOURCE (Using POST for Stability) ---
    @PostMapping("/resources/update/{id}")
    public ResponseEntity<?> updateResource(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("subject") String subject,
            @RequestParam("grade") String grade,
            @RequestParam("curriculum") String curriculum,
            @RequestParam("pricing") String pricing,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);

            if (resource == null) return ResponseEntity.status(404).body("Resource not found");
            
            // Check ownership
            if (!resource.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Not authorized");
            }

            resource.setTitle(title);
            resource.setDescription(description);
            resource.setSubject(subject);
            resource.setGrade(grade);
            resource.setCurriculum(curriculum);
            resource.setPricing(pricing);
            resource.setPrice(price);

            if (file != null && !file.isEmpty()) {
                Map uploadResult = fileUploadService.uploadFile(file);
                resource.setFilePath((String) uploadResult.get("secure_url"));
            }

            if (thumbnail != null && !thumbnail.isEmpty()) {
                Map thumbResult = fileUploadService.uploadFile(thumbnail);
                resource.setCoverImageUrl((String) thumbResult.get("secure_url"));
            }

            teacherResourceRepository.save(resource);
            return ResponseEntity.ok("Updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating resource: " + e.getMessage());
        }
    }

    // --- 6. DELETE RESOURCE ---
    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);

            if (resource == null) return ResponseEntity.status(404).body("Resource not found");
            if (!resource.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Not authorized");
            }

            teacherResourceRepository.delete(resource);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting resource");
        }
    }
    
    // --- 7. ANALYTICS ---
    @GetMapping("/analytics")
    public ResponseEntity<?> getTeacherAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        List<TeacherResource> resources = teacherResourceRepository.findByUserId(user.getId());
        List<Long> resourceIds = resources.stream().map(TeacherResource::getId).collect(Collectors.toList());
        List<Purchase> purchases = resourceIds.isEmpty() ? List.of() : purchaseRepository.findByResourceIdIn(resourceIds);

        Map<LocalDate, Long> salesLast30Days = new HashMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) salesLast30Days.put(today.minusDays(i), 0L);
        for (Purchase p : purchases) {
            LocalDate date = p.getPurchasedAt().toLocalDate();
            salesLast30Days.computeIfPresent(date, (k, v) -> v + 1);
        }

        return ResponseEntity.ok(Map.of("salesLast30Days", salesLast30Days, "totalSales", purchases.size()));
    }
     // --- NEW ENDPOINT: GET NOTIFICATIONS ONLY ---
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            
            // Fetch notifications
            List<Notification> notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(user);
            
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching notifications");
        }
    }
    
    // --- NEW ENDPOINT: MARK NOTIFICATION AS READ ---
    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            Notification n = notificationRepository.findById(id).orElse(null);
            if (n != null) {
                n.setRead(true);
                notificationRepository.save(n);
            }
            return ResponseEntity.ok("Marked as read");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error");
        }
    }

    // --- 8. PAYOUT SETUP ---
    @PostMapping("/payout")
    public ResponseEntity<?> setupPayout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("method") String method,
            @RequestParam(value = "mpesa", required = false) String mpesa) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherProfile profile = getOrCreateProfile(user);

            if ("mpesa".equals(method)) {
                if(mpesa == null || mpesa.isEmpty()) return ResponseEntity.badRequest().body("M-Pesa number required");
                profile.setPaymentNumber(mpesa);
            }
            
            teacherProfileRepository.save(profile);
            return ResponseEntity.ok("Payout details saved");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}