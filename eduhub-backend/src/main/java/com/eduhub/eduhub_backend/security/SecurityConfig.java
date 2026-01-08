package com.eduhub.eduhub_backend.security;

import com.eduhub.eduhub_backend.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    // Inject the variable from application.properties / Render Env
    @Value("${cors.allowed-origins:}") 
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 1. Define the List of Allowed URLs
        List<String> origins = new ArrayList<>();
        
        // A. ALWAYS Allow Localhost (For Dev)
        origins.add("http://localhost:5173");
        origins.add("http://localhost:3000");
        origins.add("http://127.0.0.1:5173");
        origins.add("http://127.0.0.1:3000");
        
        // B. ALWAYS Allow Production Vercel URL (Hardcoded safety net)
        origins.add("https://masomo-soko.vercel.app");

        // C. Allow Dynamic URLs from Environment Variables (Render)
        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            // Splits "url1,url2" into a list and adds them
            origins.addAll(Arrays.asList(allowedOrigins.split(",")));
        }

        configuration.setAllowedOrigins(origins);
        
        // 2. Standard CORS Settings
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
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
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/teacher/top-contributors",
                                "/api/payment/callback",
                                "/uploads/**"
                        ).permitAll()
                        
                        .requestMatchers(HttpMethod.GET, "/api/teacher/resources").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/teacher/resources/**").permitAll()

                        .requestMatchers(
                                "/api/payment/pay",
                                "/api/payment/status/**"
                        ).authenticated() 
                        
                        .requestMatchers("/api/admin/**")
                            .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        .requestMatchers("/api/teacher/onboarding")
                            .hasAnyAuthority("TEACHER", "ROLE_TEACHER")

                        .requestMatchers("/api/teacher/**", "/api/coaching/**", "/api/wallet/**")
                            .hasAnyAuthority("TEACHER", "ROLE_TEACHER")
                        
                        .requestMatchers("/api/student/**")
                            .hasAnyAuthority("STUDENT", "ROLE_STUDENT")
                        
                        .anyRequest().authenticated()
                );
        return http.build();
    }
}