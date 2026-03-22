package com.ak.ems.controller;

import com.ak.ems.dto.AttendanceDto;
import com.ak.ems.response.ApiResponse;
import com.ak.ems.service.AttendanceService;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/attendance")
@AllArgsConstructor
public class AttendanceController {

    private AttendanceService attendanceService;

    @PostMapping("/check-in/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AttendanceDto>> checkIn(@PathVariable("employeeId") Long employeeId, @RequestBody AttendanceDto attendanceDto) {
        AttendanceDto savedDto = attendanceService.markCheckIn(employeeId, attendanceDto);
        return new ResponseEntity<>(new ApiResponse<>(true, "Checked in successfully", savedDto), HttpStatus.CREATED);
    }

    @PostMapping("/check-out/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<AttendanceDto>> checkOut(@PathVariable("employeeId") Long employeeId) {
        AttendanceDto attendanceDto = attendanceService.markCheckOut(employeeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Checked out successfully", attendanceDto));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getEmployeeAttendance(@PathVariable("employeeId") Long employeeId) {
        List<AttendanceDto> attendance = attendanceService.getEmployeeAttendance(employeeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance history fetched successfully", attendance));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendanceByDate(
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceDto> attendance = attendanceService.getAttendanceByDate(date);
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance for " + date + " fetched successfully", attendance));
    }

    @GetMapping("/hierarchy/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getHierarchyAttendance(
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(name = "departmentId", required = false) Long departmentId,
            @RequestParam(name = "teamId", required = false) Long teamId) {
        List<AttendanceDto> attendance = attendanceService.getHierarchyAttendance(date, departmentId, teamId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Hierarchy attendance fetched successfully", attendance));
    }

    @PatchMapping("/approve/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    public ResponseEntity<ApiResponse<AttendanceDto>> approveAttendance(@PathVariable("id") Long id) {
        AttendanceDto attendanceDto = attendanceService.approveAttendance(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance approved successfully", attendanceDto));
    }

    @PatchMapping("/reject/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    public ResponseEntity<ApiResponse<AttendanceDto>> rejectAttendance(@PathVariable("id") Long id) {
        AttendanceDto attendanceDto = attendanceService.rejectAttendance(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance rejected successfully", attendanceDto));
    }

    @GetMapping("/summary/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<com.ak.ems.dto.AttendanceSummaryDto>> getAttendanceSummary(
            @PathVariable("employeeId") Long employeeId,
            @RequestParam(name = "month", defaultValue = "0") int month,
            @RequestParam(name = "year", defaultValue = "0") int year) {
        
        int m = month == 0 ? LocalDate.now().getMonthValue() : month;
        int y = year == 0 ? LocalDate.now().getYear() : year;
        
        com.ak.ems.dto.AttendanceSummaryDto summary = attendanceService.getAttendanceSummary(employeeId, m, y);
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance summary fetched successfully", summary));
    }
}
