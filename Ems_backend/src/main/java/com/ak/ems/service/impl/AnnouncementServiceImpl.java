package com.ak.ems.service.impl;

import com.ak.ems.dto.AnnouncementDto;
import com.ak.ems.entity.Announcement;
import com.ak.ems.entity.User;
import com.ak.ems.repository.AnnouncementRepository;
import com.ak.ems.repository.UserRepository;
import com.ak.ems.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    @Override
    public AnnouncementDto createAnnouncement(AnnouncementDto announcementDto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));

        Announcement announcement = new Announcement();
        announcement.setTitle(announcementDto.getTitle());
        announcement.setMessage(announcementDto.getMessage());
        announcement.setCreatedBy(admin);
        
        Announcement saved = announcementRepository.save(announcement);
        return mapToDto(saved);
    }

    @Override
    public List<AnnouncementDto> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AnnouncementDto mapToDto(Announcement announcement) {
        return new AnnouncementDto(
                announcement.getId(),
                announcement.getTitle(),
                announcement.getMessage(),
                announcement.getCreatedBy().getUsername(),
                announcement.getCreatedAt()
        );
    }
}
