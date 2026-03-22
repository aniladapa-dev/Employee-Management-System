package com.ak.ems.service;

import com.ak.ems.dto.ProfileResponseDto;
import com.ak.ems.dto.ProfileUpdateRequestDto;

public interface ProfileService {
    ProfileResponseDto getMyProfile();
    ProfileResponseDto getEmployeeProfile(Long employeeId);
    ProfileResponseDto updateProfile(ProfileUpdateRequestDto updateRequest);
}
