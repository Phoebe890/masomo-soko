package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.dto.LoginRequest;
import com.eduhub.eduhub_backend.dto.SignUpRequest;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.UserRepository;
import com.eduhub.eduhub_backend.service.AuthService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = { "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000" }, 
    allowCredentials = "true",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    // 1. SIGNUP WITH AUTO-LOGIN
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignUpRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        if (request.getEmail() != null) {
            request.setEmail(request.getEmail().toLowerCase().trim());
        }
        
        String response = authService.signup(request);

        // If signup success, log them in immediately
        if (response.contains("successfully")) {
            try {
                UsernamePasswordAuthenticationToken token = 
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
                
                Authentication authentication = authenticationManager.authenticate(token);
                
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
                
                securityContextRepository.saveContext(context, httpRequest, httpResponse);
                httpRequest.getSession().setAttribute("SPRING_SECURITY_CONTEXT", context);
                
            } catch (Exception e) {
                System.err.println("Auto-login failed: " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok(response);
    }

    // 2. MANUAL LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        try {
            String normalizedEmail = loginRequest.getEmail().toLowerCase().trim();

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, loginRequest.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .map(authString -> authString.replace("ROLE_", ""))
                    .orElse("UNKNOWN");

            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);
            
            securityContextRepository.saveContext(securityContext, request, response);
            request.getSession().setAttribute("SPRING_SECURITY_CONTEXT", securityContext);

            return ResponseEntity.ok(Map.of("email", userDetails.getUsername(), "role", role));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
    }

    // 3. GOOGLE LOGIN
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload, HttpServletRequest request, HttpServletResponse response) {
        String token = payload.get("token"); 
        String requestedRole = payload.getOrDefault("role", "STUDENT"); 

        try {
            OkHttpClient client = new OkHttpClient();
            Request googleRequest = new Request.Builder()
                    .url("https://www.googleapis.com/oauth2/v3/userinfo")
                    .addHeader("Authorization", "Bearer " + token)
                    .build();

            try (Response googleResponse = client.newCall(googleRequest).execute()) {
                if (!googleResponse.isSuccessful()) {
                    return ResponseEntity.badRequest().body("Invalid Google Token");
                }

                String responseBody = googleResponse.body().string();
                ObjectMapper mapper = new ObjectMapper();
                JsonNode googleUser = mapper.readTree(responseBody);

                String email = googleUser.get("email").asText().toLowerCase().trim();
                String name = googleUser.get("name").asText();

                User user = userRepository.findByEmail(email).orElse(null);

                if (user == null) {
                    user = new User();
                    user.setEmail(email);
                    user.setName(name);
                    user.setRole(requestedRole.toUpperCase());
                    user.setPassword(passwordEncoder.encode("GOOGLE_AUTH_" + UUID.randomUUID())); 
                    user.setEnabled(true);
                    userRepository.save(user);
                } 

                String role = user.getRole();
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(user.getEmail(), null, 
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
                
                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                securityContext.setAuthentication(authentication);
                SecurityContextHolder.setContext(securityContext);
                
               HttpSession session = request.getSession(true);
                session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);
                securityContextRepository.saveContext(securityContext, request, response);
                return ResponseEntity.ok(Map.of("email", user.getEmail(), "role", role));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Google Login Error: " + e.getMessage());
        }
    }
}