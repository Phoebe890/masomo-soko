package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.Notification;
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTeacherOrderByCreatedAtDesc(User teacher);
}