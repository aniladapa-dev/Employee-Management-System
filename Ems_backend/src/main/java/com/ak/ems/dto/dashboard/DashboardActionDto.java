package com.ak.ems.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardActionDto {
    private String title;
    private String icon;
    private String link;
    private String color;
}
