package com.eduhub.eduhub_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.time.LocalDateTime;
@Entity
@Table(name = "users")
public class User implements UserDetails { 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT", unique = true, nullable = false)
    private String email;
private String profilePicPath;
    private String password;

    private String role; // STUDENT, TEACHER, ADMIN
private String resetOtp;
private LocalDateTime resetOtpExpiry;
    private Boolean active = true;

   
    @Column(columnDefinition = "TEXT")
    private String profilePic;

    @Column(length = 2048)
    private String zoomAccessToken;

    @Column(length = 2048)
    private String zoomRefreshToken;

    @Column(nullable = false)
    private boolean enabled = true;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notification> notifications = new ArrayList<>();

    // --- Constructors ---
    public User() {}

    public User(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
public String getProfilePicPath() { return profilePicPath; }
public void setProfilePicPath(String profilePicPath) { this.profilePicPath = profilePicPath; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
//  Getters and Setters
public String getResetOtp() { return resetOtp; }
public void setResetOtp(String resetOtp) { this.resetOtp = resetOtp; }

public LocalDateTime getResetOtpExpiry() { return resetOtpExpiry; }
public void setResetOtpExpiry(LocalDateTime resetOtpExpiry) { this.resetOtpExpiry = resetOtpExpiry; }
    
    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    
    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public String getZoomAccessToken() { return zoomAccessToken; }
    public void setZoomAccessToken(String zoomAccessToken) { this.zoomAccessToken = zoomAccessToken; }

    public String getZoomRefreshToken() { return zoomRefreshToken; }
    public void setZoomRefreshToken(String zoomRefreshToken) { this.zoomRefreshToken = zoomRefreshToken; }

   
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // If role is null, default to STUDENT to prevent crashes
        if (this.role == null) return List.of(new SimpleGrantedAuthority("ROLE_STUDENT"));
        
       
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.toUpperCase())); 
    }

    @Override
    public String getUsername() {
        return this.email; 
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public List<Notification> getNotifications() { return notifications; }
    public void setNotifications(List<Notification> notifications) { this.notifications = notifications; }
}