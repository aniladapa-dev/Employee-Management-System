package com.ak.ems.service.impl;

import com.ak.ems.dto.AttendanceDto;
import com.ak.ems.entity.Attendance;
import com.ak.ems.entity.AttendanceStatus;
import com.ak.ems.entity.Employee;
import com.ak.ems.exception.ResourceNotFoundException;
import com.ak.ems.repository.AttendanceRepository;
import com.ak.ems.repository.EmployeeRepository;
import com.ak.ems.service.AttendanceService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import com.ak.ems.service.OfficeLocationService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private AttendanceRepository attendanceRepository;
    private EmployeeRepository employeeRepository;
    private OfficeLocationService officeLocationService;

    private static final LocalTime GRACE_PERIOD = LocalTime.of(9, 15);

    @Override
    public AttendanceDto markCheckIn(Long employeeId, AttendanceDto attendanceDto) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        
        attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .ifPresent(a -> { throw new IllegalArgumentException("Already checked in for today"); });

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        if (attendanceDto.getWorkMode() == com.ak.ems.entity.WorkMode.OFFICE) {
            if (attendanceDto.getLatitude() == null || attendanceDto.getLongitude() == null) {
                throw new IllegalArgumentException("Location required for Office Check-In. Please enable GPS permissions.");
            }
            List<com.ak.ems.dto.OfficeLocationDto> offices = officeLocationService.getAllOfficeLocations();
            boolean isWithinAnyOffice = false;
            double closestDistance = Double.MAX_VALUE;
            
            for (com.ak.ems.dto.OfficeLocationDto officeLoc : offices) {
                double distance = calculateDistance(officeLoc.getLatitude(), officeLoc.getLongitude(), attendanceDto.getLatitude(), attendanceDto.getLongitude());
                if (distance <= officeLoc.getRadiusMeters()) {
                    isWithinAnyOffice = true;
                    break;
                }
                if (distance < closestDistance) closestDistance = distance;
            }
            
            if (!isWithinAnyOffice && !offices.isEmpty()) {
                throw new IllegalArgumentException("You are too far from any designated office location (Closest is approx " + Math.round(closestDistance) + "m away). Please get closer or use Remote mode.");
            }
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setCheckIn(now);
        attendance.setWorkMode(attendanceDto.getWorkMode());

        // Safety: ensure lat/long are never null to avoid DB constraint issues
        if (attendanceDto.getWorkMode() == com.ak.ems.entity.WorkMode.REMOTE) {
            attendance.setLatitude(0.0);
            attendance.setLongitude(0.0);
        } else {
            attendance.setLatitude(attendanceDto.getLatitude());
            attendance.setLongitude(attendanceDto.getLongitude());
        }
        
        // Logic for Late vs Present vs Pending
        if (attendanceDto.getWorkMode() == com.ak.ems.entity.WorkMode.REMOTE) {
            attendance.setStatus(AttendanceStatus.PENDING_APPROVAL);
        } else if (now.isAfter(GRACE_PERIOD)) {
            attendance.setStatus(AttendanceStatus.LATE);
        } else {
            attendance.setStatus(com.ak.ems.entity.AttendanceStatus.PRESENT);
        }

        Attendance savedRecord = attendanceRepository.save(attendance);
        return mapToDto(savedRecord);
    }

    @Override
    public AttendanceDto rejectAttendance(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        
        Employee currentEmployee = getCurrentEmployee();
        Employee targetEmployee = attendance.getEmployee();

        validateApproverAction(currentEmployee, targetEmployee, "reject");

        attendance.setStatus(com.ak.ems.entity.AttendanceStatus.REJECTED);
        Attendance saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }

    @Override
    public AttendanceDto markCheckOut(Long employeeId) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new ResourceNotFoundException("No check-in record found for today. Please check-in first."));

        if (attendance.getCheckOut() != null) {
            throw new IllegalArgumentException("Already checked out for today");
        }

        attendance.setCheckOut(now);

        // 5 PM Rule: ONLY downgrade to HALF_DAY if they are currently PRESENT or LATE.
        // Do NOT override PENDING_APPROVAL (remote workers) or other final statuses.
        if (now.isBefore(LocalTime.of(17, 0)) &&
            (attendance.getStatus() == AttendanceStatus.PRESENT || attendance.getStatus() == AttendanceStatus.LATE)) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        Attendance savedRecord = attendanceRepository.save(attendance);
        return mapToDto(savedRecord);
    }

    @Override
    public AttendanceDto approveAttendance(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));

        Employee currentEmployee = getCurrentEmployee();
        Employee targetEmployee = attendance.getEmployee();

        validateApproverAction(currentEmployee, targetEmployee, "approve");

        if (attendance.getStatus() == AttendanceStatus.PENDING_APPROVAL) {
            if (attendance.getCheckIn().isAfter(GRACE_PERIOD)) {
                attendance.setStatus(AttendanceStatus.LATE);
            } else {
                attendance.setStatus(AttendanceStatus.PRESENT);
            }
        }

        Attendance savedRecord = attendanceRepository.save(attendance);
        return mapToDto(savedRecord);
    }

    @Override
    public List<AttendanceDto> getEmployeeAttendance(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDto> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDto> getHierarchyAttendance(LocalDate date, Long departmentId, Long teamId) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Employee currentEmployee = employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        boolean isAdmin = currentEmployee.getUser().getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        boolean isManager = currentEmployee.getUser().getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));
        boolean isTeamLeader = currentEmployee.getUser().getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_TEAM_LEADER"));

        if (isAdmin) {
            // Can use requested filters freely
        } else if (isManager) {
            // Locked to their department
            departmentId = currentEmployee.getDepartment() != null ? currentEmployee.getDepartment().getId() : null;
        } else if (isTeamLeader) {
            // Locked to their team
            teamId = currentEmployee.getTeam() != null ? currentEmployee.getTeam().getId() : null;
            departmentId = currentEmployee.getDepartment() != null ? currentEmployee.getDepartment().getId() : null;
        } else {
            // Not an approver, restrict to self
            return getEmployeeAttendance(currentEmployee.getId());
        }

        List<Attendance> attendances = attendanceRepository.getFilteredAttendance(date, departmentId, teamId);
        return attendances.stream()
                .filter(a -> isAdmin || !a.getEmployee().getId().equals(currentEmployee.getId()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AttendanceDto mapToDto(Attendance attendance) {
        String lastName = attendance.getEmployee().getLastName();
        String empName = attendance.getEmployee().getFirstName() + (lastName != null ? " " + lastName : "");
        
        // Safely check roles - employee might not have a linked user account
        boolean isManager = false;
        boolean isTeamLeader = false;
        if (attendance.getEmployee().getUser() != null) {
            isManager = attendance.getEmployee().getUser().getRoles().stream()
                    .anyMatch(r -> r.getName().equals("ROLE_MANAGER"));
            isTeamLeader = attendance.getEmployee().getUser().getRoles().stream()
                    .anyMatch(r -> r.getName().equals("ROLE_TEAM_LEADER"));
        }
        
        return new AttendanceDto(
                attendance.getId(),
                attendance.getEmployee().getId(),
                empName,
                attendance.getDate(),
                attendance.getCheckIn(),
                attendance.getCheckOut(),
                attendance.getStatus(),
                attendance.getWorkMode(),
                attendance.getLatitude(),
                attendance.getLongitude(),
                attendance.getRemarks(),
                isManager,
                isTeamLeader,
                attendance.getWorkingHours()
        );
    }

    @Override
    public com.ak.ems.dto.AttendanceSummaryDto getAttendanceSummary(Long employeeId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        List<Attendance> attendances = attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, start, end);

        java.util.Map<String, Long> counts = attendances.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().toString(), Collectors.counting()));

        double avgHours = attendances.stream()
                .filter(a -> a.getWorkingHours() != null)
                .mapToDouble(Attendance::getWorkingHours)
                .average()
                .orElse(0.0);

        com.ak.ems.dto.AttendanceSummaryDto summary = new com.ak.ems.dto.AttendanceSummaryDto();
        summary.setTotalDays(attendances.size());
        summary.setPresentDays(counts.getOrDefault("PRESENT", 0L).intValue());
        summary.setLateDays(counts.getOrDefault("LATE", 0L).intValue());
        summary.setHalfDays(counts.getOrDefault("HALF_DAY", 0L).intValue());
        summary.setAverageWorkingHours(Math.round(avgHours * 100.0) / 100.0);
        summary.setStatusCounts(counts);

        return summary;
    }

    private Employee getCurrentEmployee() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current employee profile not found"));
    }

    private void validateApproverAction(Employee currentEmployee, Employee targetEmployee, String action) {
        boolean isAdmin = currentEmployee.getUser().getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        boolean isManager = currentEmployee.getUser().getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_MANAGER"));
        boolean isTeamLeader = currentEmployee.getUser().getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_TEAM_LEADER"));

        if (isAdmin) return;

        if (targetEmployee.getId().equals(currentEmployee.getId())) {
            String roleMsg = isManager ? "an Admin" : (isTeamLeader ? "your Manager" : "an Approver");
            throw new IllegalArgumentException("You cannot " + action + " your own attendance. It must be actioned by " + roleMsg + ".");
        }

        if (isManager) {
            if (targetEmployee.getDepartment() == null || currentEmployee.getDepartment() == null ||
                !targetEmployee.getDepartment().getId().equals(currentEmployee.getDepartment().getId())) {
                throw new IllegalArgumentException("You can only " + action + " attendance for employees in your department.");
            }
        } else if (isTeamLeader) {
            if (targetEmployee.getTeam() == null || currentEmployee.getTeam() == null ||
                !targetEmployee.getTeam().getId().equals(currentEmployee.getTeam().getId())) {
                throw new IllegalArgumentException("You can only " + action + " attendance for employees in your team.");
            }
        } else {
            throw new IllegalArgumentException("You do not have permission to " + action + " attendance.");
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // convert to meters
    }
}
