package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.Purchase;
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByStudent(User student);

    List<Purchase> findByResourceId(Long resourceId);

    List<Purchase> findByResourceIdIn(List<Long> resourceIds);
}