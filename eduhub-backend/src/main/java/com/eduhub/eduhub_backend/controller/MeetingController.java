package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.TeacherProfile;
import com.eduhub.eduhub_backend.repository.TeacherProfileRepository;
import com.eduhub.eduhub_backend.service.ZoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

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
        // Only allow teachers
        String email = userDetails.getUsername();
        TeacherProfile teacher = teacherProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found for email: " + email));
        // Call ZoomService to create meeting
        Map<String, Object> zoomResponse = zoomService.createMeetingForTeacher(teacher, meetingDetails);
        return ResponseEntity.ok(zoomResponse);
    }
}