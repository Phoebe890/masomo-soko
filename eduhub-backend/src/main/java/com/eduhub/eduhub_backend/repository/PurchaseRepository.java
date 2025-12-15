package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.Purchase;
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByStudent(User student);

    List<Purchase> findByResourceIdIn(List<Long> resourceIds);

    long countByResourceIdIn(List<Long> resourceIds);

    @Query("SELECT SUM(p.resource.price) FROM Purchase p WHERE p.resource.id IN :resourceIds")
    Double sumPriceByResourceIdIn(@Param("resourceIds") List<Long> resourceIds);
}