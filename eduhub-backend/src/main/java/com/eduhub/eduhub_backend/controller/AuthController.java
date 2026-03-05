package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.dto.ForgotPasswordRequest;
import com.eduhub.eduhub_backend.dto.LoginRequest;
import com.eduhub.eduhub_backend.dto.ResetPasswordRequest;
import com.eduhub.eduhub_backend.entity.TeacherProfile;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.TeacherProfileRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import com.eduhub.eduhub_backend.security.JwtService;
import com.eduhub.eduhub_backend.service.AuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = { "http://localhost:5173", "http://localhost:3000", "https://masomosoko.co.ke", "https://www.masomosoko.co.ke" }, 
    allowCredentials = "true"
)
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private TeacherProfileRepository teacherProfileRepository;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;

@Autowired
private AuthService authService;
    @Value("${google.client.id}")
    private String googleClientId;

   private boolean isTeacherProfileComplete(Long userId) {
    Optional<TeacherProfile> profileOpt = teacherProfileRepository.findByUserId(userId);
    if (profileOpt.isEmpty()) return false;
    TeacherProfile profile = profileOpt.get();
    return profile.getBio() != null && !profile.getBio().isBlank() 
        && profile.getPaymentNumber() != null && !profile.getPaymentNumber().isBlank();
}
    // --- STANDARD LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // 1. Attempt Authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            
            // 2. Auth Successful - Generate Token
            User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();
            String token = jwtService.generateToken(user);
            
            boolean onboardingComplete = true; 
            if ("TEACHER".equalsIgnoreCase(user.getRole())) {
                onboardingComplete = isTeacherProfileComplete(user.getId());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
          response.put("photoUrl", user.getProfilePicPath());
            response.put("onboardingComplete", onboardingComplete);

            return ResponseEntity.ok(response);

         } catch (Exception e) {
       
        // Check if the email exists in the database at all
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOpt.isEmpty()) {
            // SCENARIO 1: User does not have an account
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No account found with this email. Please sign up first.");
        }

        User user = userOpt.get();
        
        // SCENARIO 2: Account exists but was created via Google
        if (passwordEncoder.matches("GOOGLE_AUTH", user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("This account was created with Google. Please use Sign in with Google.");
        }

        // SCENARIO 3: Account exists, but password is wrong
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body("Incorrect password. Please try again or reset your password.");
    }
}
// --- STANDARD SIGNUP ---
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String name = request.get("name");
            String role = request.getOrDefault("role", "STUDENT").toUpperCase();

            // 1. Check if user already exists
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already in use");
            }

            // 2. Create new User
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setRole(role);
            user.setPassword(passwordEncoder.encode(password)); // Hash the password
            user.setEnabled(true);
            
            userRepository.save(user);

            if ("TEACHER".equals(role)) {
                TeacherProfile profile = new TeacherProfile();
                profile.setUser(user);
                teacherProfileRepository.save(profile);
            }

            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }
     // 1. Endpoint to request the OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String message = authService.processForgotPassword(request.getEmail());
        return ResponseEntity.ok(message);
    }

    // 2. Endpoint to verify OTP and change password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        String result = authService.verifyAndResetPassword(
            request.getEmail(), 
            request.getOtp(), 
            request.getPassword()
        );

        if (result.equals("Password updated successfully.")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    // --- GOOGLE LOGIN ---
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        try {
              String intendedRole = body.getOrDefault("role", "STUDENT").toUpperCase();
            String tokenString = body.get("token");
            if (tokenString == null) tokenString = body.get("credential");
            if (tokenString == null) return ResponseEntity.badRequest().body("Missing 'token' or 'credential'");

            String role = body.getOrDefault("role", "TEACHER");
            String email = null;
            String name = null;
            String pictureUrl = null;

            if (tokenString.startsWith("ya29")) {
                Map<String, String> googleUser = fetchUserFromGoogleApi(tokenString);
                if (googleUser == null) return ResponseEntity.status(401).body("Invalid Google Access Token");
                email = googleUser.get("email");
                name = googleUser.get("name");
                pictureUrl = googleUser.get("picture");
            } else {
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                        .setAudience(Collections.singletonList(googleClientId))
                        .setAcceptableTimeSkewSeconds(60).build();

                GoogleIdToken idToken = verifier.verify(tokenString);
                if (idToken == null) return ResponseEntity.status(401).body("Invalid Google ID Token");

                GoogleIdToken.Payload payload = idToken.getPayload();
                email = payload.getEmail();
                name = (String) payload.get("name");
                pictureUrl = (String) payload.get("picture");
            }

           User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setRole(intendedRole);
                user.setPassword(passwordEncoder.encode("GOOGLE_AUTH"));
                user.setEnabled(true);
                user.setProfilePicPath(pictureUrl); // Save to User entity
                userRepository.save(user);
            } else {
                // Update photo if missing
                if (user.getProfilePicPath() == null || user.getProfilePicPath().isEmpty()) {
                    user.setProfilePicPath(pictureUrl);
                    userRepository.save(user);
                }
            }

            // Sync Teacher Profile
            if ("TEACHER".equalsIgnoreCase(user.getRole())) {
                TeacherProfile profile = teacherProfileRepository.findByUserId(user.getId()).orElse(new TeacherProfile());
                if (profile.getUser() == null) profile.setUser(user);
                
                
                if (profile.getProfilePicPath() == null || profile.getProfilePicPath().isEmpty()) {
                    profile.setProfilePicPath(pictureUrl); 
                }
                teacherProfileRepository.save(profile);
            }

            String jwtToken = jwtService.generateToken(user);
            
            boolean onboardingComplete = true;
            if ("TEACHER".equalsIgnoreCase(user.getRole())) {
                onboardingComplete = isTeacherProfileComplete(user.getId());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("role", user.getRole());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
           response.put("photoUrl", user.getProfilePicPath());
            response.put("onboardingComplete", onboardingComplete);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Google login failed: " + e.getMessage());
        }
    }

    private Map<String, String> fetchUserFromGoogleApi(String accessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://www.googleapis.com/oauth2/v3/userinfo";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map body = response.getBody();
                Map<String, String> userInfo = new HashMap<>();
                userInfo.put("email", (String) body.get("email"));
                userInfo.put("name", (String) body.get("name"));
                userInfo.put("picture", (String) body.get("picture"));
                return userInfo;
            }
        } catch (Exception e) {}
        return null;
    }
}