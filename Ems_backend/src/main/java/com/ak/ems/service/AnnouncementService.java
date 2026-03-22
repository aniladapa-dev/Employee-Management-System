package com.ak.ems.service;

import com.ak.ems.dto.AnnouncementDto;
import java.util.List;

public interface AnnouncementService {
    AnnouncementDto createAnnouncement(AnnouncementDto announcementDto);
    List<AnnouncementDto> getAllAnnouncements();
}
