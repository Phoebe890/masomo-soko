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
        if (userRepository.existsByEmail(request.email)) {
            return "Email already in use.";
        }

        User user = new User();
        user.setName(request.name);
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password)); // hash password
        user.setRole(request.role.toUpperCase());

        userRepository.save(user);
        return "User registered successfully.";
    }

    public boolean login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        return passwordEncoder.matches(request.password, user.getPassword());
    }
}
