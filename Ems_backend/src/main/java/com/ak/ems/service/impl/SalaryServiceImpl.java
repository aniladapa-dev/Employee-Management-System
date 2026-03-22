package com.ak.ems.service.impl;

import com.ak.ems.dto.*;
import com.ak.ems.entity.*;
import com.ak.ems.exception.ResourceNotFoundException;
import com.ak.ems.repository.*;
import com.ak.ems.service.SalaryService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class SalaryServiceImpl implements SalaryService {

    private final EmployeeRepository employeeRepository;
    private final SalaryHistoryRepository salaryHistoryRepository;
    private final SalaryRecordRepository salaryRecordRepository;

    @Override
    @Transactional
    public String updateSalary(String identifier, UpdateSalaryDto updateSalaryDto) {
        Employee employee = findEmployeeByIdentifier(identifier);

        BigDecimal oldSalary = employee.getCurrentSalary() != null ? employee.getCurrentSalary() : BigDecimal.ZERO;
        BigDecimal newSalary = updateSalaryDto.getNewSalary();

        if (newSalary.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Salary must be non-negative");
        }

        employee.setCurrentSalary(newSalary);
        employeeRepository.save(employee);

        // Record history
        String changedBy = SecurityContextHolder.getContext().getAuthentication().getName();
        SalaryHistory history = new SalaryHistory();
        history.setEmployee(employee);
        history.setOldSalary(oldSalary);
        history.setNewSalary(newSalary);
        history.setChangedBy(changedBy);
        history.setChangedAt(LocalDateTime.now());
        history.setReason(updateSalaryDto.getReason());
        salaryHistoryRepository.save(history);

        return "Salary updated successfully";
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getEmployeeSalary(String identifier) {
        Employee employee = findEmployeeByIdentifier(identifier);
        
        checkAccess(employee);
        
        return employee.getCurrentSalary() != null ? employee.getCurrentSalary() : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalaryHistoryDto> getSalaryHistoryByEmployee(String identifier) {
        Employee employee = findEmployeeByIdentifier(identifier);
        
        checkAccess(employee);

        return salaryHistoryRepository.findByEmployeeIdOrderByChangedAtDesc(employee.getId()).stream()
                .map(this::mapToHistoryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String generateMonthlySalary(GenerateSalaryDto generateSalaryDto) {
        List<Employee> allEmployees = employeeRepository.findAll();
        int count = 0;

        for (Employee emp : allEmployees) {
            // Avoid duplicate generation
            if (salaryRecordRepository.findByEmployeeIdAndMonthAndYear(emp.getId(), generateSalaryDto.getMonth(), generateSalaryDto.getYear()).isPresent()) {
                continue;
            }

            BigDecimal baseSalary = emp.getCurrentSalary() != null ? emp.getCurrentSalary() : BigDecimal.ZERO;
            // Simple calculation: no bonus/deductions by default in generation step unless extended
            BigDecimal bonus = BigDecimal.ZERO;
            BigDecimal deductions = BigDecimal.ZERO;
            BigDecimal finalSalary = baseSalary.add(bonus).subtract(deductions);

            SalaryRecord record = new SalaryRecord();
            record.setEmployee(emp);
            record.setMonth(generateSalaryDto.getMonth());
            record.setYear(generateSalaryDto.getYear());
            record.setBaseSalary(baseSalary);
            record.setBonus(bonus);
            record.setDeductions(deductions);
            record.setFinalSalary(finalSalary);
            record.setStatus(SalaryStatus.GENERATED);
            record.setCreatedAt(LocalDateTime.now());

            salaryRecordRepository.save(record);
            count++;
        }

        return "Generated " + count + " salary records for " + generateSalaryDto.getMonth() + "/" + generateSalaryDto.getYear();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalaryRecordDto> getSalaryRecordsByEmployee(String identifier) {
        Employee employee = findEmployeeByIdentifier(identifier);
        
        checkAccess(employee);

        return salaryRecordRepository.findByEmployeeIdOrderByYearDescMonthDesc(employee.getId()).stream()
                .map(this::mapToRecordDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalaryRecordDto> getAllSalaryRecords() {
        return salaryRecordRepository.findAll().stream()
                .map(this::mapToRecordDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String markSalaryAsPaid(Long recordId) {
        SalaryRecord record = salaryRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary record not found with id: " + recordId));
        
        record.setStatus(SalaryStatus.PAID);
        salaryRecordRepository.save(record);
        
        return "Salary marked as PAID";
    }

    @Override
    @Transactional
    public String payAllPendingSalaries(int month, int year) {
        List<SalaryRecord> records = salaryRecordRepository.findByMonthAndYear(month, year);
        int count = 0;
        for (SalaryRecord record : records) {
            if (record.getStatus() == SalaryStatus.GENERATED) {
                record.setStatus(SalaryStatus.PAID);
                salaryRecordRepository.save(record);
                count++;
            }
        }
        return "Successfully paid " + count + " employees for " + month + "/" + year;
    }

    private void checkAccess(Employee employee) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isManager = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));

        if (isAdmin) return;

        // Check if it's the employee themselves
        if (employee.getUser() != null && employee.getUser().getUsername().equals(currentUsername)) {
            return;
        }

        // Check if it's a manager in the same department
        if (isManager) {
            Employee managerEmp = employeeRepository.findByUser_Username(currentUsername)
                    .orElseThrow(() -> new AccessDeniedException("Access denied"));
            
            if (managerEmp.getDepartment() != null && employee.getDepartment() != null &&
                managerEmp.getDepartment().getId().equals(employee.getDepartment().getId())) {
                return;
            }
        }

        throw new AccessDeniedException("You do not have permission to view this salary information");
    }

    private SalaryHistoryDto mapToHistoryDto(SalaryHistory history) {
        return new SalaryHistoryDto(
                history.getId(),
                history.getEmployee().getId(),
                history.getOldSalary(),
                history.getNewSalary(),
                history.getChangedBy(),
                history.getChangedAt(),
                history.getReason()
        );
    }

    private SalaryRecordDto mapToRecordDto(SalaryRecord record) {
        Employee emp = record.getEmployee();
        String name = emp.getFirstName() + (emp.getLastName() != null ? " " + emp.getLastName() : "");
        
        return new SalaryRecordDto(
                record.getId(),
                emp.getId(),
                name,
                record.getMonth(),
                record.getYear(),
                record.getBaseSalary(),
                record.getBonus(),
                record.getDeductions(),
                record.getFinalSalary(),
                record.getStatus(),
                record.getCreatedAt()
        );
    }

    private Employee findEmployeeByIdentifier(String identifier) {
        try {
            Long id = Long.parseLong(identifier);
            return employeeRepository.findById(id)
                    .orElseGet(() -> employeeRepository.findByUser_Username(identifier)
                            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id/username: " + identifier)));
        } catch (NumberFormatException e) {
            return employeeRepository.findByUser_Username(identifier)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with username: " + identifier));
        }
    }
}
