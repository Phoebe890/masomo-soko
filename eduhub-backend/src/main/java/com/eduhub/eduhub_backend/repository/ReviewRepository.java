package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.Review;
import com.eduhub.eduhub_backend.entity.TeacherResource;
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByResource(TeacherResource resource);

    List<Review> findByStudent(User student);

    List<Review> findByResourceId(Long resourceId);

    boolean existsByResourceAndStudent(TeacherResource resource, User student);
}