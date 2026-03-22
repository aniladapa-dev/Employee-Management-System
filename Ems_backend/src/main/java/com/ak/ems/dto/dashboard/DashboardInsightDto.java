package com.ak.ems.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardInsightDto {
    private String title;
    private String type; // e.g., "list"
    private List<Object> items;
}
