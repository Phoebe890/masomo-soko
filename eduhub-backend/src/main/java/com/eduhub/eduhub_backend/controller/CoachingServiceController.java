package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.dto.ServiceRequest;
import com.eduhub.eduhub_backend.entity.CoachingService;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.CoachingServiceRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/coaching")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CoachingServiceController {

    @Autowired
    private CoachingServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    // Endpoint for a teacher to create a new coaching service
    @PostMapping("/service")
    public ResponseEntity<CoachingService> createService(@RequestBody ServiceRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        User currentTeacher = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        CoachingService newService = new CoachingService();
        newService.setTeacher(currentTeacher);
        newService.setTitle(request.title);
        newService.setDescription(request.description);
        newService.setDurationInMinutes(request.durationInMinutes);
        newService.setPrice(request.price);
        newService.setActive(true);
        
        CoachingService savedService = serviceRepository.save(newService);
        return new ResponseEntity<>(savedService, HttpStatus.CREATED);
    }

    // Endpoint for a teacher to get a list of their own services
    @GetMapping("/my-services")
    public ResponseEntity<List<CoachingService>> getMyServices(@AuthenticationPrincipal UserDetails userDetails) {
        User currentTeacher = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        
        List<CoachingService> services = serviceRepository.findByTeacherId(currentTeacher.getId());
        return ResponseEntity.ok(services);
    }
}