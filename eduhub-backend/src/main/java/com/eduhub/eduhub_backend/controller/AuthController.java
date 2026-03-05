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
            String tokenString = body.get("token");
            if (tokenString == null) tokenString = body.get("credential");
            
            Map<String, String> googleData = verifyGoogleTokenAndGetData(tokenString);
            if (googleData == null) return ResponseEntity.status(401).body("Invalid Google Token");

            User user = userRepository.findByEmail(googleData.get("email")).orElse(null);
            if (user == null) return ResponseEntity.status(404).body("No account found. Please sign up first.");

            String jwtToken = jwtService.generateToken(user);
            return ResponseEntity.ok(createAuthResponse(user, jwtToken));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Login failed.");
        }
    }

     // --- 2. GOOGLE SIGNUP (New Users Only) ---
   @PostMapping("/google-signup")
public ResponseEntity<?> googleSignup(@RequestBody Map<String, String> body) {
    try {
        String tokenString = body.get("token");
        String intendedRole = body.getOrDefault("role", "STUDENT").toUpperCase();

        // 1. Get Data from Google
        Map<String, String> googleData = verifyGoogleTokenAndGetData(tokenString);
        
        // 2. Safety check: If Google fails to return data
        if (googleData == null || googleData.get("email") == null) {
            return ResponseEntity.status(401).body("Signup failed: Could not verify Google account.");
        }

        String email = googleData.get("email");

        // 3. Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("An account with this email already exists. Please log in.");
        }

        // 4. Create New User
        User user = new User();
        user.setEmail(email);
        user.setName(googleData.get("name") != null ? googleData.get("name") : "Google User");
        user.setRole(intendedRole);
        user.setPassword(passwordEncoder.encode("GOOGLE_AUTH"));
        user.setEnabled(true);
        user.setProfilePicPath(googleData.get("picture"));
        userRepository.save(user);

        // 5. Create Teacher Profile if applicable
        if ("TEACHER".equals(intendedRole)) {
            TeacherProfile profile = new TeacherProfile();
            profile.setUser(user);
            profile.setProfilePicPath(googleData.get("picture"));
            teacherProfileRepository.save(profile);
        }

        String jwtToken = jwtService.generateToken(user);
        return ResponseEntity.ok(createAuthResponse(user, jwtToken));

    } catch (Exception e) {
        e.printStackTrace(); 
        return ResponseEntity.status(500).body("Signup failed: " + e.getMessage());
    }
}

// --- REFINED HELPERS ---

private Map<String, String> verifyGoogleTokenAndGetData(String token) {
        if (token == null) return null;
        if (token.startsWith("ya29")) return fetchUserFromGoogleApi(token);

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId)).build();
            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload p = idToken.getPayload();
                Map<String, String> map = new HashMap<>();
                map.put("email", p.getEmail());
                map.put("name", (String) p.get("name"));
                map.put("picture", (String) p.get("picture"));
                return map;
            }
        } catch (Exception e) {}
        return fetchUserFromGoogleApi(token);
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

    private Map<String, Object> createAuthResponse(User user, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("photoUrl", user.getProfilePicPath());
        response.put("onboardingComplete", "TEACHER".equals(user.getRole()) ? isTeacherProfileComplete(user.getId()) : true);
        return response;
    }
}