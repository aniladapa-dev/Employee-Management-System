package com.ak.ems.mapper;

import com.ak.ems.dto.AnnouncementDto;
import com.ak.ems.entity.Announcement;

public class AnnouncementMapper {

    public static AnnouncementDto mapToAnnouncementDto(Announcement announcement) {
        return AnnouncementDto.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .message(announcement.getMessage())
                .createdBy(announcement.getCreatedBy() != null ? announcement.getCreatedBy().getName() : "System")
                .createdAt(announcement.getCreatedAt())
                .build();
    }

    public static Announcement mapToAnnouncement(AnnouncementDto announcementDto) {
        Announcement announcement = new Announcement();
        announcement.setId(announcementDto.getId());
        announcement.setTitle(announcementDto.getTitle());
        announcement.setMessage(announcementDto.getMessage());
        // User createdBy is usually handled in service
        return announcement;
    }
}
