package com.ak.ems.service;

import com.ak.ems.dto.AttendanceDto;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceDto markCheckIn(Long employeeId, AttendanceDto attendanceDto);
    AttendanceDto markCheckOut(Long employeeId);
    AttendanceDto approveAttendance(Long attendanceId);
    List<AttendanceDto> getEmployeeAttendance(Long employeeId);
    List<AttendanceDto> getAttendanceByDate(LocalDate date);
    List<AttendanceDto> getHierarchyAttendance(LocalDate date, Long departmentId, Long teamId);
    AttendanceDto rejectAttendance(Long attendanceId);
    com.ak.ems.dto.AttendanceSummaryDto getAttendanceSummary(Long employeeId, int month, int year);
}
