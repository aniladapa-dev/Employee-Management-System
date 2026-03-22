package com.ak.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummaryDto {
    private int totalDays;
    private int presentDays;
    private int lateDays;
    private int halfDays;
    private int absentDays;
    private double averageWorkingHours;
    private Map<String, Long> statusCounts;
}
