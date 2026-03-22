package com.ak.ems.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardCardDto {
    private String title;
    private String value;
    private String icon;
    private String color;
}
