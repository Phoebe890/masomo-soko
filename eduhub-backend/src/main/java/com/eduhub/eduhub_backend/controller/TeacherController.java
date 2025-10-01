package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.dto.TeacherResourceDTO;
import com.eduhub.eduhub_backend.entity.Purchase;
import com.eduhub.eduhub_backend.entity.Review;
import com.eduhub.eduhub_backend.entity.TeacherProfile;
import com.eduhub.eduhub_backend.entity.TeacherResource;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.entity.Notification;
import com.eduhub.eduhub_backend.repository.PurchaseRepository;
import com.eduhub.eduhub_backend.repository.ReviewRepository;
import com.eduhub.eduhub_backend.repository.TeacherProfileRepository;
import com.eduhub.eduhub_backend.repository.TeacherResourceRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import com.eduhub.eduhub_backend.repository.NotificationRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TeacherController {

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private TeacherProfileRepository teacherProfileRepository;

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

    @GetMapping("/settings")
    public ResponseEntity<?> getTeacherSettings(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeacherProfile profile = teacherProfileRepository.findByUserId(currentUser.getId()).orElse(null);

        // This check now works because we added the field to the User entity
        boolean isZoomConnected = currentUser.getZoomAccessToken() != null
                && !currentUser.getZoomAccessToken().isEmpty();

        Map<String, Object> response = new HashMap<>();
        response.put("profile", profile);
        response.put("isZoomConnected", isZoomConnected);

        return ResponseEntity.ok(response);
    }

    // ... onboarding, resources, payout methods are all fine ...
    @PostMapping("/onboarding")
    public ResponseEntity<?> onboarding(
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
            @RequestParam("bio") String bio,
            @RequestParam("subjects") String subjectsJson,
            @RequestParam("grades") String gradesJson,
            @RequestParam("paymentNumber") String paymentNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ObjectMapper mapper = new ObjectMapper();
            List<String> subjects = mapper.readValue(subjectsJson, new TypeReference<>() {
            });
            List<String> grades = mapper.readValue(gradesJson, new TypeReference<>() {
            });

            String profilePicUrl = null;
            if (profilePic != null && !profilePic.isEmpty()) {
                Map uploadResult = fileUploadService.uploadFile(profilePic);
                profilePicUrl = (String) uploadResult.get("secure_url");
            }

            TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId()).orElse(new TeacherProfile());
            profile.setUser(user);
            profile.setBio(bio);
            profile.setSubjects(subjects);
            profile.setGrades(grades);
            profile.setPaymentNumber(paymentNumber);
            if (profilePicUrl != null) {
                profile.setProfilePicPath(profilePicUrl);
            }
            teacherProfileRepository.save(profile);

            return ResponseEntity.ok("Onboarding data saved");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save onboarding data: " + e.getMessage());
        }
    }

    @PostMapping("/resources")
    public ResponseEntity<?> uploadResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("subject") String subject,
            @RequestParam("grade") String grade,
            @RequestParam("curriculum") String curriculum,
            @RequestParam("pricing") String pricing,
            @RequestParam(value = "price", required = false) Double price,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(
                    () -> new RuntimeException("User not found"));

            Map uploadResult = fileUploadService.uploadFile(file);
            String fileUrl = (String) uploadResult.get("secure_url");
            String previewUrl = fileUploadService.generatePreviewImageUrl(uploadResult);

            TeacherResource resource = new TeacherResource();
            resource.setTitle(title);
            resource.setDescription(description);
            resource.setSubject(subject);
            resource.setGrade(grade);
            resource.setCurriculum(curriculum);
            resource.setPricing(pricing);
            resource.setPrice(price);
            resource.setUser(user);
            resource.setFilePath(fileUrl);

            // The method setPreviewImageUrl(String) is undefined for the type
            // TeacherResource
            // So, we should not call it. Only set hasPreview.
            if (previewUrl != null) {
                resource.setHasPreview(true);
            } else {
                resource.setHasPreview(false);
            }

            teacherResourceRepository.save(resource);

            return ResponseEntity.ok("Resource uploaded successfully.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload resource: " + e.getMessage());
        }
    }

    @PostMapping("/payout")
    public ResponseEntity<?> setupPayout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("method") String method,
            @RequestParam(value = "mpesa", required = false) String mpesa,
            @RequestParam(value = "bank", required = false) String bank,
            @RequestParam(value = "account", required = false) String account) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found"));

            if ("mpesa".equals(method)) {
                profile.setPaymentNumber(mpesa);
            } else if ("bank".equals(method)) {
                profile.setPaymentNumber(bank + ":" + account);
            }
            teacherProfileRepository.save(profile);
            return ResponseEntity.ok("Payout details saved");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save payout details");
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null)
            return ResponseEntity.status(404).body("User not found");

        List<TeacherResource> resources = teacherResourceRepository.findByUserId(user.getId());
        TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId()).orElse(null);

        List<Long> resourceIds = resources.stream().map(TeacherResource::getId).toList();
        long totalSales = resourceIds.isEmpty() ? 0 : purchaseRepository.countByResourceIdIn(resourceIds);

        Double currentBalance = resourceIds.isEmpty() ? 0.0 : purchaseRepository.sumPriceByResourceIdIn(resourceIds);

        // --- THIS IS THE FIX ---
        // We map the List<TeacherResource> to a List<TeacherResourceDTO>
        List<TeacherResourceDTO> resourceDtos = resources.stream()
                .map(TeacherResourceDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "resources", resourceDtos, // Now sending the correct DTO list
                "totalSales", totalSales,
                "currentBalance", currentBalance != null ? currentBalance : 0.0,
                "profile", profile));
    }

    // ... other methods are fine ...
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
        List<TeacherResourceDTO> dtos = resources.stream()
                .map(TeacherResourceDTO::new)
                .toList();
        return ResponseEntity.ok(Map.of("resources", dtos));
    }

    @GetMapping("/resources/{id}/reviews")
    public ResponseEntity<?> getResourceReviews(@PathVariable Long id) {
        TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);
        if (resource == null) {
            return ResponseEntity.status(404).body("Resource not found");
        }
        var reviews = reviewRepository.findByResource(resource);
        var dtos = reviews.stream().map(TeacherResourceDTO.ReviewDTO::new).toList();
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        return ResponseEntity.ok(Map.of("averageRating", avg, "reviews", dtos));
    }

    @GetMapping("/resources/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable Long id) {
        TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);
        if (resource == null) {
            return ResponseEntity.status(404).body("Resource not found");
        }
        var reviews = reviewRepository.findByResource(resource);
        return ResponseEntity.ok(new TeacherResourceDTO(resource, reviews));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getTeacherAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<TeacherResource> resources = teacherResourceRepository.findByUserId(user.getId());
        List<Long> resourceIds = resources.stream().map(TeacherResource::getId).collect(Collectors.toList());
        List<Purchase> purchases = resourceIds.isEmpty() ? List.of()
                : purchaseRepository.findByResourceIdIn(resourceIds);

        Map<LocalDate, Long> salesLast30Days = new HashMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            salesLast30Days.put(today.minusDays(i), 0L);
        }
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

        long totalSales = purchases.size();

        return ResponseEntity.ok(Map.of(
                "salesLast30Days", salesLast30Days,
                "topResources", topResources,
                "totalSales", totalSales));
    }

    @GetMapping("/top-contributors")
    public ResponseEntity<?> getTopContributors() {
        // Get user IDs and resource counts
        List<Object[]> topContributors = teacherResourceRepository.findTopContributors();
        // For each, fetch TeacherProfile and User
        List<Map<String, Object>> result = topContributors.stream().map(obj -> {
            Long userId = (Long) obj[0];
            Long resourceCount = (Long) obj[1];
            TeacherProfile profile = teacherProfileRepository.findByUserId(userId).orElse(null);
            if (profile == null || profile.getUser() == null)
                return null;
            Map<String, Object> map = new HashMap<>();
            map.put("name", profile.getUser().getName());
            map.put("subjects", profile.getSubjects());
            map.put("profilePicPath", profile.getProfilePicPath());
            map.put("resourceCount", resourceCount);
            return map;
        }).filter(m -> m != null).limit(5).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (teacher == null)
            return ResponseEntity.status(404).body("User not found");
        var notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(teacher);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/notifications/clear")
    public ResponseEntity<?> clearNotifications(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (teacher == null)
            return ResponseEntity.status(404).body("User not found");
        var notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(teacher);
        for (var n : notifications) {
            n.setRead(true);
        }
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok("All notifications marked as read");
    }

    @PostMapping("/notifications/clearAll")
    public ResponseEntity<?> clearAllNotifications(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (teacher == null)
            return ResponseEntity.status(404).body("User not found");
        var notifications = notificationRepository.findByTeacherOrderByCreatedAtDesc(teacher);
        notificationRepository.deleteAll(notifications);
        return ResponseEntity.ok("All notifications deleted");
    }

    @PostMapping("/zoom/disconnect")
    public ResponseEntity<?> disconnectZoom(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Clear Zoom tokens from user
            currentUser.setZoomAccessToken(null);
            currentUser.setZoomRefreshToken(null);
            userRepository.save(currentUser);

            // Also clear from teacher profile if exists
            TeacherProfile profile = teacherProfileRepository.findByUserId(currentUser.getId()).orElse(null);
            if (profile != null) {
                profile.setZoomAccessToken(null);
                profile.setZoomRefreshToken(null);
                profile.setZoomTokenExpiresAt(null);
                teacherProfileRepository.save(profile);
            }

            return ResponseEntity.ok(Map.of("message", "Zoom account disconnected successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to disconnect Zoom account: " + e.getMessage()));
        }
    }
}