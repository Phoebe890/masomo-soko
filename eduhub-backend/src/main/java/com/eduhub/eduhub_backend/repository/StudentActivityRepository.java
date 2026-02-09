package com.eduhub.eduhub_backend.repository;

import com.eduhub.eduhub_backend.entity.StudentActivity;
import com.eduhub.eduhub_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface StudentActivityRepository extends JpaRepository<StudentActivity, Long> {
    
    // For Streak: Get unique dates worked, sorted descending
    @Query("SELECT DISTINCT a.activityDate FROM StudentActivity a WHERE a.user.id = :userId ORDER BY a.activityDate DESC")
    List<LocalDate> findDistinctActivityDates(@Param("userId") Long userId);

    // For Chart: Count daily activities for the last 30 days
    @Query(value = "SELECT activity_date, COUNT(*) FROM student_activities " +
           "WHERE user_id = :userId AND activity_date > CURRENT_DATE - INTERVAL '30 days' " +
           "GROUP BY activity_date", nativeQuery = true)
    List<Object[]> findActivityCountsLast30Days(@Param("userId") Long userId);

    boolean existsByUserAndActivityDate(User user, LocalDate activityDate);
}