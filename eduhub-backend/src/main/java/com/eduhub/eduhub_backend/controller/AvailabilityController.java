package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.dto.AvailabilityRequest;
import com.eduhub.eduhub_backend.entity.TeacherAvailability;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.TeacherAvailabilityRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AvailabilityController {

    @Autowired
    private TeacherAvailabilityRepository availabilityRepository;

    @Autowired
    private UserRepository userRepository;

    // Endpoint for a teacher to add one or more availability slots
    @PostMapping
    public ResponseEntity<?> addAvailabilitySlots(@RequestBody List<AvailabilityRequest> requests, @AuthenticationPrincipal UserDetails userDetails) {
        User currentTeacher = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        List<TeacherAvailability> slotsToSave = new ArrayList<>();
        for (AvailabilityRequest request : requests) {
            TeacherAvailability newSlot = new TeacherAvailability();
            newSlot.setTeacher(currentTeacher);
            newSlot.setStartTime(request.start);
            newSlot.setEndTime(request.end);
            newSlot.setBooked(false);
            slotsToSave.add(newSlot);
        }
        availabilityRepository.saveAll(slotsToSave);
        return ResponseEntity.ok("Availability saved successfully.");
    }

    // Endpoint for a teacher to view their own available slots
    @GetMapping
    public ResponseEntity<List<TeacherAvailability>> getMyAvailability(@AuthenticationPrincipal UserDetails userDetails) {
        User currentTeacher = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        List<TeacherAvailability> availableSlots = availabilityRepository
                .findByTeacherIdAndIsBookedFalseAndStartTimeAfter(currentTeacher.getId(), LocalDateTime.now());
        return ResponseEntity.ok(availableSlots);
    }
}