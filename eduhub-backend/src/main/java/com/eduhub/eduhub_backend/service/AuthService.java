package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.dto.SignUpRequest;
import com.eduhub.eduhub_backend.dto.LoginRequest;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Strict Email Regex
    private static final String EMAIL_PATTERN = 
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
    
    private static final Pattern pattern = Pattern.compile(EMAIL_PATTERN);

    public String signup(SignUpRequest request) {
        // 1. Check for Nulls
        if (request.getEmail() == null || request.getPassword() == null || request.getName() == null) {
            return "All fields (Name, Email, Password) are required.";
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // 2. Validate Email Format
        if (!pattern.matcher(normalizedEmail).matches()) {
            return "Invalid email address format.";
        }
        
        // 3. Check for Duplicate Email
        if (userRepository.existsByEmail(normalizedEmail)) {
            return "Email is already in use. Please login instead.";
        }

        // 4. Create User
        User user = new User();
        user.setName(request.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Ensure Role is uppercase and defaults to STUDENT if missing
        String role = (request.getRole() != null) ? request.getRole().toUpperCase() : "STUDENT";
        user.setRole(role);
        
        user.setEnabled(true);

        userRepository.save(user);
        return "User registered successfully.";
    }

    public User login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) return null;

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        
        if (userOpt.isEmpty())
            return null;

        User user = userOpt.get();
        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return user;
        } else {
            return null;
        }
    }
}