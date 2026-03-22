package com.ak.ems.controller;

import com.ak.ems.dto.ProfileResponseDto;
import com.ak.ems.dto.ProfileUpdateRequestDto;
import com.ak.ems.response.ApiResponse;
import com.ak.ems.service.ProfileService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@AllArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponseDto>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success("Success", profileService.getMyProfile()));
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    public ResponseEntity<ApiResponse<ProfileResponseDto>> getEmployeeProfile(@PathVariable("employeeId") Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success("Success", profileService.getEmployeeProfile(employeeId)));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<ProfileResponseDto>> updateProfile(@Valid @RequestBody ProfileUpdateRequestDto updateRequest) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profileService.updateProfile(updateRequest)));
    }
}
