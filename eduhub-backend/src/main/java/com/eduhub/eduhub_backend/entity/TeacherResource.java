package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;

@Entity
public class TeacherResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String subject;
    private String grade;
    private String curriculum;
    private String pricing;
    private Double price;
    private String filePath;

    @Column(name = "preview_image_url")
    private String previewImageUrl;

    @Column(name = "has_preview", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean hasPreview;

    private boolean previewEnabled;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getCurriculum() {
        return curriculum;
    }

    public void setCurriculum(String curriculum) {
        this.curriculum = curriculum;
    }

    public String getPricing() {
        return pricing;
    }

    public void setPricing(String pricing) {
        this.pricing = pricing;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPreviewImageUrl() {
        if (this.previewEnabled && this.filePath != null && this.filePath.contains("/upload/")) {
            String[] parts = this.filePath.split("/upload/");
            if (parts.length == 2) {
                String baseUrl = parts[0] + "/upload/";
                String pathPart = parts[1]; // This includes .pdf
                String transformations = "pg_1,w_800,f_auto,q_auto/";
                return baseUrl + transformations + pathPart;
            }
        }
        return null;
    }

    public boolean isHasPreview() {
        return hasPreview;
    }

    public void setHasPreview(boolean hasPreview) {
        this.hasPreview = hasPreview;
    }

    public boolean isPreviewEnabled() {
        return previewEnabled;
    }

    public void setPreviewEnabled(boolean previewEnabled) {
        this.previewEnabled = previewEnabled;
    }
}