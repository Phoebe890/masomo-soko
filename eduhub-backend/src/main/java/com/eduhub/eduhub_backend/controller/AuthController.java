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
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
// Configure CORS to allow credentials from your frontend domains
@CrossOrigin(
    origins = { 
        "http://localhost:5173", 
        "http://localhost:3000", 
        "https://masomosoko.co.ke", 
        "https://www.masomosoko.co.ke",
        "https://masomo-soko.vercel.app"
    }, 
    allowCredentials = "true",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = "*"
)
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // This repository is crucial for manually saving the session to the HTTP response
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    // Regex for basic email validation
    private static final String EMAIL_PATTERN = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
    private static final Pattern pattern = Pattern.compile(EMAIL_PATTERN);

    // ========================================================================
    // 1. MANUAL SIGNUP (With Auto-Login)
    // ========================================================================
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignUpRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        // 1. Validate Email Format
        if (request.getEmail() == null || !pattern.matcher(request.getEmail()).matches()) {
            return ResponseEntity.badRequest().body("Invalid email format.");
        }

        // 2. Perform Signup logic via Service
        if (request.getEmail() != null) {
            request.setEmail(request.getEmail().toLowerCase().trim());
        }
        
        String response = authService.signup(request);

        // 3. If signup was successful, AUTO-LOGIN the user
        if (response.contains("successfully")) {
            try {
                // Authenticate manually
                UsernamePasswordAuthenticationToken token = 
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
                
                Authentication authentication = authenticationManager.authenticate(token);
                
                // Create Security Context
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
                
                // CRITICAL: Save context to Session and Repository for the Cookie to be generated
                securityContextRepository.saveContext(context, httpRequest, httpResponse);
                httpRequest.getSession().setAttribute("SPRING_SECURITY_CONTEXT", context);
                
            } catch (Exception e) {
                System.err.println("Auto-login failed: " + e.getMessage());
                // We return OK because account was created, user just needs to login manually if this fails
            }
        } else {
            // If service returned "Email already in use", return 400
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        return ResponseEntity.ok(response);
    }

    // ========================================================================
    // 2. MANUAL LOGIN
    // ========================================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        try {
            String normalizedEmail = loginRequest.getEmail().toLowerCase().trim();

            // 1. Authenticate using Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, loginRequest.getPassword()));

            // 2. Extract User Details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .map(authString -> authString.replace("ROLE_", ""))
                    .orElse("UNKNOWN");

            // 3. Set Security Context
            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);
            
            // 4. CRITICAL: Persist Session
            securityContextRepository.saveContext(securityContext, request, response);
            request.getSession().setAttribute("SPRING_SECURITY_CONTEXT", securityContext);

            // 5. Return success JSON
            return ResponseEntity.ok(Map.of("email", userDetails.getUsername(), "role", role));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
    }

    // ========================================================================
    // 3. GOOGLE LOGIN (Handles Account Linking & Creation)
    // ========================================================================
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload, HttpServletRequest request, HttpServletResponse response) {
        String token = payload.get("token"); 
        String requestedRole = payload.getOrDefault("role", "STUDENT"); 

        try {
            // 1. Verify Token with Google
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

                // 2. Extract Email & Name from Google
                String email = googleUser.get("email").asText().toLowerCase().trim();
                String name = googleUser.get("name").asText();

                // 3. UNIFIED ACCOUNT LOGIC: Check if user exists
                User user = userRepository.findByEmail(email).orElse(null);

                if (user == null) {
                    // CASE A: User does NOT exist -> Create New Account
                    user = new User();
                    user.setEmail(email);
                    user.setName(name);
                    user.setRole(requestedRole.toUpperCase());
                    // Set random password (user cannot login manually unless they reset it later)
                    user.setPassword(passwordEncoder.encode("GOOGLE_AUTH_" + UUID.randomUUID())); 
                    user.setEnabled(true);
                    userRepository.save(user);
                } 
                // CASE B: User DOES exist -> We skip creation and proceed to Login (Account Linking)

                // 4. Manually Authenticate (Bypass Password Check)
                String role = user.getRole();
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(user.getEmail(), null, 
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
                
                // 5. Create and Save Security Context (Session)
                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                securityContext.setAuthentication(authentication);
                SecurityContextHolder.setContext(securityContext);
                
                // Ensure session exists
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