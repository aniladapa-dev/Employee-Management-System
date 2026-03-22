package com.ak.ems.service.impl;

import com.ak.ems.dto.OfficeLocationDto;
import com.ak.ems.entity.OfficeLocation;
import com.ak.ems.repository.OfficeLocationRepository;
import com.ak.ems.service.OfficeLocationService;
import com.ak.ems.exception.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OfficeLocationServiceImpl implements OfficeLocationService {

    private OfficeLocationRepository officeLocationRepository;

    @Override
    public List<OfficeLocationDto> getAllOfficeLocations() {
        List<OfficeLocation> locations = officeLocationRepository.findAll();
        if (locations.isEmpty()) {
            // Create default location if none exists
            OfficeLocation defaultLocation = new OfficeLocation();
            defaultLocation.setLatitude(18.883701175691435);
            defaultLocation.setLongitude(77.92067862653265);
            defaultLocation.setRadiusMeters(200.0);
            locations.add(officeLocationRepository.save(defaultLocation));
        }
        return locations.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public OfficeLocationDto addOfficeLocation(OfficeLocationDto dto) {
        OfficeLocation location = new OfficeLocation();
        location.setLatitude(dto.getLatitude());
        location.setLongitude(dto.getLongitude());
        location.setRadiusMeters(dto.getRadiusMeters());
        OfficeLocation saved = officeLocationRepository.save(location);
        return mapToDto(saved);
    }

    @Override
    public OfficeLocationDto updateOfficeLocation(Long id, OfficeLocationDto dto) {
        OfficeLocation location = officeLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office location not found"));
        location.setLatitude(dto.getLatitude());
        location.setLongitude(dto.getLongitude());
        location.setRadiusMeters(dto.getRadiusMeters());
        OfficeLocation updated = officeLocationRepository.save(location);
        return mapToDto(updated);
    }

    @Override
    public void deleteOfficeLocation(Long id) {
        OfficeLocation location = officeLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office location not found"));
        officeLocationRepository.delete(location);
    }

    private OfficeLocationDto mapToDto(OfficeLocation location) {
        return new OfficeLocationDto(
                location.getId(),
                location.getLatitude(),
                location.getLongitude(),
                location.getRadiusMeters()
        );
    }
}
