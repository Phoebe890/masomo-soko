package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import java.util.Arrays;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Normalize the email: Remove spaces and convert to lowercase
        String normalizedEmail = email.trim().toLowerCase();

        // 2. LOGGING: This will appear in your Render Logs
        System.out.println("DEBUG: Login attempt for email: [" + normalizedEmail + "]");

        // 3. Find user in Database
        com.eduhub.eduhub_backend.entity.User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> {
                    System.out.println("DEBUG: User not found in database: [" + normalizedEmail + "]");
                    return new UsernameNotFoundException("User not found: " + normalizedEmail);
                });

        // 4. Check if account is enabled
        if (!user.isEnabled()) {
            System.out.println("DEBUG: Login failed - Account is disabled for: " + normalizedEmail);
        }

        // 5. Map DB user to Spring Security User
        // Note: role is prefixed with ROLE_ to work with standard security checks
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isEnabled(),
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                Arrays.asList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
}