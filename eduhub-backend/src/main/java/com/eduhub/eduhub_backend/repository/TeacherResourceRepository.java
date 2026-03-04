package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.TeacherResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherResourceRepository extends JpaRepository<TeacherResource, Long> {

    List<TeacherResource> findByUserId(Long userId);

    List<TeacherResource> findBySubject(String subject);

    List<TeacherResource> findByGrade(String grade);

    List<TeacherResource> findByCurriculum(String curriculum);

    List<TeacherResource> findBySubjectAndGrade(String subject, String grade);

    List<TeacherResource> findBySubjectAndGradeAndCurriculum(String subject, String grade, String curriculum);
 
    List<TeacherResource> findByTitleContainingIgnoreCase(String title);
    // Custom query to get user IDs and resource counts, ordered by count descending
    @Query("SELECT tr.user.id, COUNT(tr) as resourceCount FROM TeacherResource tr GROUP BY tr.user.id ORDER BY resourceCount DESC")
    List<Object[]> findTopContributors();
}