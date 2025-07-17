package com.eduhub.eduhub_backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // encrypts passwords
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/signup",
                                "/api/auth/login",
                                "/api/auth/zoom/callback",
                                "/api/teacher/onboarding",
                                "/api/teacher/payout",
                                "/api/teacher/dashboard")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/teacher/resources",
                                "/api/teacher/resources/**")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/teacher/resources").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/teacher/resources/**")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/teacher/resources/**")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/student/purchase").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/student/dashboard").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/student/purchases").permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }
}
