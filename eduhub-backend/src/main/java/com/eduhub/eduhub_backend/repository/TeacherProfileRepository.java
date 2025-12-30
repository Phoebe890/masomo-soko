package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, Long> {
    
  Optional<TeacherProfile> findByUserId(Long userId);

    
    Optional<TeacherProfile> findByUser_Email(String email);
}