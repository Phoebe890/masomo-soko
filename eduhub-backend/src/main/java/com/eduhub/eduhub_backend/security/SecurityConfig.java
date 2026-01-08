package com.eduhub.eduhub_backend.security;

import com.eduhub.eduhub_backend.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow all standard frontend origins
        List<String> origins = Arrays.asList(
            "http://localhost:5173", 
            "http://localhost:3000",
            "https://masomosoko.co.ke", 
            "https://www.masomosoko.co.ke",
            "https://masomo-soko.vercel.app"
        );
        configuration.setAllowedOrigins(origins);
        // Allow all common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Allow necessary headers
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        // Expose headers so frontend can read them if needed
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Enable CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 2. Disable CSRF (not needed for stateless JWT)
            .csrf(csrf -> csrf.disable())
            // 3. Set Session to Stateless
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 4. Set Authentication Provider
            .authenticationProvider(authenticationProvider())
            // 5. Add JWT Filter before standard authentication
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // 6. Define URL Access Rules
            .authorizeHttpRequests(auth -> auth
                // Allow OPTIONS requests for CORS pre-flight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Public Endpoints (No Login Required)
                .requestMatchers(
                        "/api/auth/**",
                        "/api/teacher/top-contributors",
                        "/api/payment/callback",
                        "/uploads/**",
                        "/api/resources/public/**", // Assuming you have public resource viewing
                        "/api/teacher/resources",
                        "/api/teacher/resources/**"
                ).permitAll()

                // Admin Endpoints - CRITICAL FIX HERE
                // Changed "ROLE_ADMIN" to "ADMIN" to match your DB/Frontend
                .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN")
                
                // Teacher Endpoints
                .requestMatchers("/api/teacher/onboarding").hasAnyAuthority("TEACHER")
                .requestMatchers("/api/teacher/**").hasAnyAuthority("TEACHER", "ADMIN") // Admins usually can view teacher stuff too
                
                // Student Endpoints
                .requestMatchers("/api/student/**").hasAnyAuthority("STUDENT")
                
                // All other requests need authentication
                .anyRequest().authenticated()
            );

        return http.build();
    }
}