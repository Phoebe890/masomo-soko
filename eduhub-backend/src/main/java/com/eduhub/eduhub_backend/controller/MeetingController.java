package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.TeacherProfile;
import com.eduhub.eduhub_backend.repository.TeacherProfileRepository;
import com.eduhub.eduhub_backend.service.ZoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/coaching")
public class MeetingController {

    @Autowired
    private TeacherProfileRepository teacherProfileRepository;

    @Autowired
    private ZoomService zoomService;

    @PostMapping("/create-meeting")
    public ResponseEntity<?> createMeeting(@AuthenticationPrincipal UserDetails userDetails,
                                           @RequestBody Map<String, Object> meetingDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated."));
        }

        String email = userDetails.getUsername();
        System.out.println("Attempting to create meeting for user: " + email);

        Optional<TeacherProfile> teacherProfileOptional = teacherProfileRepository.findByUserEmail(email);

        if (teacherProfileOptional.isEmpty()) {
            System.err.println("FORBIDDEN: No TeacherProfile found for email: " + email);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. User is not a registered teacher."));
        }

        TeacherProfile teacher = teacherProfileOptional.get();

        try {
            Map<String, Object> zoomResponse = zoomService.createMeetingForTeacher(teacher, meetingDetails);
            return ResponseEntity.ok(zoomResponse);
        } catch (Exception e) {
            System.err.println("Error calling Zoom service for " + email + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create Zoom meeting. Reason: " + e.getMessage()));
        }
    }
}