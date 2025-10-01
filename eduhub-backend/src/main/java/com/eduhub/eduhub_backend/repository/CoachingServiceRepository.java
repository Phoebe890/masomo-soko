package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.CoachingService;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoachingServiceRepository extends JpaRepository<CoachingService, Long> {
    // Find all services offered by a specific teacher
    List<CoachingService> findByTeacherId(Long teacherId);
}