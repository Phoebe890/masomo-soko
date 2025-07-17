package com.eduhub.eduhub_backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.eduhub.eduhub_backend.repository.TeacherProfileRepository;
import com.eduhub.eduhub_backend.entity.TeacherProfile;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.Instant;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth/zoom")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" }, allowCredentials = "true")
public class ZoomAuthController {

    @Value("${zoom.api.client-id}")
    private String clientId;

    @Value("${zoom.api.client-secret}")
    private String clientSecret;

    @Value("${zoom.redirect.uri}")
    private String redirectUri;

    @Autowired
    private TeacherProfileRepository teacherProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/callback")
    public ResponseEntity<?> handleZoomCallback(@RequestParam("code") String code) {
        // Exchange code for access token
        String tokenUrl = "https://zoom.us/oauth/token";
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(clientId, clientSecret);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("code", code);
        params.add("redirect_uri", redirectUri);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            // Parse the token response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(response.getBody());
            String accessToken = node.get("access_token").asText();
            String refreshToken = node.get("refresh_token").asText();
            long expiresIn = node.get("expires_in").asLong();

            // Use access token to get user info from Zoom
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
            ResponseEntity<String> userResponse = restTemplate.exchange(
                    "https://api.zoom.us/v2/users/me",
                    HttpMethod.GET,
                    userRequest,
                    String.class);
            JsonNode userNode = mapper.readTree(userResponse.getBody());
            String email = userNode.get("email").asText();

            // Find teacher by user email
            TeacherProfile teacher = teacherProfileRepository.findByUserEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found for email: " + email));
            teacher.setZoomAccessToken(accessToken);
            teacher.setZoomRefreshToken(refreshToken);
            teacher.setZoomTokenExpiresAt(Instant.now().plusSeconds(expiresIn));
            teacherProfileRepository.save(teacher);

            return ResponseEntity.ok("Zoom tokens encrypted and saved successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to get Zoom access token: " + e.getMessage());
        }
    }
}