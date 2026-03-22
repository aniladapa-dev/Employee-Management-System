package com.ak.ems.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponseDto {
    private String title;
    private String subtitle;
    private List<DashboardCardDto> overviewCards;
    private List<DashboardAnalyticsDto> analytics;
    private List<DashboardInsightDto> insights;
    private List<DashboardActionDto> quickActions;
    private List<com.ak.ems.dto.AnnouncementDto> announcements;
    private com.ak.ems.dto.AttendanceSummaryDto userAttendance;
}
