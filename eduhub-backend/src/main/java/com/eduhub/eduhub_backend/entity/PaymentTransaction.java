package com.eduhub.eduhub_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private TeacherResource resource;

    
    private BigDecimal amount;
    
    private String checkoutRequestId;
    private String merchantRequestId;
    private String mpesaReceiptNumber;
    private String phoneNumber;
    private String status;
    
    private LocalDateTime transactionDate = LocalDateTime.now();

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public TeacherResource getResource() { return resource; }
    public void setResource(TeacherResource resource) { this.resource = resource; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCheckoutRequestId() { return checkoutRequestId; }
    public void setCheckoutRequestId(String checkoutRequestId) { this.checkoutRequestId = checkoutRequestId; }

    public String getMerchantRequestId() { return merchantRequestId; }
    public void setMerchantRequestId(String merchantRequestId) { this.merchantRequestId = merchantRequestId; }

    public String getMpesaReceiptNumber() { return mpesaReceiptNumber; }
    public void setMpesaReceiptNumber(String mpesaReceiptNumber) { this.mpesaReceiptNumber = mpesaReceiptNumber; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
}