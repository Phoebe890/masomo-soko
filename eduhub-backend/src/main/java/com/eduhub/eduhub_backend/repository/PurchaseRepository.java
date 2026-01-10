package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.Purchase;
import com.eduhub.eduhub_backend.entity.TeacherResource;
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByStudent(User student);

    // FIX 3: Added this method so AdminController can delete resources
    List<Purchase> findByResource(TeacherResource resource);

    List<Purchase> findByResourceIdIn(List<Long> resourceIds);

    long countByResourceIdIn(List<Long> resourceIds);

    // Sum the actual price paid (p.price) instead of current resource price
    @Query("SELECT SUM(p.price) FROM Purchase p WHERE p.resource.id IN :resourceIds")
    Double sumPriceByResourceIdIn(@Param("resourceIds") List<Long> resourceIds);
}