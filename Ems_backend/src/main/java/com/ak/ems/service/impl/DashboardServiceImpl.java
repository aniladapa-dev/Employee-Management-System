package com.ak.ems.service.impl;

import com.ak.ems.dto.dashboard.*;
import com.ak.ems.entity.*;
import com.ak.ems.repository.*;
import com.ak.ems.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AnnouncementRepository announcementRepository;
    private final com.ak.ems.service.AttendanceService attendanceService;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponseDto getDashboardData() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_EMPLOYEE");

        Employee employee = employeeRepository.findByUser_Username(username).orElse(null);

        DashboardResponseDto dashboard;
        if ("ROLE_ADMIN".equals(role)) {
            dashboard = getAdminDashboard();
        } else if ("ROLE_MANAGER".equals(role)) {
            dashboard = getManagerDashboard(employee);
        } else if ("ROLE_TEAM_LEADER".equals(role)) {
            dashboard = getTeamLeaderDashboard(employee);
        } else {
            dashboard = getEmployeeDashboard(employee);
        }

        // Add latest announcements to all dashboards
        dashboard.setAnnouncements(announcementRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(com.ak.ems.mapper.AnnouncementMapper::mapToAnnouncementDto)
                .collect(Collectors.toList()));

        // Add user attendance summary for employees (except Admins)
        if (employee != null && !"ROLE_ADMIN".equals(role)) {
            dashboard.setUserAttendance(attendanceService.getAttendanceSummary(employee.getId(), LocalDate.now().getMonthValue(), LocalDate.now().getYear()));
        }

        return dashboard;
    }

    private DashboardResponseDto getAdminDashboard() {
        LocalDate today = LocalDate.now();
        DashboardResponseDto dashboard = new DashboardResponseDto();
        dashboard.setTitle("Manage Your Workforce Smarter");
        dashboard.setSubtitle("Admin Control Center");

        // Overview Cards
        List<DashboardCardDto> cards = new ArrayList<>();
        cards.add(new DashboardCardDto("Total Employees", String.valueOf(employeeRepository.count()), "users", "primary"));
        cards.add(new DashboardCardDto("Total Departments", String.valueOf(departmentRepository.count()), "building", "info"));
        cards.add(new DashboardCardDto("Total Teams", String.valueOf(teamRepository.count()), "users-group", "warning"));
        cards.add(new DashboardCardDto("Active Employees", String.valueOf(employeeRepository.countByActive(true)), "check-circle", "success"));
        cards.add(new DashboardCardDto("Inactive Employees", String.valueOf(employeeRepository.countByActive(false)), "times-circle", "danger"));
        dashboard.setOverviewCards(cards);

        // Analytics
        List<DashboardAnalyticsDto> analytics = new ArrayList<>();
        
        // Department-wise Employee Count
        List<Object[]> deptCounts = employeeRepository.countEmployeesByDepartment();
        analytics.add(new DashboardAnalyticsDto(
                "Employees per Department", 
                "pie", 
                deptCounts.stream().map(o -> String.valueOf(o[0])).collect(Collectors.toList()),
                deptCounts.stream().map(o -> o[1]).collect(Collectors.toList())
        ));

        // Attendance Summary (Last 7 Days)
        LocalDate weekAgo = today.minusDays(7);
        List<Object[]> attSummary = attendanceRepository.countByStatusBetween(weekAgo, today);
        analytics.add(new DashboardAnalyticsDto(
                "Last 7 Days Attendance", 
                "bar", 
                attSummary.stream().map(o -> String.valueOf(o[0])).collect(Collectors.toList()),
                attSummary.stream().map(o -> o[1]).collect(Collectors.toList())
        ));

        dashboard.setAnalytics(analytics);

        // Insights
        List<DashboardInsightDto> insights = new ArrayList<>();
        insights.add(new DashboardInsightDto("Recently Joined Employees", "list", 
                employeeRepository.findTop5ByOrderByJoiningDateDesc().stream()
                .map(e -> Map.of("name", e.getFirstName() + " " + e.getLastName(), "date", e.getJoiningDate().toString()))
                .collect(Collectors.toList())));
        
        insights.add(new DashboardInsightDto("Inactive Employees", "list", 
                employeeRepository.findByActiveFalse().stream()
                .map(e -> Map.of("name", e.getFirstName() + " " + e.getLastName(), "email", e.getEmail()))
                .collect(Collectors.toList())));

        dashboard.setInsights(insights);

        // Quick Actions
        dashboard.setQuickActions(Arrays.asList(
                new DashboardActionDto("Add Employee", "plus", "/add-employee", "primary"),
                new DashboardActionDto("Create Dept", "building-plus", "/add-department", "info"),
                new DashboardActionDto("Create Team", "users-plus", "/add-team", "warning"),
                new DashboardActionDto("View Salaries", "money-bill-wave", "/salaries", "success")
        ));

        return dashboard;
    }

    private DashboardResponseDto getManagerDashboard(Employee manager) {
        if (manager == null || manager.getDepartment() == null) return getEmpFallbackDashboard("Manager (No Dept)");
        
        Long deptId = manager.getDepartment().getId();
        LocalDate today = LocalDate.now();
        DashboardResponseDto dashboard = new DashboardResponseDto();
        dashboard.setTitle("Department Overview: " + manager.getDepartment().getName());
        dashboard.setSubtitle("Manage your department efficiently");

        // Overview Cards
        List<DashboardCardDto> cards = new ArrayList<>();
        cards.add(new DashboardCardDto("Dept Employees", String.valueOf(employeeRepository.countByDepartmentId(deptId)), "users", "primary"));
        cards.add(new DashboardCardDto("Team Count", String.valueOf(employeeRepository.countTeamsByDepartment(deptId).size()), "microsoft-teams", "info"));
        cards.add(new DashboardCardDto("Present Today", String.valueOf(attendanceRepository.countByDateAndStatusAndDepartment(today, AttendanceStatus.PRESENT, deptId)), "user-check", "success"));
        cards.add(new DashboardCardDto("On Leave Today", String.valueOf(leaveRequestRepository.countOnLeaveTodayByDepartment(today, deptId)), "user-minus", "warning"));
        dashboard.setOverviewCards(cards);

        // Analytics
        List<DashboardAnalyticsDto> analytics = new ArrayList<>();
        List<Object[]> attSummary = attendanceRepository.countByDepartmentAndStatusBetween(deptId, today.minusDays(30), today);
        analytics.add(new DashboardAnalyticsDto("Monthly Attendance Trend", "bar", 
                attSummary.stream().map(o -> String.valueOf(o[0])).collect(Collectors.toList()),
                attSummary.stream().map(o -> o[1]).collect(Collectors.toList())));
        dashboard.setAnalytics(analytics);

        // Insights
        List<DashboardInsightDto> insights = new ArrayList<>();
        insights.add(new DashboardInsightDto("Employees on Leave Today", "list", 
                leaveRequestRepository.findEmployeesOnLeaveByDepartment(today, deptId).stream()
                .map(l -> Map.of("name", l.getEmployee().getFirstName(), "type", l.getLeaveType().toString()))
                .collect(Collectors.toList())));
        dashboard.setInsights(insights);

        dashboard.setQuickActions(Arrays.asList(
                new DashboardActionDto("View Employees", "users", "/employees", "primary"),
                new DashboardActionDto("View Attendance", "calendar-check", "/attendance", "success"),
                new DashboardActionDto("View Leaves", "calendar-minus", "/leaves", "warning")
        ));

        return dashboard;
    }

    private DashboardResponseDto getTeamLeaderDashboard(Employee leader) {
        if (leader == null || leader.getTeam() == null) return getEmpFallbackDashboard("Team Leader (No Team)");
        
        Long teamId = leader.getTeam().getId();
        LocalDate today = LocalDate.now();
        DashboardResponseDto dashboard = new DashboardResponseDto();
        dashboard.setTitle("Team Hub: " + leader.getTeam().getName());
        dashboard.setSubtitle("Monitor team productivity");

        // Overview Cards
        List<DashboardCardDto> cards = new ArrayList<>();
        long totalMembers = employeeRepository.countByTeamId(teamId);
        long presentToday = attendanceRepository.countByDateAndStatusAndTeam(today, AttendanceStatus.PRESENT, teamId);
        long onLeaveToday = leaveRequestRepository.countOnLeaveTodayByTeam(today, teamId);
        
        cards.add(new DashboardCardDto("Team Members", String.valueOf(totalMembers), "users", "primary"));
        cards.add(new DashboardCardDto("Present Today", String.valueOf(presentToday), "user-check", "success"));
        cards.add(new DashboardCardDto("On Leave Today", String.valueOf(onLeaveToday), "user-minus", "warning"));
        
        String attendanceRate = totalMembers > 0 ? (presentToday * 100 / totalMembers) + "%" : "0%";
        cards.add(new DashboardCardDto("Attendance Rate", attendanceRate, "trending-up", "info"));
        
        dashboard.setOverviewCards(cards);

        // Analytics
        List<DashboardAnalyticsDto> analytics = new ArrayList<>();
        List<Object[]> attSummary = attendanceRepository.countByTeamAndStatusBetween(teamId, today.minusDays(14), today);
        analytics.add(new DashboardAnalyticsDto("Recent Team Attendance", "bar", 
               attSummary.stream().map(o -> String.valueOf(o[0])).collect(Collectors.toList()),
               attSummary.stream().map(o -> o[1]).collect(Collectors.toList())));
        dashboard.setAnalytics(analytics);

        // Insights
        List<DashboardInsightDto> insights = new ArrayList<>();
        insights.add(new DashboardInsightDto("Pending Leave Requests", "list", 
                leaveRequestRepository.findByEmployee_Team_IdAndStatus(teamId, LeaveStatus.PENDING).stream()
                .map(l -> Map.of("name", l.getEmployee().getFirstName(), "reason", l.getReason()))
                .collect(Collectors.toList())));
        dashboard.setInsights(insights);

        dashboard.setQuickActions(Arrays.asList(
                new DashboardActionDto("View Employees", "users", "/employees", "primary"),
                new DashboardActionDto("View Leaves", "calendar-check", "/leaves", "success"),
                new DashboardActionDto("View Attendance", "calendar", "/attendance", "info")
        ));

        return dashboard;
    }

    private DashboardResponseDto getEmployeeDashboard(Employee employee) {
        if (employee == null) return getEmpFallbackDashboard("User Profiles (N/A)");
        
        LocalDate today = LocalDate.now();
        DashboardResponseDto dashboard = new DashboardResponseDto();
        dashboard.setTitle("Welcome Back, " + employee.getFirstName() + "!");
        dashboard.setSubtitle("Everything about your work life");

        // Overview Cards
        List<DashboardCardDto> cards = new ArrayList<>();
        Attendance att = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today).orElse(null);
        cards.add(new DashboardCardDto("Today Attendance", att != null ? String.valueOf(att.getStatus()) : "Not Checked In", "clock", "primary"));
        cards.add(new DashboardCardDto("Present (Month)", String.valueOf(attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(employee.getId(), AttendanceStatus.PRESENT, today.withDayOfMonth(1), today)), "calendar-alt", "success"));
        cards.add(new DashboardCardDto("Leaves Taken", String.valueOf(leaveRequestRepository.findByEmployeeIdAndStatus(employee.getId(), LeaveStatus.APPROVED).size()), "plane", "info"));
        dashboard.setOverviewCards(cards);

        // Analytics (None specifically requested for employee top center, but user wanted "attendance history")
        List<DashboardAnalyticsDto> analytics = new ArrayList<>();
        List<Object[]> history = attendanceRepository.countAttendanceHistory(employee.getId(), today.minusDays(30));
        analytics.add(new DashboardAnalyticsDto("My Monthly Attendance", "bar", 
                history.stream().map(o -> String.valueOf(o[0])).collect(Collectors.toList()),
                history.stream().map(o -> o[1]).collect(Collectors.toList())));
        dashboard.setAnalytics(analytics);

        // Insights
        List<DashboardInsightDto> insights = new ArrayList<>();
        insights.add(new DashboardInsightDto("Recent Leave Requests", "list", 
                leaveRequestRepository.findTop5ByEmployeeIdOrderByStartDateDesc(employee.getId()).stream()
                .map(l -> Map.of("type", l.getLeaveType().toString(), "status", l.getStatus().toString(), "from", l.getStartDate().toString()))
                .collect(Collectors.toList())));
        dashboard.setInsights(insights);

        // Quick Actions
        dashboard.setQuickActions(Arrays.asList(
                new DashboardActionDto("Apply Leave", "calendar-plus", "/leaves", "info"),
                new DashboardActionDto("Mark Attendance", "clock", "/attendance", "success")
        ));

        return dashboard;
    }

    private DashboardResponseDto getEmpFallbackDashboard(String sub) {
        DashboardResponseDto dashboard = new DashboardResponseDto();
        dashboard.setTitle("EMS Dashboard");
        dashboard.setSubtitle(sub);
        dashboard.setOverviewCards(new ArrayList<>());
        dashboard.setAnalytics(new ArrayList<>());
        dashboard.setInsights(new ArrayList<>());
        dashboard.setQuickActions(new ArrayList<>());
        return dashboard;
    }
}
