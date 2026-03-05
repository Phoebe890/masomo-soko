package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.Withdrawal;
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
     List<Withdrawal> findByTeacher(User teacher);
    List<Withdrawal> findByTeacherOrderByRequestedAtDesc(User teacher);

    // Calculate total amount withdrawn by a teacher (excluding rejected ones)
    @Query("SELECT SUM(w.amount) FROM Withdrawal w WHERE w.teacher.id = :teacherId AND w.status != 'REJECTED'")
    Double sumTotalWithdrawn(Long teacherId);
}