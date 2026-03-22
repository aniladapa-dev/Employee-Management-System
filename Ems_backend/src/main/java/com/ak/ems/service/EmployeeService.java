package com.ak.ems.service;

import com.ak.ems.dto.EmployeeDto;
import com.ak.ems.response.PageResponse;
import java.util.List;




public interface EmployeeService {
    EmployeeDto createEmployee(EmployeeDto employeeDto);

    EmployeeDto getEmployeeById(Long employeeId);

    PageResponse<EmployeeDto> getAllEmployees(String query, Long departmentId, Long teamId, int page, int size, String sortBy, String sortDir);

    EmployeeDto updateEmployee(Long employeeId, EmployeeDto updatedEmployeeDto);

    EmployeeDto getEmployeeByUsername(String username);

    List<EmployeeDto> getEmployeesByDesignation(String designation);

    List<EmployeeDto> getEmployeesBySkill(String skillName);

    void addSkillToEmployee(Long employeeId, String skillName);

    void deleteEmployee(Long employeeId);
}
