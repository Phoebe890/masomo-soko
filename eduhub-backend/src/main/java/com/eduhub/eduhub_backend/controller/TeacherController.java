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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(
    origins = { "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000" }, 
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

    private TeacherProfile getOrCreateProfile(User user) {
        return teacherProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    TeacherProfile newProfile = new TeacherProfile();
                    newProfile.setUser(user);
                    return teacherProfileRepository.save(newProfile);
                });
    }

    // --- ONBOARDING (FIXED NULL POINTER EXCEPTION) ---
    @PostMapping("/onboarding")
    public ResponseEntity<?> onboarding(
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
            @RequestParam("bio") String bio,
            @RequestParam("subjects") String subjectsJson,
            @RequestParam("grades") String gradesJson,
            @RequestParam(value = "paymentNumber", required = false) String paymentNumber,
            @AuthenticationPrincipal UserDetails userDetails) { // <--- This was null
        try {
            // 1. CHECK IF USER IS AUTHENTICATED
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired or user not logged in. Please login again.");
            }

            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherProfile profile = getOrCreateProfile(user);

            ObjectMapper mapper = new ObjectMapper();
            List<String> subjects = new ArrayList<>();
            try { if(subjectsJson != null && !subjectsJson.isEmpty()) subjects = mapper.readValue(subjectsJson, new TypeReference<List<String>>(){}); } catch(Exception e){}
            
            List<String> grades = new ArrayList<>();
            try { if(gradesJson != null && !gradesJson.isEmpty()) grades = mapper.readValue(gradesJson, new TypeReference<List<String>>(){}); } catch(Exception e){}

            if (profilePic != null && !profilePic.isEmpty()) {
                Map uploadResult = fileUploadService.uploadFile(profilePic);
                profile.setProfilePicPath((String) uploadResult.get("secure_url"));
            }

            profile.setBio(bio);
            profile.setSubjects(subjects);
            profile.setGrades(grades);
            
            if (paymentNumber != null && !paymentNumber.isEmpty()) {
                profile.setPaymentNumber(paymentNumber);
            }
            
            teacherProfileRepository.save(profile);
            return ResponseEntity.ok("Profile updated");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed: " + e.getMessage());
        }
    }

    // ... (Keep other methods: uploadResource, setupPayout, getDashboard, etc.) ...
    
    // For completeness, here is the corrected setupPayout as well
    @PostMapping("/payout")
    public ResponseEntity<?> setupPayout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("method") String method,
            @RequestParam(value = "mpesa", required = false) String mpesa,
            @RequestParam(value = "bank", required = false) String bank,
            @RequestParam(value = "account", required = false) String account) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherProfile profile = getOrCreateProfile(user);

            if ("mpesa".equals(method)) {
                if(mpesa == null || mpesa.isEmpty()) return ResponseEntity.badRequest().body("M-Pesa number required");
                profile.setPaymentNumber(mpesa);
            } 
            else if ("bank".equals(method)) {
                if(bank == null || account == null) return ResponseEntity.badRequest().body("Bank details required");
                profile.setPaymentNumber(bank + ":" + account);
            }
            
            teacherProfileRepository.save(profile);
            return ResponseEntity.ok("Payout details saved successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving payout: " + e.getMessage());
        }
    }
    
    // ... Keep the rest of your existing methods ...
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
    
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId()).orElse(null);
            List<TeacherResource> resources = teacherResourceRepository.findByUserId(user.getId());
            if (resources == null) resources = new ArrayList<>();

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

            List<TeacherResourceDTO> resourceDtos = resources.stream().map(res -> {
                List<Review> reviews = reviewRepository.findByResource(res);
                return new TeacherResourceDTO(res, reviews);
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("resources", resourceDtos);
            response.put("totalSales", totalSales);
            response.put("currentBalance", currentBalance);
            response.put("profile", profile);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
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
    
    @PutMapping("/resources/{id}")
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
            if (!resource.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).body("Not authorized to edit this resource");

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
                if (thumbnail == null || thumbnail.isEmpty()) {
                     resource.setHasPreview(fileUploadService.generatePreviewImageUrl(uploadResult) != null);
                }
            }

            if (thumbnail != null && !thumbnail.isEmpty()) {
                Map thumbResult = fileUploadService.uploadFile(thumbnail);
                resource.setCoverImageUrl((String) thumbResult.get("secure_url"));
                resource.setHasPreview(true);
            }

            teacherResourceRepository.save(resource);
            return ResponseEntity.ok("Updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating resource: " + e.getMessage());
        }
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<?> deleteResource(
            @PathVariable Long id, 
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);

            if (resource == null) return ResponseEntity.status(404).body("Resource not found");
            
            if (!resource.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Not authorized to delete this resource");
            }

            teacherResourceRepository.delete(resource);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting resource");
        }
    }
    
    @GetMapping("/resources")
    public ResponseEntity<?> getAllResources(
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "grade", required = false) String grade,
            @RequestParam(value = "curriculum", required = false) String curriculum) {
        
        List<TeacherResource> resources;
        if (subject != null && grade != null && curriculum != null) {
            resources = teacherResourceRepository.findBySubjectAndGradeAndCurriculum(subject, grade, curriculum);
        } else if (subject != null && grade != null) {
            resources = teacherResourceRepository.findBySubjectAndGrade(subject, grade);
        } else if (subject != null) {
            resources = teacherResourceRepository.findBySubject(subject);
        } else if (grade != null) {
            resources = teacherResourceRepository.findByGrade(grade);
        } else if (curriculum != null) {
            resources = teacherResourceRepository.findByCurriculum(curriculum);
        } else {
            resources = teacherResourceRepository.findAll();
        }

        List<TeacherResourceDTO> dtos = resources.stream().map(r -> {
            List<Review> reviews = reviewRepository.findByResource(r);
            return new TeacherResourceDTO(r, reviews);
        }).toList();
        
        return ResponseEntity.ok(Map.of("resources", dtos));
    }

    @GetMapping("/resources/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable Long id) {
        TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);
        if (resource == null) return ResponseEntity.status(404).body("Not found");
        var reviews = reviewRepository.findByResource(resource);
        return ResponseEntity.ok(new TeacherResourceDTO(resource, reviews));
    }
    
    @GetMapping("/resources/{id}/reviews")
    public ResponseEntity<?> getResourceReviews(@PathVariable Long id) {
        TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);
        if (resource == null) return ResponseEntity.status(404).body("Not found");
        var reviews = reviewRepository.findByResource(resource);
        var dtos = reviews.stream().map(TeacherResourceDTO.ReviewDTO::new).toList();
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        return ResponseEntity.ok(Map.of("averageRating", avg, "reviews", dtos));
    }

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

        Map<Long, Long> resourceSales = new HashMap<>();
        for (Purchase p : purchases) {
            Long rid = p.getResource().getId();
            resourceSales.put(rid, resourceSales.getOrDefault(rid, 0L) + 1);
        }
        
        List<Map<String, Object>> topResources = resources.stream()
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", r.getId());
                    m.put("title", r.getTitle());
                    m.put("sales", resourceSales.getOrDefault(r.getId(), 0L));
                    return m;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("sales"), (Long) a.get("sales")))
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "salesLast30Days", salesLast30Days,
                "topResources", topResources,
                "totalSales", purchases.size()));
    }

    @GetMapping("/top-contributors")
    public ResponseEntity<?> getTopContributors() {
        try {
            List<Object[]> topContributors = teacherResourceRepository.findTopContributors();
            if (topContributors == null) return ResponseEntity.ok(List.of());

            List<Map<String, Object>> result = topContributors.stream().map(obj -> {
                try {
                    Long userId = (Long) obj[0];
                    Long resourceCount = (Long) obj[1];
                    if (userId == null) return null;
                    TeacherProfile profile = teacherProfileRepository.findByUserId(userId).orElse(null);
                    if (profile == null || profile.getUser() == null) return null;
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", profile.getUser().getName());
                    map.put("subjects", profile.getSubjects());
                    map.put("profilePicPath", profile.getProfilePicPath());
                    map.put("resourceCount", resourceCount);
                    return map;
                } catch(Exception e) { return null; }
            }).filter(m -> m != null).limit(5).collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch(Exception e) { return ResponseEntity.ok(List.of()); }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(notificationRepository.findByTeacherOrderByCreatedAtDesc(teacher));
    }

    @PostMapping("/notifications/clear")
    public ResponseEntity<?> clearNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        var notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(teacher);
        for (var n : notifications) n.setRead(true);
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok("Cleared");
    }

    @PostMapping("/notifications/clearAll")
    public ResponseEntity<?> clearAllNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        var notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(teacher);
        notificationRepository.deleteAll(notifications);
        return ResponseEntity.ok("Deleted");
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            var notification = notificationRepository.findById(id).orElse(null);
            
            if (notification == null) return ResponseEntity.status(404).body("Notification not found");
            
            if (!notification.getTeacher().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You are not authorized to delete this notification");
            }

            notificationRepository.delete(notification);
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting notification: " + e.getMessage());
        }
    }

    @PostMapping("/zoom/disconnect")
    public ResponseEntity<?> disconnectZoom(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            currentUser.setZoomAccessToken(null);
            currentUser.setZoomRefreshToken(null);
            userRepository.save(currentUser);

            TeacherProfile profile = teacherProfileRepository.findByUserId(currentUser.getId()).orElse(null);
            if (profile != null) {
                profile.setZoomAccessToken(null);
                profile.setZoomRefreshToken(null);
                profile.setZoomTokenExpiresAt(null);
                teacherProfileRepository.save(profile);
            }
            return ResponseEntity.ok(Map.of("message", "Disconnected"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed");
        }
    }
}