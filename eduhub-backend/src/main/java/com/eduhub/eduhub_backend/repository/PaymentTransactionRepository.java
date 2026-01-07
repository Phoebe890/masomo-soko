package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.PaymentTransaction;
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    
    Optional<PaymentTransaction> findByCheckoutRequestId(String checkoutRequestId);

   
    List<PaymentTransaction> findByStudent(User student);
}