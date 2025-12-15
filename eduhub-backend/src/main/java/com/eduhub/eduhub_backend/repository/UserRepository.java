package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
// This interface extends JpaRepository to provide CRUD operations for User entities.
// It includes methods to find a user by email and check if an email already exists in the