package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.dto.SignUpRequest;
import com.eduhub.eduhub_backend.dto.LoginRequest;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String signup(SignUpRequest request) {
        // FIX: Use getEmail()
        if (request.getEmail() == null || request.getPassword() == null) {
            return "Email and Password are required.";
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        
        if (userRepository.existsByEmail(normalizedEmail)) {
            return "Email already in use.";
        }

        User user = new User();
        user.setName(request.getName()); // FIX: Use getName()
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword())); // FIX: Use getPassword()
        user.setRole(request.getRole().toUpperCase()); // FIX: Use getRole()
        user.setEnabled(true);

        userRepository.save(user);
        return "User registered successfully.";
    }

    public User login(LoginRequest request) {
        // FIX: Use getEmail()
        if (request.getEmail() == null) return null;

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        
        if (userOpt.isEmpty())
            return null;

        User user = userOpt.get();
        // FIX: Use getPassword()
        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return user;
        } else {
            return null;
        }
    }
}