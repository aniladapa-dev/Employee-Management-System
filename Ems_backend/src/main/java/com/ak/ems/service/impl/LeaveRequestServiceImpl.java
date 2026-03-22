package com.ak.ems.service.impl;

import com.ak.ems.dto.LeaveRequestDto;
import com.ak.ems.entity.Department;
import com.ak.ems.entity.Employee;
import com.ak.ems.entity.LeaveRequest;
import com.ak.ems.entity.LeaveStatus;
import com.ak.ems.entity.Team;
import com.ak.ems.entity.User;
import com.ak.ems.exception.ResourceNotFoundException;
import com.ak.ems.repository.EmployeeRepository;
import com.ak.ems.repository.LeaveRequestRepository;
import com.ak.ems.repository.UserRepository;
import com.ak.ems.service.LeaveRequestService;
import lombok.AllArgsConstructor;
import java.time.temporal.ChronoUnit;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private LeaveRequestRepository leaveRequestRepository;
    private EmployeeRepository employeeRepository;
    private UserRepository userRepository;

    @Override
    public LeaveRequestDto applyLeave(LeaveRequestDto leaveRequestDto) {
        if (leaveRequestDto.getEndDate().isBefore(leaveRequestDto.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        Employee employee = employeeRepository.findById(leaveRequestDto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + leaveRequestDto.getEmployeeId()));

        // Balance Check
        long daysRequested = ChronoUnit.DAYS.between(leaveRequestDto.getStartDate(), leaveRequestDto.getEndDate()) + 1;
        if (employee.getRemainingLeaves() < daysRequested) {
            throw new IllegalArgumentException("Insufficient leave balance. Remaining: " + employee.getRemainingLeaves() + ", Requested: " + daysRequested);
        }

        LeaveRequest leaveRequest = mapToEntity(leaveRequestDto);
        leaveRequest.setEmployee(employee);
        leaveRequest.setStatus(LeaveStatus.PENDING);

        return mapToDto(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    public LeaveRequestDto getLeaveRequestById(Long id) {
        return mapToDto(leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id)));
    }

    @Override
    public List<LeaveRequestDto> getEmployeeLeaveRequests(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestDto> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns PENDING leaves that the currently logged-in user is authorized to approve.
     * Hierarchy:
     *   ROLE_TEAM_LEADER → approves ROLE_EMPLOYEE members in their team
     *   ROLE_MANAGER     → approves ROLE_TEAM_LEADER members in their department
     *   ROLE_ADMIN       → approves ROLE_MANAGER leaves
     */
    @Override
    public List<LeaveRequestDto> getPendingApprovalsForMe() {
        User currentUser = getCurrentUser();
        List<LeaveRequest> allPending = leaveRequestRepository.findByStatus(LeaveStatus.PENDING);

        if (hasRole(currentUser, "ROLE_ADMIN")) {
            return allPending.stream()
                    .filter(lr -> lr.getEmployee().getUser() != null
                            && hasRole(lr.getEmployee().getUser(), "ROLE_MANAGER"))
                    .map(this::mapToDto).collect(Collectors.toList());

        } else if (hasRole(currentUser, "ROLE_MANAGER")) {
            Employee managerEmp = employeeRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager employee record not found"));
            return allPending.stream()
                    .filter(lr -> {
                        Employee emp = lr.getEmployee();
                        return emp.getUser() != null
                                && hasRole(emp.getUser(), "ROLE_TEAM_LEADER")
                                && emp.getDepartment() != null
                                && managerEmp.getDepartment() != null
                                && emp.getDepartment().getId().equals(managerEmp.getDepartment().getId());
                    })
                    .map(this::mapToDto).collect(Collectors.toList());

        } else if (hasRole(currentUser, "ROLE_TEAM_LEADER")) {
            Employee tlEmp = employeeRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team Leader employee record not found"));
            return allPending.stream()
                    .filter(lr -> {
                        Employee emp = lr.getEmployee();
                        return emp.getUser() != null
                                && hasRole(emp.getUser(), "ROLE_EMPLOYEE")
                                && emp.getTeam() != null && tlEmp.getTeam() != null
                                && emp.getTeam().getId().equals(tlEmp.getTeam().getId());
                    })
                    .map(this::mapToDto).collect(Collectors.toList());
        }

        return List.of();
    }

    @Override
    public LeaveRequestDto updateLeaveStatus(Long id, LeaveStatus status, String adminRemarks) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        User currentUser = getCurrentUser();

        if (hasRole(currentUser, "ROLE_ADMIN")) {
            // Admin can approve/reject anything
        } else if (hasRole(currentUser, "ROLE_MANAGER")) {
            Employee managerEmployee = employeeRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager employee record not found for user: " + currentUser.getUsername()));
            
            Employee targetEmployee = leaveRequest.getEmployee();
            Department dept = targetEmployee.getDepartment();
            
            if (dept == null) {
                throw new IllegalArgumentException("Target employee '" + targetEmployee.getFirstName() + "' has no assigned department.");
            }
            if (dept.getManager() == null) {
                throw new IllegalArgumentException("Department '" + dept.getName() + "' has no assigned manager.");
            }
            if (!dept.getManager().getId().equals(managerEmployee.getId())) {
                throw new IllegalArgumentException("You are not the assigned manager for department: " + dept.getName());
            }
        } else if (hasRole(currentUser, "ROLE_TEAM_LEADER")) {
            Employee tlEmployee = employeeRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team Leader employee record not found for user: " + currentUser.getUsername()));
            
            Employee targetEmployee = leaveRequest.getEmployee();
            Team team = targetEmployee.getTeam();
            
            if (team == null) {
                throw new IllegalArgumentException("Target employee '" + targetEmployee.getFirstName() + "' has no assigned team.");
            }
            if (team.getTeamLeader() == null) {
                throw new IllegalArgumentException("Team '" + team.getName() + "' has no assigned team leader.");
            }
            if (!team.getTeamLeader().getId().equals(tlEmployee.getId())) {
                throw new IllegalArgumentException("You are not the assigned team leader for team: " + team.getName());
            }
        } else {
            throw new IllegalArgumentException("You do not have a role (ADMIN/MANAGER/TEAM_LEADER) authorized to update leave status.");
        }

        leaveRequest.setStatus(status);
        leaveRequest.setAdminRemarks(adminRemarks);

        // Auto-deduct balance if approved
        if (status == LeaveStatus.APPROVED) {
            Employee emp = leaveRequest.getEmployee();
            long days = ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;
            emp.setUsedLeaves((emp.getUsedLeaves() != null ? emp.getUsedLeaves() : 0) + (int) days);
            employeeRepository.save(emp);
        }

        return mapToDto(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    public com.ak.ems.dto.LeaveBalanceDto getLeaveBalance(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        return new com.ak.ems.dto.LeaveBalanceDto(
                employee.getId(),
                employee.getTotalLeaves() != null ? employee.getTotalLeaves() : 24,
                employee.getUsedLeaves() != null ? employee.getUsedLeaves() : 0,
                employee.getRemainingLeaves()
        );
    }

    // --- Helpers ---

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = (principal instanceof UserDetails) ? ((UserDetails) principal).getUsername() : principal.toString();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Logged in user not found"));
    }

    private boolean hasRole(User user, String roleName) {
        return user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.getName().equals(roleName));
    }

    private LeaveRequestDto mapToDto(LeaveRequest lr) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(lr.getId());
        dto.setEmployeeId(lr.getEmployee().getId());
        String name = lr.getEmployee().getFirstName();
        if (lr.getEmployee().getLastName() != null) name += " " + lr.getEmployee().getLastName();
        dto.setEmployeeName(name.trim());
        dto.setLeaveType(lr.getLeaveType());
        dto.setStartDate(lr.getStartDate());
        dto.setEndDate(lr.getEndDate());
        dto.setStatus(lr.getStatus());
        dto.setReason(lr.getReason());
        dto.setAdminRemarks(lr.getAdminRemarks());
        return dto;
    }

    private LeaveRequest mapToEntity(LeaveRequestDto dto) {
        LeaveRequest lr = new LeaveRequest();
        lr.setLeaveType(dto.getLeaveType());
        lr.setStartDate(dto.getStartDate());
        lr.setEndDate(dto.getEndDate());
        lr.setReason(dto.getReason());
        lr.setAdminRemarks(dto.getAdminRemarks());
        return lr;
    }
}
