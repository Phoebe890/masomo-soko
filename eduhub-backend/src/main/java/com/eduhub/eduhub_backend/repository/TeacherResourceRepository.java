package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.TeacherResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherResourceRepository extends JpaRepository<TeacherResource, Long> {

    List<TeacherResource> findByUserId(Long userId);

    List<TeacherResource> findBySubject(String subject);

    List<TeacherResource> findByGrade(String grade);

    List<TeacherResource> findByCurriculum(String curriculum);

    // This is the missing method that caused the error
    List<TeacherResource> findBySubjectAndGrade(String subject, String grade);
    
    List<TeacherResource> findBySubjectAndGradeAndCurriculum(String subject, String grade, String curriculum);
}