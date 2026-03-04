package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.repository.TeacherResourceRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicStatsController {

    @Autowired
    private TeacherResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

  @GetMapping("/stats")
public Map<String, Long> getPublicStats() {
    Map<String, Long> stats = new HashMap<>();
    
    // Total Resources 
    stats.put("totalResources", resourceRepository.count());
    
    // Total Teachers 
    stats.put("totalTeachers", userRepository.countByRole("TEACHER"));
    
    // Total Users 
    stats.put("totalUsers", userRepository.count());
    
    return stats;
}
}