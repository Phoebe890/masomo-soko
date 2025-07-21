package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.dto.SignUpRequest;
import com.eduhub.eduhub_backend.dto.LoginRequest;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String signup(SignUpRequest request) {
        String normalizedEmail = request.email.trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            return "Email already in use.";
        }

        User user = new User();
        user.setName(request.name);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password)); // hash password
        user.setRole(request.role.toUpperCase());

        userRepository.save(user);
        return "User registered successfully.";
    }

    public User login(LoginRequest request) {
        String normalizedEmail = request.email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        if (userOpt.isEmpty())
            return null;

        User user = userOpt.get();
        if (passwordEncoder.matches(request.password, user.getPassword())) {
            return user;
        } else {
            return null;
        }
    }
}
