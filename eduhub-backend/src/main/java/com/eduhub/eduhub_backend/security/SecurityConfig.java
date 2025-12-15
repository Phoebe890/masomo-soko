package com.eduhub.eduhub_backend.security;

import com.eduhub.eduhub_backend.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173", 
            "http://localhost:3000", 
            "http://127.0.0.1:5173", 
            "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
            .sessionManagement(session -> session
                    .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED))
            .securityContext(securityContext -> securityContext
                    .securityContextRepository(securityContextRepository()))
            .authenticationProvider(authenticationProvider())
            .httpBasic(httpBasic -> httpBasic.disable())
            .authorizeHttpRequests(auth -> auth
                // 1. Allow OPTIONS (CORS Preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // 2. Public Endpoints (Auth, View Resources)
                .requestMatchers(
                        "/api/auth/**",
                        "/api/teacher/onboarding",
                        "/api/teacher/resources", 
                        "/api/teacher/resources/**",
                        "/api/teacher/top-contributors"
                ).permitAll()
                
                // 3. TEACHER ENDPOINTS (Accepts "TEACHER" OR "ROLE_TEACHER")
                .requestMatchers(
                        "/api/teacher/dashboard",
                        "/api/teacher/payout",
                        "/api/teacher/settings",
                        "/api/coaching/create-meeting"
                ).access((authentication, context) -> 
                    new AuthorizationDecision(
                        authentication.get().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("TEACHER") || a.getAuthority().equals("ROLE_TEACHER"))
                    ))
                
                // 3b. Teacher POST/PUT/DELETE
                .requestMatchers(HttpMethod.POST, "/api/teacher/resources").access((authentication, context) -> 
                    new AuthorizationDecision(
                        authentication.get().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("TEACHER") || a.getAuthority().equals("ROLE_TEACHER"))
                    ))
                .requestMatchers(HttpMethod.PUT, "/api/teacher/resources/**").access((authentication, context) -> 
                    new AuthorizationDecision(
                        authentication.get().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("TEACHER") || a.getAuthority().equals("ROLE_TEACHER"))
                    ))
                .requestMatchers(HttpMethod.DELETE, "/api/teacher/resources/**").access((authentication, context) -> 
                    new AuthorizationDecision(
                        authentication.get().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("TEACHER") || a.getAuthority().equals("ROLE_TEACHER"))
                    ))

                // 4. STUDENT ENDPOINTS (Accepts "STUDENT" OR "ROLE_STUDENT")
                .requestMatchers(
                        "/api/student/**" // Covers dashboard, purchases, download, etc.
                ).access((authentication, context) -> 
                    new AuthorizationDecision(
                        authentication.get().getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("STUDENT") || a.getAuthority().equals("ROLE_STUDENT"))
                    ))
                
                // 5. Default Rule
                .anyRequest().authenticated()
            );
            
        return http.build();
    }
}