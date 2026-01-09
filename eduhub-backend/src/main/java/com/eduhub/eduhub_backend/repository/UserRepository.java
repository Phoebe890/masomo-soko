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

    // The CAST(x as string) is crucial here for Hibernate 6 to handle PostgreSQL text search correctly
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(CAST(u.name AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(CAST(u.email AS string)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:role IS NULL OR :role = 'ALL' OR u.role = :role) " +
           "AND (:enabled IS NULL OR u.enabled = :enabled)")
    Page<User> searchUsers(
            @Param("search") String search,
            @Param("role") String role,
            @Param("enabled") Boolean enabled,
            Pageable pageable
    );
}