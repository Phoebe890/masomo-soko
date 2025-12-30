package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Import this
import java.util.Optional;

@Repository 
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}