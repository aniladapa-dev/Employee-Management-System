package com.ak.ems.controller;

import com.ak.ems.dto.OfficeLocationDto;
import com.ak.ems.response.ApiResponse;
import com.ak.ems.service.OfficeLocationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/office-location")
@AllArgsConstructor
public class OfficeLocationController {

    private OfficeLocationService officeLocationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<OfficeLocationDto>>> getAllOfficeLocations() {
        List<OfficeLocationDto> locations = officeLocationService.getAllOfficeLocations();
        return ResponseEntity.ok(new ApiResponse<>(true, "Office locations fetched successfully", locations));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OfficeLocationDto>> addOfficeLocation(@RequestBody OfficeLocationDto dto) {
        OfficeLocationDto newLocation = officeLocationService.addOfficeLocation(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Office location added successfully", newLocation));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OfficeLocationDto>> updateOfficeLocation(@PathVariable("id") Long id, @RequestBody OfficeLocationDto dto) {
        OfficeLocationDto updatedLocation = officeLocationService.updateOfficeLocation(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Office location updated successfully", updatedLocation));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteOfficeLocation(@PathVariable("id") Long id) {
        officeLocationService.deleteOfficeLocation(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Office location deleted successfully", null));
    }
}
