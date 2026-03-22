package com.ak.ems.service;

import com.ak.ems.dto.DepartmentDto;
import com.ak.ems.response.PageResponse;



public interface DepartmentService {
    DepartmentDto createDepartment(DepartmentDto departmentDto);
    DepartmentDto getDepartmentById(Long departmentId);
    PageResponse<DepartmentDto> getAllDepartments(String query, int page, int size, String sortBy, String sortDir);
    DepartmentDto updateDepartment(Long departmentId, DepartmentDto departmentDto);
    void deleteDepartment(Long departmentId);
}
