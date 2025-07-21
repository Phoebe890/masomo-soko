package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.dto.LoginRequest;
import com.eduhub.eduhub_backend.dto.SignUpRequest;
import com.eduhub.eduhub_backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignUpRequest request) {
        String response = authService.signup(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            // 1. Authenticate the user's credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.email, loginRequest.password));

            // 2. Get the actual user details from the successful authentication
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // 3. Get the REAL role from the user's authorities (e.g., "TEACHER" or "STUDENT")
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .map(authString -> authString.replace("ROLE_", "")) // Remove "ROLE_" prefix
                    .orElse("UNKNOWN");

            // 4. Save the security context to the HTTP session. THIS IS THE MOST IMPORTANT FIX.
            // This makes the login "stick" for subsequent requests.
            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);
            HttpSession session = request.getSession(true); // Create a new session
            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);

            // 5. Return the REAL user details in the response
            return ResponseEntity.ok(Map.of(
                    "email", userDetails.getUsername(),
                    "role", role
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        }
    }
}