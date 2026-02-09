package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.entity.StudentActivity;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.repository.StudentActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class StudentAnalyticsService {

    @Autowired
    private StudentActivityRepository activityRepository;

    public void logActivity(User user) {
        LocalDate today = LocalDate.now();
        if (!activityRepository.existsByUserAndActivityDate(user, today)) {
            activityRepository.save(new StudentActivity(user, today));
        }
    }

    public Map<String, Object> getStreakData(Long userId) {
        List<LocalDate> dates = activityRepository.findDistinctActivityDates(userId);
        Map<String, Object> result = new HashMap<>();
        
        if (dates.isEmpty()) {
            result.put("currentStreak", 0);
            result.put("isActiveToday", false);
            return result;
        }

        LocalDate today = LocalDate.now();
        int streak = 0;
        boolean activeToday = dates.get(0).equals(today);
        
        // Check if streak is broken (last activity was before yesterday)
        if (!activeToday && !dates.get(0).equals(today.minusDays(1))) {
            streak = 0;
        } else {
            streak = 1;
            for (int i = 0; i < dates.size() - 1; i++) {
                if (dates.get(i).minusDays(1).equals(dates.get(i + 1))) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        result.put("currentStreak", streak);
        result.put("isActiveToday", activeToday);
        return result;
    }

    public List<Map<String, Object>> getChartData(Long userId) {
        List<Object[]> rows = activityRepository.findActivityCountsLast30Days(userId);
        Map<LocalDate, Integer> dataMap = new HashMap<>();
        for (Object[] row : rows) {
            dataMap.put(((java.sql.Date) row[0]).toLocalDate(), ((Number) row[1]).intValue());
        }

        List<Map<String, Object>> chart = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Map<String, Object> point = new HashMap<>();
            point.put("date", date.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + date.getDayOfMonth());
            point.put("activity", dataMap.getOrDefault(date, 0));
            chart.add(point);
        }
        return chart;
    }
}