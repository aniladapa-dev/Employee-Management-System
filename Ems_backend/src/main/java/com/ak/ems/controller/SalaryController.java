package com.ak.ems.controller;

import com.ak.ems.dto.*;
import com.ak.ems.response.ApiResponse;
import com.ak.ems.service.SalaryService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/salary")
@AllArgsConstructor
@CrossOrigin("*")
public class SalaryController {

    private final SalaryService salaryService;

    // Update employee salary - Only ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{empId}")
    public ResponseEntity<ApiResponse<String>> updateSalary(@PathVariable("empId") String empId, @Valid @RequestBody UpdateSalaryDto updateSalaryDto) {
        String response = salaryService.updateSalary(empId, updateSalaryDto);
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }

    // Get employee salary
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/{empId}")
    public ResponseEntity<ApiResponse<BigDecimal>> getEmployeeSalary(@PathVariable("empId") String empId) {
        BigDecimal salary = salaryService.getEmployeeSalary(empId);
        return ResponseEntity.ok(ApiResponse.success("Success", salary));
    }

    // Get salary history by employee
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/history/{empId}")
    public ResponseEntity<ApiResponse<List<SalaryHistoryDto>>> getSalaryHistory(@PathVariable("empId") String empId) {
        List<SalaryHistoryDto> history = salaryService.getSalaryHistoryByEmployee(empId);
        return ResponseEntity.ok(ApiResponse.success("Success", history));
    }

    // Generate monthly salary - Only ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<String>> generateMonthlySalary(@Valid @RequestBody GenerateSalaryDto generateSalaryDto) {
        String response = salaryService.generateMonthlySalary(generateSalaryDto);
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }

    // Get all salary records - Only ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/records")
    public ResponseEntity<ApiResponse<List<SalaryRecordDto>>> getAllSalaryRecords() {
        List<SalaryRecordDto> records = salaryService.getAllSalaryRecords();
        return ResponseEntity.ok(ApiResponse.success("Success", records));
    }

    // Get salary records by employee
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/records/{empId}")
    public ResponseEntity<ApiResponse<List<SalaryRecordDto>>> getSalaryRecordsByEmployee(@PathVariable("empId") String empId) {
        List<SalaryRecordDto> records = salaryService.getSalaryRecordsByEmployee(empId);
        return ResponseEntity.ok(ApiResponse.success("Success", records));
    }

    // Mark salary as paid - Only ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/records/{recordId}/pay")
    public ResponseEntity<ApiResponse<String>> markSalaryAsPaid(@PathVariable("recordId") Long recordId) {
        String response = salaryService.markSalaryAsPaid(recordId);
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }

    // Pay all pending salaries for a month/year - Only ADMIN
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/records/pay-all")
    public ResponseEntity<ApiResponse<String>> payAllPendingSalaries(@RequestParam("month") int month, @RequestParam("year") int year) {
        String response = salaryService.payAllPendingSalaries(month, year);
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }
}
