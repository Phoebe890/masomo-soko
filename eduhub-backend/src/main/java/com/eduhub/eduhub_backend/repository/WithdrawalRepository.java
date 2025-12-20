package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.Withdrawal;
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
    List<Withdrawal> findByTeacherOrderByRequestedAtDesc(User teacher);
}