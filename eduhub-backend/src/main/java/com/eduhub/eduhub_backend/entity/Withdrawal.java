package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Withdrawal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;

    private Double amount;
    private String mpesaNumber;
    private String status; // PENDING, PAID, REJECTED
    private String referenceNumber;
    private String transactionCode;
    private LocalDateTime requestedAt;

    public Withdrawal() {}

    public Withdrawal(User teacher, Double amount, String mpesaNumber) {
        this.teacher = teacher;
        this.amount = amount;
        this.mpesaNumber = mpesaNumber;
        this.status = "PENDING";
        this.requestedAt = LocalDateTime.now();
    }
public String getReferenceNumber() { return referenceNumber; }
public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

public String getTransactionCode() { return transactionCode; }
public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getMpesaNumber() { return mpesaNumber; }
    public void setMpesaNumber(String mpesaNumber) { this.mpesaNumber = mpesaNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
}