package com.ak.ems.dto;

import com.ak.ems.entity.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponseDto {

    private BasicInfo basicInfo;
    private WorkInfo workInfo;
    private SalaryInfo salary;
    private AttendanceSummary attendance;
    private LeaveSummary leave;
    private AdminActivitySummary adminActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BasicInfo {
        private Long userId;
        private Long employeeId;
        private String name;
        private String email;
        private String phone;
        private String address;
        private String role;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime lastLoginTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkInfo {
        private String designation;
        private String department;
        private String team;
        private LocalDate joiningDate;
        private Double yearsOfExperience;
        private java.util.List<String> skills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalaryInfo {
        private BigDecimal currentSalary;
        private LocalDateTime lastSalaryUpdatedDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceSummary {
        private Long presentDays;
        private Long absentDays;
        private Long leaveDays;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveSummary {
        private Long leavesTaken;
        private Long leavesRemaining;
        private List<LeaveRequestListItem> recentLeaveRequests;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveRequestListItem {
        private Long id;
        private LocalDate startDate;
        private LocalDate endDate;
        private LeaveStatus status;
        private String leaveType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminActivitySummary {
        private Long totalEmployeesCreated;
        private Long totalSalaryUpdates;
        private Long totalDepartmentsCreated;
    }
}
