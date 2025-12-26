package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users") // PostgreSQL table name
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String role; // STUDENT or TEACHER
    private Boolean active = true;

    @Column(length = 2048) // Access tokens can be long
    private String zoomAccessToken;

    @Column(length = 2048)
    private String zoomRefreshToken;
 @Column(nullable = false)
    private boolean enabled = true;
    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getZoomAccessToken() {
        return zoomAccessToken;
    }

    public void setZoomAccessToken(String zoomAccessToken) {
        this.zoomAccessToken = zoomAccessToken;
    }

    public String getZoomRefreshToken() {
        return zoomRefreshToken;
    }

    public void setZoomRefreshToken(String zoomRefreshToken) {
        this.zoomRefreshToken = zoomRefreshToken;
    }
}
