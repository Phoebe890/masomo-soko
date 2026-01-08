package com.eduhub.eduhub_backend.entity;


import com.eduhub.eduhub_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Define the Admin Email
        String adminEmail = "admin@masomosoko.co.ke";
        
        // 2. Check if the user already exists
        Optional<User> existingUser = userRepository.findByEmail(adminEmail);
        
        if (existingUser.isEmpty()) {
            // 3. Create the Admin User
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail(adminEmail);
            
            // IMPORTANT: Set a secure password here
            admin.setPassword(passwordEncoder.encode("Admin@2026")); 
            
            // Match the Role your SecurityConfig looks for
            admin.setRole("ADMIN"); 
            
            // Setting both flags to true based on your User entity fields
            admin.setEnabled(true);
            admin.setActive(true);
            
            userRepository.save(admin);
            
            System.out.println("----------------------------------------------");
            System.out.println(" INITIAL ADMIN CREATED: " + adminEmail);
            System.out.println("----------------------------------------------");
        } else {
            System.out.println(" Admin user already exists. Skipping seeder.");
        }
    }
}