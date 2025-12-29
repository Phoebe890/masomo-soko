package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList; 

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String role; // STUDENT, TEACHER, ADMIN
    private Boolean active = true;

    @Column(length = 2048) 
    private String zoomAccessToken;

    @Column(length = 2048)
    private String zoomRefreshToken;

    @Column(nullable = false)
    private boolean enabled = true;

    
    // This tells Hibernate: "When User is deleted, delete all their Notifications too"
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications = new ArrayList<>();

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public String getZoomAccessToken() { return zoomAccessToken; }
    public void setZoomAccessToken(String zoomAccessToken) { this.zoomAccessToken = zoomAccessToken; }

    public String getZoomRefreshToken() { return zoomRefreshToken; }
    public void setZoomRefreshToken(String zoomRefreshToken) { this.zoomRefreshToken = zoomRefreshToken; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    // Getter and Setter for Notifications
    public List<Notification> getNotifications() { return notifications; }
    public void setNotifications(List<Notification> notifications) { this.notifications = notifications; }
}