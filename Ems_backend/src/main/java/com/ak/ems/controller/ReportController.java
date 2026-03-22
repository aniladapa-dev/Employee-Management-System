package com.ak.ems.controller;

import com.ak.ems.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/employees")
    public ResponseEntity<Resource> exportEmployees(
            @RequestParam(name = "departmentId", required = false) Long departmentId,
            @RequestParam(name = "teamId", required = false) Long teamId) {
        String filename = "employees_" + LocalDate.now() + ".csv";
        InputStreamResource file = new InputStreamResource(reportService.generateEmployeeCsvReport(departmentId, teamId));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }

    @GetMapping("/attendance")
    public ResponseEntity<Resource> exportAttendance(
            @RequestParam(name = "month", defaultValue = "0") int month,
            @RequestParam(name = "year", defaultValue = "0") int year,
            @RequestParam(name = "departmentId", required = false) Long departmentId,
            @RequestParam(name = "teamId", required = false) Long teamId) {
        
        int m = month == 0 ? LocalDate.now().getMonthValue() : month;
        int y = year == 0 ? LocalDate.now().getYear() : year;
        
        String filename = "attendance_" + m + "_" + y + ".xlsx";
        InputStreamResource file = new InputStreamResource(reportService.generateAttendanceExcelReport(m, y, departmentId, teamId));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping("/leaves")
    public ResponseEntity<Resource> exportLeaves(
            @RequestParam(name = "departmentId", required = false) Long departmentId,
            @RequestParam(name = "teamId", required = false) Long teamId) {
        String filename = "leaves_" + LocalDate.now() + ".csv";
        InputStreamResource file = new InputStreamResource(reportService.generateLeaveCsvReport(departmentId, teamId));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }
}
