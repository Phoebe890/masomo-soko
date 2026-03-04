package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.dto.SignUpRequest;
import com.eduhub.eduhub_backend.dto.LoginRequest;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.Optional;
import java.util.regex.Pattern;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
@Autowired
private EmailProducer emailProducer; 
    // Strict Email Regex
    private static final String EMAIL_PATTERN = 
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
    
    private static final Pattern pattern = Pattern.compile(EMAIL_PATTERN);
public String processForgotPassword(String email) {
    Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase().trim());
    if (userOpt.isPresent()) {
        User user = userOpt.get();
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        user.setResetOtp(otp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(5)); // Valid for 5 minutes
        userRepository.save(user);

        String emailBody = "Hello " + user.getName() + ",\n\n" +
                           "Your OTP for password reset is: " + otp + "\n\n" +
                           "This code will expire in 5 minutes. If you did not request this, please ignore this email.";
        
        emailProducer.sendEmail(user.getEmail(), "Password Reset OTP", emailBody);
    }
    return "If an account exists, an OTP has been sent to your email.";
}

public String verifyAndResetPassword(String email, String otp, String newPassword) {
    Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase().trim());

    if (userOpt.isEmpty()) return "User not found.";
    
    User user = userOpt.get();
    
    // 1. Check if OTP matches
    if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
        return "Invalid OTP.";
    }

    // 2. CHECK IF EXPIRED 
    if (user.getResetOtpExpiry() == null || user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
        return "OTP has expired.";
    }

    // Success: Update password and clear OTP
    user.setPassword(passwordEncoder.encode(newPassword));
    user.setResetOtp(null);
    user.setResetOtpExpiry(null);
    userRepository.save(user);

    return "Password updated successfully.";
}
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