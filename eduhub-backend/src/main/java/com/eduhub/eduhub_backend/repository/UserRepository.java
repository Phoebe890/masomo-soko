package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // FIX: Using CAST to ensure PostgreSQL treats columns as strings, not bytea
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(CAST(u.name as string)) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(CAST(u.email as string)) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:enabled IS NULL OR u.enabled = :enabled)")
    Page<User> searchUsers(
            @Param("search") String search,
            @Param("role") String role,
            @Param("enabled") Boolean enabled,
            Pageable pageable
    );
}