package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.TeacherAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface TeacherAvailabilityRepository extends JpaRepository<TeacherAvailability, Long> {
    // Find all future, non-booked slots for a specific teacher
    List<TeacherAvailability> findByTeacherIdAndIsBookedFalseAndStartTimeAfter(Long teacherId, LocalDateTime currentTime);
}