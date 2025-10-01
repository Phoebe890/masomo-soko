package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStudentId(Long studentId);
    List<Booking> findByTeacherId(Long teacherId);
}