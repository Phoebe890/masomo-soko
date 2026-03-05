package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.*;
import com.eduhub.eduhub_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class WalletController {

    @Autowired private UserRepository userRepository;
    @Autowired private TeacherProfileRepository profileRepository;
    @Autowired private WithdrawalRepository withdrawalRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private TeacherResourceRepository resourceRepository;
private static final Double TEACHER_COMMISSION_RATE = 0.80;

  @GetMapping("/summary")
public ResponseEntity<?> getWalletSummary(@AuthenticationPrincipal UserDetails userDetails) {
    User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    TeacherProfile profile = profileRepository.findByUserId(teacher.getId()).orElse(null);

    String mpesaNumber = (profile != null && profile.getPaymentNumber() != null) ? profile.getPaymentNumber() : "";

    List<TeacherResource> resources = resourceRepository.findByUserId(teacher.getId());
    List<Long> resourceIds = resources.stream().map(TeacherResource::getId).toList();
    
    Double totalEarnings = 0.0;
    if (!resourceIds.isEmpty()) {
        Double rawSales = purchaseRepository.sumPriceByResourceIdIn(resourceIds);
        // Calculate the 80% for the teacher
        if (rawSales != null) totalEarnings = Math.floor(rawSales * 0.80); 
    }

    Double totalWithdrawn = withdrawalRepository.sumTotalWithdrawn(teacher.getId());
    if (totalWithdrawn == null) totalWithdrawn = 0.0;

    Double availableBalance = totalEarnings - totalWithdrawn;

    var withdrawals = withdrawalRepository.findByTeacherOrderByRequestedAtDesc(teacher);
    
    Map<String, Object> response = new HashMap<>();
    response.put("balance", availableBalance);
    response.put("mpesaNumber", mpesaNumber);
    response.put("history", withdrawals);

    return ResponseEntity.ok(response);
}

    @PostMapping("/withdraw")
    public ResponseEntity<?> requestWithdrawal(
            @AuthenticationPrincipal UserDetails userDetails, 
            @RequestParam Double amount) {
        
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        TeacherProfile profile = profileRepository.findByUserId(teacher.getId()).orElse(null);
        
        String mpesaNumber = (profile != null) ? profile.getPaymentNumber() : null;

        if (mpesaNumber == null || mpesaNumber.isEmpty()) {
            return ResponseEntity.badRequest().body("Please set an M-Pesa number in Settings first.");
        }

        // Recalculate Balance to ensure server-side validation
        List<TeacherResource> resources = resourceRepository.findByUserId(teacher.getId());
        List<Long> resourceIds = resources.stream().map(TeacherResource::getId).toList();
        
       Double totalEarnings = 0.0;
    if (!resourceIds.isEmpty()) {
        Double rawSalesSum = purchaseRepository.sumPriceByResourceIdIn(resourceIds);
        if (rawSalesSum != null) {
            totalEarnings = Math.floor(rawSalesSum * TEACHER_COMMISSION_RATE); 
        }
    }

        Double totalWithdrawn = withdrawalRepository.sumTotalWithdrawn(teacher.getId());
        if (totalWithdrawn == null) totalWithdrawn = 0.0;
        
        Double currentBalance = totalEarnings - totalWithdrawn;

        if (amount > currentBalance) {
            return ResponseEntity.badRequest().body("Insufficient funds.");
        }
        
        if (amount < 5) {
            return ResponseEntity.badRequest().body("Minimum withdrawal is KES 5.");
        }

        // Create Withdrawal
        Withdrawal withdrawal = new Withdrawal(teacher, amount, mpesaNumber);
        withdrawalRepository.save(withdrawal);

        return ResponseEntity.ok("Withdrawal request submitted successfully.");
    }
}