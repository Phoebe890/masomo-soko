package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.TeacherProfile;
import com.eduhub.eduhub_backend.repository.TeacherProfileRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.entity.TeacherResource;
import com.eduhub.eduhub_backend.repository.TeacherResourceRepository;
import com.eduhub.eduhub_backend.dto.TeacherResourceDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import com.eduhub.eduhub_backend.repository.PurchaseRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.eduhub.eduhub_backend.entity.Purchase;
import com.eduhub.eduhub_backend.repository.ReviewRepository;
import com.eduhub.eduhub_backend.entity.Review;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TeacherController {
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

    @PostMapping("/onboarding")
    public ResponseEntity<?> onboarding(
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
            @RequestParam("bio") String bio,
            @RequestParam("subjects") String subjectsJson,
            @RequestParam("grades") String gradesJson,
            @RequestParam("paymentNumber") String paymentNumber,
            @RequestParam("email") String email) {
        try {
            String normalizedEmail = email.trim().toLowerCase();
            ObjectMapper mapper = new ObjectMapper();
            List<String> subjects = mapper.readValue(subjectsJson, new TypeReference<List<String>>() {
            });
            List<String> grades = mapper.readValue(gradesJson, new TypeReference<List<String>>() {
            });

            String profilePicPath = null;
            if (profilePic != null && !profilePic.isEmpty()) {
                Path uploadPath = Path.of("uploads", profilePic.getOriginalFilename());
                Files.createDirectories(uploadPath.getParent());
                profilePic.transferTo(uploadPath);
                profilePicPath = uploadPath.toString();
            }

            User user = userRepository.findByEmail(normalizedEmail).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId()).orElse(null);
            if (profile == null) {
                profile = new TeacherProfile();
                profile.setUser(user);
            }
            profile.setBio(bio);
            profile.setSubjects(subjects);
            profile.setGrades(grades);
            profile.setPaymentNumber(paymentNumber);
            profile.setProfilePicPath(profilePicPath);
            teacherProfileRepository.save(profile);

            return ResponseEntity.ok("Onboarding data saved");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save onboarding data");
        }
    }

    // Upload a resource
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
            @RequestParam("email") String email) {
        try {
            String normalizedEmail = email.trim().toLowerCase();
            User user = userRepository.findByEmail(normalizedEmail).orElse(null);
            if (user == null)
                return ResponseEntity.status(404).body("User not found");
            String filePath = null;
            if (file != null && !file.isEmpty()) {
                Path uploadPath = Path.of("uploads/resources", file.getOriginalFilename());
                Files.createDirectories(uploadPath.getParent());
                file.transferTo(uploadPath);
                filePath = uploadPath.toString();
            }
            TeacherResource resource = new TeacherResource();
            resource.setTitle(title);
            resource.setDescription(description);
            resource.setSubject(subject);
            resource.setGrade(grade);
            resource.setCurriculum(curriculum);
            resource.setPricing(pricing);
            resource.setPrice(price);
            resource.setFilePath(filePath);
            resource.setUser(user);
            teacherResourceRepository.save(resource);
            return ResponseEntity.ok("Resource uploaded");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload resource");
        }
    }

    // Payout setup
    @PostMapping("/payout")
    public ResponseEntity<?> setupPayout(
            @RequestParam("email") String email,
            @RequestParam("method") String method,
            @RequestParam(value = "mpesa", required = false) String mpesa,
            @RequestParam(value = "bank", required = false) String bank,
            @RequestParam(value = "account", required = false) String account) {
        try {
            String normalizedEmail = email.trim().toLowerCase();
            User user = userRepository.findByEmail(normalizedEmail).orElse(null);
            if (user == null)
                return ResponseEntity.status(404).body("User not found");
            TeacherProfile profile = teacherProfileRepository.findAll().stream()
                    .filter(p -> p.getUser().getId().equals(user.getId())).findFirst().orElse(null);
            if (profile == null)
                return ResponseEntity.status(404).body("Profile not found");
            // Store payout info in profile (expand as needed)
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

    // Dashboard data
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@RequestParam("email") String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null)
            return ResponseEntity.status(404).body("User not found");
        List<TeacherResource> resources = teacherResourceRepository.findByUserId(user.getId());
        int totalSales = 0; // Placeholder
        double currentBalance = 0.0; // Placeholder
        TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId()).orElse(null);
        return ResponseEntity.ok(new java.util.HashMap<>() {
            {
                put("resources", resources);
                put("totalSales", totalSales);
                put("currentBalance", currentBalance);
                put("profile", profile);
            }
        });
    }

    // Get all resources for public browsing
    @GetMapping("/resources")
    public ResponseEntity<?> getAllResources(
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "grade", required = false) String grade,
            @RequestParam(value = "curriculum", required = false) String curriculum) {
        List<TeacherResource> resources;
        if (subject != null && grade != null && curriculum != null) {
            resources = teacherResourceRepository.findBySubjectAndGradeAndCurriculum(subject, grade, curriculum);
        } else if (subject != null && grade != null) {
            resources = teacherResourceRepository.findBySubjectAndGradeAndCurriculum(subject, grade, null);
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
        return ResponseEntity.ok(new java.util.HashMap<>() {
            {
                put("resources", dtos);
            }
        });
    }

    @GetMapping("/resources/{id}/reviews")
    public ResponseEntity<?> getResourceReviews(@PathVariable Long id) {
        TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);
        if (resource == null) {
            return ResponseEntity.status(404).body("Resource not found");
        }
        var reviews = reviewRepository.findByResource(resource);
        var dtos = reviews.stream().map(com.eduhub.eduhub_backend.dto.TeacherResourceDTO.ReviewDTO::new).toList();
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        return ResponseEntity.ok(java.util.Map.of("averageRating", avg, "reviews", dtos));
    }

    @GetMapping("/resources/{id}")
    public ResponseEntity<?> getResourceById(@PathVariable Long id) {
        TeacherResource resource = teacherResourceRepository.findById(id).orElse(null);
        if (resource == null) {
            return ResponseEntity.status(404).body("Resource not found");
        }
        var reviews = reviewRepository.findByResource(resource);
        return ResponseEntity.ok(new com.eduhub.eduhub_backend.dto.TeacherResourceDTO(resource, reviews));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getTeacherAnalytics(@RequestParam("email") String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null)
            return ResponseEntity.status(404).body("User not found");
        List<TeacherResource> resources = teacherResourceRepository.findByUserId(user.getId());
        List<Long> resourceIds = resources.stream().map(TeacherResource::getId).collect(Collectors.toList());
        List<Purchase> purchases = resourceIds.isEmpty() ? List.of()
                : purchaseRepository.findByResourceIdIn(resourceIds);

        // Sales over last 30 days
        Map<LocalDate, Long> salesLast30Days = new HashMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            salesLast30Days.put(day, 0L);
        }
        for (Purchase p : purchases) {
            LocalDate date = p.getPurchasedAt().toLocalDate();
            if (salesLast30Days.containsKey(date)) {
                salesLast30Days.put(date, salesLast30Days.get(date) + 1);
            }
        }
        // Top-selling resources
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
}