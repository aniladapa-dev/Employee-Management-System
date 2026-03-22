package com.ak.ems.service;

import com.ak.ems.dto.OfficeLocationDto;

import java.util.List;

public interface OfficeLocationService {
    List<OfficeLocationDto> getAllOfficeLocations();
    OfficeLocationDto addOfficeLocation(OfficeLocationDto dto);
    OfficeLocationDto updateOfficeLocation(Long id, OfficeLocationDto dto);
    void deleteOfficeLocation(Long id);
}
