package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String checkoutRequestId; // Crucial: Links M-Pesa callback to this record
    private String phoneNumber;
    private Double amount;
    private String status; // PENDING, COMPLETED, FAILED

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private TeacherResource resource;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCheckoutRequestId() { return checkoutRequestId; }
    public void setCheckoutRequestId(String checkoutRequestId) { this.checkoutRequestId = checkoutRequestId; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public TeacherResource getResource() { return resource; }
    public void setResource(TeacherResource resource) { this.resource = resource; }
}