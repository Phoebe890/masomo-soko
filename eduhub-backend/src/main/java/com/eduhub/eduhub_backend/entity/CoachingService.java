package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "coaching_services")
public class CoachingService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Integer durationInMinutes;

    @Column(nullable = false)
    private Double price;

    private boolean isActive = true;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDurationInMinutes() { return durationInMinutes; }
    public void setDurationInMinutes(Integer durationInMinutes) { this.durationInMinutes = durationInMinutes; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}