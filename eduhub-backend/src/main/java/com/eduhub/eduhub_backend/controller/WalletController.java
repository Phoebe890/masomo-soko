package com.eduhub.eduhub_backend.controller;

import com.eduhub.eduhub_backend.entity.*;
import com.eduhub.eduhub_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class WalletController {

    @Autowired private UserRepository userRepository;
    @Autowired private TeacherProfileRepository profileRepository;
    @Autowired private WithdrawalRepository withdrawalRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getWalletSummary(@AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        TeacherProfile profile = profileRepository.findByUserId(teacher.getId()).orElse(null);
        
        if (profile == null) return ResponseEntity.badRequest().body("Profile not found");

        var withdrawals = withdrawalRepository.findByTeacherOrderByRequestedAtDesc(teacher);
        
        return ResponseEntity.ok(Map.of(
            "balance", profile.getAccountBalance() != null ? profile.getAccountBalance() : 0.0,
            "mpesaNumber", profile.getPaymentNumber() != null ? profile.getPaymentNumber() : "",
            "history", withdrawals
        ));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> requestWithdrawal(
            @AuthenticationPrincipal UserDetails userDetails, 
            @RequestParam Double amount) {
        
        User teacher = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        TeacherProfile profile = profileRepository.findByUserId(teacher.getId()).orElseThrow();
        
        Double currentBalance = profile.getAccountBalance() != null ? profile.getAccountBalance() : 0.0;

        if (amount > currentBalance) {
            return ResponseEntity.badRequest().body("Insufficient funds.");
        }
        
        if (amount < 50) {
            return ResponseEntity.badRequest().body("Minimum withdrawal is KES 50.");
        }

        // Deduct balance immediately to prevent double spending
        profile.setAccountBalance(currentBalance - amount);
        profileRepository.save(profile);

        // Create Withdrawal Record
        Withdrawal withdrawal = new Withdrawal(teacher, amount, profile.getPaymentNumber());
        withdrawalRepository.save(withdrawal);

        return ResponseEntity.ok("Withdrawal request submitted successfully.");
    }
}