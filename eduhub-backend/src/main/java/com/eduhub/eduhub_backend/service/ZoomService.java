package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.entity.TeacherProfile;
import com.eduhub.eduhub_backend.repository.TeacherProfileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.Instant;
import java.util.Map;
import org.springframework.util.MultiValueMap;

@Service
public class ZoomService {
    private final TeacherProfileRepository teacherProfileRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${zoom.api.client-id}")
    private String clientId;
    @Value("${zoom.api.client-secret}")
    private String clientSecret;
    @Value("${zoom.redirect.uri}")
    private String redirectUri;

    public ZoomService(TeacherProfileRepository teacherProfileRepository) {
        this.teacherProfileRepository = teacherProfileRepository;
    }

    public Map<String, Object> createMeetingForTeacher(TeacherProfile teacher, Map<String, Object> meetingDetails) {
        String accessToken = teacher.getZoomAccessToken();
        String refreshToken = teacher.getZoomRefreshToken();
        Instant expiresAt = teacher.getZoomTokenExpiresAt();

        // Token refresh logic
        if (expiresAt != null && expiresAt.isBefore(Instant.now())) {
            Map<String, String> newTokens = refreshZoomToken(refreshToken);
            accessToken = newTokens.get("access_token");
            refreshToken = newTokens.get("refresh_token");
            long expiresIn = Long.parseLong(newTokens.get("expires_in"));
            teacher.setZoomAccessToken(accessToken);
            teacher.setZoomRefreshToken(refreshToken);
            teacher.setZoomTokenExpiresAt(Instant.now().plusSeconds(expiresIn));
            teacherProfileRepository.save(teacher);
        }

        // Call Zoom API to create meeting
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(meetingDetails, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.zoom.us/v2/users/me/meetings",
                request,
                Map.class);
        return response.getBody();
    }

    private Map<String, String> refreshZoomToken(String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(clientId, clientSecret);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> params = new org.springframework.util.LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("refresh_token", refreshToken);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://zoom.us/oauth/token",
                request,
                Map.class);
        return response.getBody();
    }
}