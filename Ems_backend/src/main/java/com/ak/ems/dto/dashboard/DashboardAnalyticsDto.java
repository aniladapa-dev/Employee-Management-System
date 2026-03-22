package com.ak.ems.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsDto {
    private String title;
    private String type; // e.g., "bar", "pie", "line"
    private List<String> labels;
    private List<Object> values;
}
