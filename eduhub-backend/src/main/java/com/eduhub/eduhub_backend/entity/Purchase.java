package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private TeacherResource resource;

    private LocalDateTime purchasedAt;

    public Purchase() {
    }

    public Purchase(User student, TeacherResource resource, LocalDateTime purchasedAt) {
        this.student = student;
        this.resource = resource;
        this.purchasedAt = purchasedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public TeacherResource getResource() {
        return resource;
    }

    public void setResource(TeacherResource resource) {
        this.resource = resource;
    }

    public LocalDateTime getPurchasedAt() {
        return purchasedAt;
    }

    public void setPurchasedAt(LocalDateTime purchasedAt) {
        this.purchasedAt = purchasedAt;
    }
}