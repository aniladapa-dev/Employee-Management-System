package com.ak.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OfficeLocationDto {
    private Long id;
    private Double latitude;
    private Double longitude;
    private Double radiusMeters;
}
