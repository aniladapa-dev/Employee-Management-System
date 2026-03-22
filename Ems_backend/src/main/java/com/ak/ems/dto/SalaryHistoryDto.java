package com.ak.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalaryHistoryDto {
    private Long id;
    private Long employeeId;
    private BigDecimal oldSalary;
    private BigDecimal newSalary;
    private String changedBy;
    private LocalDateTime changedAt;
    private String reason;
}
