package com.ak.ems.service;

import com.ak.ems.entity.Attendance;
import com.ak.ems.repository.AttendanceRepository;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Automatically checks out any employee who checked in but forgot to check out.
 * Runs every day at 6:00 PM (18:00).
 */
@Service
@AllArgsConstructor
public class AutoCheckoutService {

    private final AttendanceRepository attendanceRepository;

    private static final LocalTime AUTO_CHECKOUT_TIME = LocalTime.of(18, 0);

    /**
     * Scheduled to run daily at exactly 6:00 PM (18:00).
     * Finds all attendance records for today where checkOut is still null,
     * and automatically sets their checkOut to 6:00 PM.
     */
    @Scheduled(cron = "0 0 18 * * *") // Every day at 18:00
    @Transactional
    public void autoCheckoutAll() {
        LocalDate today = LocalDate.now();
        List<Attendance> openAttendances = attendanceRepository.findByDate(today);

        int count = 0;
        for (Attendance attendance : openAttendances) {
            if (attendance.getCheckOut() == null) {
                attendance.setCheckOut(AUTO_CHECKOUT_TIME);
                // Do NOT change status: if they were PENDING_APPROVAL, keep it.
                // If they were PRESENT or LATE, they become a full-day worker since we auto-close at 6 PM (after 5 PM).
                attendanceRepository.save(attendance);
                count++;
            }
        }

        System.out.println("AUTO-CHECKOUT: Automatically checked out " + count + " employee(s) at 6:00 PM on " + today);
    }
}
