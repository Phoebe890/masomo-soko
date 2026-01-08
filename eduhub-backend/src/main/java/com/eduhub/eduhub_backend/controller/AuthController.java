package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.dto.LoginRequest;
import com.eduhub.eduhub_backend.dto.SignUpRequest;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.UserRepository;
import com.eduhub.eduhub_backend.security.JwtUtils;
import com.eduhub.eduhub_backend.service.AuthService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils; // Inject JwtUtils

    private static final String EMAIL_PATTERN = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
    private static final Pattern pattern = Pattern.compile(EMAIL_PATTERN);

    // --- HELPER TO GENERATE RESPONSE ---
    private ResponseEntity<?> authenticateAndGetToken(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(email); // Generate Token

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream().findFirst().get().getAuthority().replace("ROLE_", "");

        return ResponseEntity.ok(Map.of(
            "token", jwt,  // Frontend will save this to localStorage
            "email", email,
            "role", role
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest request) {
        if (request.getEmail() == null || !pattern.matcher(request.getEmail()).matches()) {
            return ResponseEntity.badRequest().body("Invalid email format.");
        }
        if (request.getEmail() != null) request.setEmail(request.getEmail().toLowerCase().trim());
        
        String response = authService.signup(request);

        if (response.contains("successfully")) {
            return authenticateAndGetToken(request.getEmail(), request.getPassword());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            return authenticateAndGetToken(loginRequest.getEmail().toLowerCase().trim(), loginRequest.getPassword());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        String token = payload.get("token"); 
        String requestedRole = payload.getOrDefault("role", "STUDENT"); 

        try {
            OkHttpClient client = new OkHttpClient();
            Request googleRequest = new Request.Builder()
                    .url("https://www.googleapis.com/oauth2/v3/userinfo")
                    .addHeader("Authorization", "Bearer " + token)
                    .build();

            try (Response googleResponse = client.newCall(googleRequest).execute()) {
                if (!googleResponse.isSuccessful()) return ResponseEntity.badRequest().body("Invalid Google Token");

                String responseBody = googleResponse.body().string();
                JsonNode googleUser = new ObjectMapper().readTree(responseBody);
                String email = googleUser.get("email").asText().toLowerCase().trim();
                String name = googleUser.get("name").asText();

                User user = userRepository.findByEmail(email).orElse(null);

                // Use this random password for authentication generation
                String dummyPassword = "GOOGLE_AUTH_bypass_password"; 

                if (user == null) {
                    user = new User();
                    user.setEmail(email);
                    user.setName(name);
                    user.setRole(requestedRole.toUpperCase());
                    // We set a fixed dummy password pattern so we can "authenticate" it later internally if needed
                    // But typically for JWT we just generate the token directly.
                    user.setPassword(passwordEncoder.encode(dummyPassword)); 
                    user.setEnabled(true);
                    userRepository.save(user);
                }

                // DIRECTLY GENERATE TOKEN (Skip Auth Manager for Google to avoid password check issues)
                String jwt = jwtUtils.generateToken(user.getEmail());
                
                return ResponseEntity.ok(Map.of(
                    "token", jwt,
                    "email", user.getEmail(),
                    "role", user.getRole()
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Google Login Error: " + e.getMessage());
        }
    }
}