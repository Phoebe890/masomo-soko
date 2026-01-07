package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;
import java.util.List;
import java.time.Instant;

@Entity
public class TeacherProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String bio;

    @ElementCollection
    private List<String> subjects;

    @ElementCollection
    private List<String> grades;

    private String paymentNumber;
    private String profilePicPath;

    // --- NEW WALLET FIELD ---
    private Double accountBalance = 0.0;

    // Zoom Integration
    @Column(length = 1024)
    private String zoomAccessToken;
    @Column(length = 1024)
    private String zoomRefreshToken;
    private Instant zoomTokenExpiresAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public List<String> getSubjects() { return subjects; }
    public void setSubjects(List<String> subjects) { this.subjects = subjects; }

    public List<String> getGrades() { return grades; }
    public void setGrades(List<String> grades) { this.grades = grades; }

    public String getPaymentNumber() { return paymentNumber; }
    public void setPaymentNumber(String paymentNumber) { this.paymentNumber = paymentNumber; }

    public String getProfilePicPath() { return profilePicPath; }
    public void setProfilePicPath(String profilePicPath) { this.profilePicPath = profilePicPath; }

    public Double getAccountBalance() { return accountBalance; }
    public void setAccountBalance(Double accountBalance) { this.accountBalance = accountBalance; }

    public String getZoomAccessToken() { return zoomAccessToken; }
    public void setZoomAccessToken(String zoomAccessToken) { this.zoomAccessToken = zoomAccessToken; }

    public String getZoomRefreshToken() { return zoomRefreshToken; }
    public void setZoomRefreshToken(String zoomRefreshToken) { this.zoomRefreshToken = zoomRefreshToken; }

    public Instant getZoomTokenExpiresAt() { return zoomTokenExpiresAt; }
    public void setZoomTokenExpiresAt(Instant zoomTokenExpiresAt) { this.zoomTokenExpiresAt = zoomTokenExpiresAt; }
}