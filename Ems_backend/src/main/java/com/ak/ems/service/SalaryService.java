package com.ak.ems.service;

import com.ak.ems.dto.*;
import java.math.BigDecimal;
import java.util.List;

public interface SalaryService {
    String updateSalary(String identifier, UpdateSalaryDto updateSalaryDto);
    BigDecimal getEmployeeSalary(String identifier);
    List<SalaryHistoryDto> getSalaryHistoryByEmployee(String identifier);
    String generateMonthlySalary(GenerateSalaryDto generateSalaryDto);
    List<SalaryRecordDto> getSalaryRecordsByEmployee(String identifier);
    List<SalaryRecordDto> getAllSalaryRecords();
    String markSalaryAsPaid(Long recordId);
    String payAllPendingSalaries(int month, int year);
}
