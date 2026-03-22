package com.ak.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceDto {
    private Long employeeId;
    private int totalLeaves;
    private int usedLeaves;
    private int remainingLeaves;
}
