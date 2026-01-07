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

    @GetMapping("/summary")
    public ResponseEntity<?> getWalletSummary(@AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        TeacherProfile profile = profileRepository.findByUserId(teacher.getId()).orElse(null);

        // 1. Get M-Pesa Number
        String mpesaNumber = (profile != null && profile.getPaymentNumber() != null) 
                             ? profile.getPaymentNumber() 
                             : "";

        // 2. Calculate Total Earnings (Sum of all sales)
        List<TeacherResource> resources = resourceRepository.findByUserId(teacher.getId());
        List<Long> resourceIds = resources.stream().map(TeacherResource::getId).toList();
        
        Double totalEarnings = 0.0;
        if (!resourceIds.isEmpty()) {
            Double salesSum = purchaseRepository.sumPriceByResourceIdIn(resourceIds);
            if (salesSum != null) totalEarnings = salesSum;
        }

        // 3. Calculate Total Withdrawals
        Double totalWithdrawn = withdrawalRepository.sumTotalWithdrawn(teacher.getId());
        if (totalWithdrawn == null) totalWithdrawn = 0.0;

        // 4. Available Balance
        Double availableBalance = totalEarnings - totalWithdrawn;

        // 5. Get History
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
            Double salesSum = purchaseRepository.sumPriceByResourceIdIn(resourceIds);
            if (salesSum != null) totalEarnings = salesSum;
        }

        Double totalWithdrawn = withdrawalRepository.sumTotalWithdrawn(teacher.getId());
        if (totalWithdrawn == null) totalWithdrawn = 0.0;
        
        Double currentBalance = totalEarnings - totalWithdrawn;

        if (amount > currentBalance) {
            return ResponseEntity.badRequest().body("Insufficient funds.");
        }
        
        if (amount < 50) {
            return ResponseEntity.badRequest().body("Minimum withdrawal is KES 50.");
        }

        // Create Withdrawal
        Withdrawal withdrawal = new Withdrawal(teacher, amount, mpesaNumber);
        withdrawalRepository.save(withdrawal);

        return ResponseEntity.ok("Withdrawal request submitted successfully.");
    }
}