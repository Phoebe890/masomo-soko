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

    // =========================================================================
    //  PUBLIC ENDPOINTS (For Homepage/Browsing)
    // =========================================================================

    // 1. Get All Resources (Public)
    @GetMapping("/resources")
    public ResponseEntity<?> getAllResources(@RequestParam(required = false) String search) {
        try {
            List<TeacherResource> resources;
            
            // Logic: If user typed something, search by title. If not, get all.
            if (search != null && !search.trim().isEmpty()) {
                resources = teacherResourceRepository.findByTitleContainingIgnoreCase(search);
            } else {
                resources = teacherResourceRepository.findAll();
            }
            
            List<TeacherResourceDTO> resourceDtos = resources.stream().map(res -> {
                List<Review> reviews = reviewRepository.findByResource(res);
                return new TeacherResourceDTO(res, reviews); 
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("resources", resourceDtos);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching resources");
        }
    }

    // 2. Get Single Resource Detail (Public - Fixes your 403 Error)
    @GetMapping("/resources/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable Long id) {
        try {
            TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);
            
            if (resource == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resource not found");
            }

            List<Review> reviews = reviewRepository.findByResource(resource);
            TeacherResourceDTO dto = new TeacherResourceDTO(resource, reviews);

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching resource details");
        }
    }

    // 3. Get Top Contributors (Public)
    @GetMapping("/top-contributors")
    public ResponseEntity<?> getTopContributors() {
        try {
            List<TeacherProfile> profiles = teacherProfileRepository.findAll();
            
            List<Map<String, Object>> contributors = profiles.stream().map(profile -> {
                Map<String, Object> map = new HashMap<>();
                String name = (profile.getUser() != null) ? profile.getUser().getName() : "Instructor";
                int resourceCount = (profile.getUser() != null) 
                    ? teacherResourceRepository.findByUserId(profile.getUser().getId()).size() 
                    : 0;

                map.put("name", name);
                 map.put("profilePicPath", upgradeGooglePhotoResolution(profile.getProfilePicPath()));
                  map.put("headline", profile.getHeadline()); // Ensure getHeadline() exists in your Entity
            map.put("bio", profile.getBio());
                map.put("subjects", profile.getSubjects());
                map.put("resourceCount", resourceCount);
                return map;
            })
            .sorted((a, b) -> (int)b.get("resourceCount") - (int)a.get("resourceCount"))
            .limit(4)
            .collect(Collectors.toList());

            return ResponseEntity.ok(contributors);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching contributors");
        }
    }

    // =========================================================================
    //  PROTECTED TEACHER ENDPOINTS
    // =========================================================================

    // --- DASHBOARD ---
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

            List<Notification> notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(user);

            Map<String, Object> response = new HashMap<>();
            response.put("resources", resourceDtos);
            response.put("totalSales", totalSales);
            response.put("currentBalance", currentBalance);
            response.put("profile", profile);
            response.put("notifications", notifications);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // --- ONBOARDING ---
   @PostMapping(value = "/onboarding", consumes = {"multipart/form-data"})
public ResponseEntity<?> onboarding(
        @RequestParam(value = "name", required = false) String name,        // ADDED
        @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
        @RequestParam(value = "headline", required = false) String headline,
        @RequestParam(value = "bio", required = false) String bio,          // CHANGED TO OPTIONAL
        @RequestParam(value = "subjects", required = false) String subjectsJson, // CHANGED TO OPTIONAL
        @RequestParam(value = "grades", required = false) String gradesJson,     // CHANGED TO OPTIONAL
        @RequestParam(value = "paymentNumber", required = false) String paymentNumber,
        @AuthenticationPrincipal UserDetails userDetails) {
    try {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired");

        // 1. GET THE USER
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // --- NEW LOGIC FOR NAME CHANGE ---
        if (name != null && !name.trim().isEmpty()) {
            user.setName(name);
        }

        // --- YOUR EXISTING ROLE LOGIC (KEPT) ---
        user.setRole("TEACHER"); 
        userRepository.save(user);

        // --- YOUR EXISTING PROFILE LOGIC (KEPT) ---
        TeacherProfile profile = getOrCreateProfile(user);

        // --- YOUR EXISTING JSON PARSING LOGIC (KEPT & PROTECTED) ---
        ObjectMapper mapper = new ObjectMapper();
        List<String> subjects = new ArrayList<>();
        if(subjectsJson != null && !subjectsJson.isEmpty()) {
            try { 
                subjects = mapper.readValue(subjectsJson, new TypeReference<List<String>>(){}); 
            } catch(Exception e){ System.err.println("Error parsing subjects"); }
        }
        
        List<String> grades = new ArrayList<>();
        if(gradesJson != null && !gradesJson.isEmpty()) {
            try { 
                grades = mapper.readValue(gradesJson, new TypeReference<List<String>>(){}); 
            } catch(Exception e){ System.err.println("Error parsing grades"); }
        }

        // --- YOUR EXISTING FIELD UPDATES (KEPT) ---
        profile.setBio(bio);
        profile.setHeadline(headline);
        profile.setSubjects(subjects);
        profile.setGrades(grades);
        
        if (paymentNumber != null && !paymentNumber.isEmpty()) {
            profile.setPaymentNumber(paymentNumber);
        }

        // --- YOUR EXISTING IMAGE UPLOAD LOGIC (KEPT) ---
        if (profilePic != null && !profilePic.isEmpty()) {
            Map uploadResult = fileUploadService.uploadFile(profilePic);
            profile.setProfilePicPath((String) uploadResult.get("secure_url"));
        }

        teacherProfileRepository.save(profile);

        return ResponseEntity.ok(profile);
    } catch (Exception e) {
        e.printStackTrace(); 
        return ResponseEntity.status(500).body("Failed: " + e.getMessage());
    }
}
   // --- GET SETTINGS ---
    @GetMapping("/settings")
    public ResponseEntity<?> getTeacherSettings(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            TeacherProfile profile = teacherProfileRepository.findByUserId(currentUser.getId()).orElse(null);
            
            boolean isZoomConnected = currentUser.getZoomAccessToken() != null && !currentUser.getZoomAccessToken().isEmpty();

            // FALLBACK LOGIC: 
            // If profile has no custom pic, use the one from the User entity (Google Photo)
            String finalPhotoUrl = null;
            if (profile != null && profile.getProfilePicPath() != null && !profile.getProfilePicPath().isEmpty()) {
                // Fixes custom uploaded or synced pics
                finalPhotoUrl = upgradeGooglePhotoResolution(profile.getProfilePicPath());
            } else {
                // Fixes the direct Google photo
                finalPhotoUrl = upgradeGooglePhotoResolution(currentUser.getProfilePic()); 
            }

            Map<String, Object> responseData = new HashMap<>();
            Map<String, String> userData = new HashMap<>();
            userData.put("name", currentUser.getName());
            userData.put("email", currentUser.getEmail());
            
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("user", userData);
            profileData.put("profilePicPath", finalPhotoUrl); // The synced photo
            
            if (profile != null) {
                profileData.put("bio", profile.getBio());
                profileData.put("subjects", profile.getSubjects());
                profileData.put("grades", profile.getGrades());
                profileData.put("paymentNumber", profile.getPaymentNumber());
                // We already set profilePicPath above via the fallback logic
            }

            responseData.put("profile", profileData);
            responseData.put("isZoomConnected", isZoomConnected);
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching settings");
        }
    }

    // --- UPLOAD RESOURCE ---
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
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // --- UPDATE RESOURCE ---
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
            return ResponseEntity.status(500).body("Error updating resource: " + e.getMessage());
        }
    }

    // --- DELETE RESOURCE ---
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
    
    // --- ANALYTICS ---
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

    // --- NOTIFICATIONS ---
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            List<Notification> notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(user);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching notifications");
        }
    }
    
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
    // 1. Mark ALL as read (more efficient than individual calls)
@PostMapping("/notifications/read-all")
public ResponseEntity<?> markAllRead(@AuthenticationPrincipal UserDetails userDetails) {
    User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    List<Notification> notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(user);
    notifications.forEach(n -> n.setRead(true));
    notificationRepository.saveAll(notifications);
    return ResponseEntity.ok("All marked read");
}

// 2. Delete/Dismiss a notification
@DeleteMapping("/notifications/{id}")
public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
    try {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok("Deleted");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Error deleting");
    }
}

    // --- PAYOUT SETUP ---
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
     private String upgradeGooglePhotoResolution(String url) {
        if (url == null) return null;
        if (url.contains("googleusercontent.com")) {
            // Replaces =s96 or =s96-c with =s400-c
           return url.replaceAll("=s\\d+(-c)?", "=s200-c");
        }
        return url;
    }
}
