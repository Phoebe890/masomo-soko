package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.PaymentTransaction;
import com.eduhub.eduhub_backend.entity.TeacherResource; // Import this
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    
    Optional<PaymentTransaction> findByCheckoutRequestId(String checkoutRequestId);

    List<PaymentTransaction> findByUser(User user);

    // FIX: Add this to allow deleting transactions linked to a resource
    List<PaymentTransaction> findByResource(TeacherResource resource);
}