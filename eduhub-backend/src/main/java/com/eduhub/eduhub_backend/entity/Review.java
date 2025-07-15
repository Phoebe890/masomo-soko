package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private TeacherResource resource;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    private int rating; // 1-5
    private String comment;
    private LocalDateTime createdAt;

    public Review() {
    }

    public Review(TeacherResource resource, User student, int rating, String comment, LocalDateTime createdAt) {
        this.resource = resource;
        this.student = student;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TeacherResource getResource() {
        return resource;
    }

    public void setResource(TeacherResource resource) {
        this.resource = resource;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}