package com.ak.ems.service.impl;

import com.ak.ems.dto.ProfileResponseDto;
import com.ak.ems.dto.ProfileUpdateRequestDto;
import com.ak.ems.entity.*;
import com.ak.ems.exception.ResourceNotFoundException;
import com.ak.ems.repository.*;
import com.ak.ems.service.ProfileService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final SalaryHistoryRepository salaryHistoryRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponseDto getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        Employee employee = employeeRepository.findByUser_Id(user.getId()).orElse(null);
        return buildProfileResponse(user, employee);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponseDto getEmployeeProfile(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
        
        checkViewPermission(employee);
        
        return buildProfileResponse(employee.getUser(), employee);
    }

    @Override
    @Transactional
    public ProfileResponseDto updateProfile(ProfileUpdateRequestDto updateRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));
        
        if (updateRequest.getPhone() != null) {
            employee.setPhone(updateRequest.getPhone());
        }
        if (updateRequest.getAddress() != null) {
            employee.setAddress(updateRequest.getAddress());
        }
        
        employeeRepository.save(employee);
        return buildProfileResponse(user, employee);
    }

    private ProfileResponseDto buildProfileResponse(User user, Employee employee) {
        String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("ROLE_EMPLOYEE");
        
        ProfileResponseDto.ProfileResponseDtoBuilder builder = ProfileResponseDto.builder();

        // 1. Basic Info
        builder.basicInfo(ProfileResponseDto.BasicInfo.builder()
                .userId(user.getId())
                .employeeId(employee != null ? employee.getId() : null)
                .name(user.getName())
                .email(user.getEmail())
                .phone(employee != null ? employee.getPhone() : null)
                .address(employee != null ? employee.getAddress() : null)
                .role(role)
                .lastLoginTime(user.getLastLoginTime())
                .build());

        // 2. Work Info
        if (employee != null) {
            Double experience = 0.0;
            if (employee.getJoiningDate() != null) {
                Period period = Period.between(employee.getJoiningDate(), LocalDate.now());
                experience = period.getYears() + (period.getMonths() / 12.0);
            }

            builder.workInfo(ProfileResponseDto.WorkInfo.builder()
                    .designation(employee.getDesignation())
                    .department(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                    .team(employee.getTeam() != null ? employee.getTeam().getName() : null)
                    .joiningDate(employee.getJoiningDate())
                    .yearsOfExperience(Math.round(experience * 10.0) / 10.0)
                    .skills(employee.getSkills().stream().map(Skill::getName).collect(java.util.stream.Collectors.toList()))
                    .build());

            // 3. Salary Info
            builder.salary(ProfileResponseDto.SalaryInfo.builder()
                    .currentSalary(employee.getCurrentSalary())
                    .lastSalaryUpdatedDate(salaryHistoryRepository.findFirstByEmployeeIdOrderByChangedAtDesc(employee.getId())
                            .map(sh -> sh.getChangedAt()).orElse(null))
                    .build());

            // 4. Attendance Summary (Current Month)
            LocalDate start = LocalDate.now().withDayOfMonth(1);
            LocalDate end = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
            builder.attendance(ProfileResponseDto.AttendanceSummary.builder()
                    .presentDays(attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(employee.getId(), AttendanceStatus.PRESENT, start, end))
                    .absentDays(attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(employee.getId(), AttendanceStatus.ABSENT, start, end))
                    .leaveDays(attendanceRepository.countByEmployeeIdAndStatusAndDateBetween(employee.getId(), AttendanceStatus.HALF_DAY, start, end)) // Simplified logic
                    .build());

            // 5. Leave Summary
            List<LeaveRequest> recentLeaves = leaveRequestRepository.findTop5ByEmployeeIdOrderByIdDesc(employee.getId());
            builder.leave(ProfileResponseDto.LeaveSummary.builder()
                    .leavesTaken(employee.getUsedLeaves() != null ? (long) employee.getUsedLeaves() : 0L)
                    .leavesRemaining(employee.getTotalLeaves() != null ? (long) (employee.getTotalLeaves() - (employee.getUsedLeaves() != null ? employee.getUsedLeaves() : 0)) : 15L)
                    .recentLeaveRequests(recentLeaves.stream().map(lr -> ProfileResponseDto.LeaveRequestListItem.builder()
                            .id(lr.getId())
                            .startDate(lr.getStartDate())
                            .endDate(lr.getEndDate())
                            .status(lr.getStatus())
                            .leaveType(lr.getLeaveType().name())
                            .build()).collect(Collectors.toList()))
                    .build());
        }

        // 6. Admin Summary
        if (role.equals("ROLE_ADMIN")) {
            builder.adminActivity(ProfileResponseDto.AdminActivitySummary.builder()
                    .totalEmployeesCreated(employeeRepository.count())
                    .totalSalaryUpdates(salaryHistoryRepository.count())
                    .totalDepartmentsCreated(departmentRepository.count())
                    .build());
        }

        return builder.build();
    }

    private void checkViewPermission(Employee targetEmployee) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsernameOrEmail(currentUsername, currentUsername)
                .orElseThrow(() -> new AccessDeniedException("Unauthorized"));
        
        String role = currentUser.getRoles().stream().findFirst().map(Role::getName).orElse("ROLE_EMPLOYEE");
        
        if (role.equals("ROLE_ADMIN")) return;

        Employee currentEmployee = employeeRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new AccessDeniedException("Unauthorized access"));

        if (role.equals("ROLE_MANAGER")) {
            if (currentEmployee.getDepartment() != null && targetEmployee.getDepartment() != null &&
                currentEmployee.getDepartment().getId().equals(targetEmployee.getDepartment().getId())) {
                return;
            }
        } else if (role.equals("ROLE_TEAM_LEADER")) {
            if (currentEmployee.getTeam() != null && targetEmployee.getTeam() != null &&
                currentEmployee.getTeam().getId().equals(targetEmployee.getTeam().getId())) {
                return;
            }
        }

        if (currentEmployee.getId().equals(targetEmployee.getId())) return;

        throw new AccessDeniedException("You do not have permission to view this profile");
    }
}
