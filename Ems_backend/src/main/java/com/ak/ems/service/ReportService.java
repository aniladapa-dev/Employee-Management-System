package com.ak.ems.service;

import java.io.ByteArrayInputStream;

public interface ReportService {
    ByteArrayInputStream generateEmployeeCsvReport(Long departmentId, Long teamId);
    ByteArrayInputStream generateAttendanceExcelReport(int month, int year, Long departmentId, Long teamId);
    ByteArrayInputStream generateLeaveCsvReport(Long departmentId, Long teamId);
}
