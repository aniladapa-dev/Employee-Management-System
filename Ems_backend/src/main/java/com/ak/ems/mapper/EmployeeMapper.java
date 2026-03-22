package com.ak.ems.mapper;

import com.ak.ems.dto.EmployeeDto;
import com.ak.ems.entity.Employee;
import com.ak.ems.entity.Skill;
import java.util.stream.Collectors;
import java.util.HashSet;


public class EmployeeMapper {

    public static EmployeeDto maptoEmployeeDto(Employee employee){
        String role = null;
        if (employee.getUser() != null && employee.getUser().getRoles() != null && !employee.getUser().getRoles().isEmpty()) {
            role = employee.getUser().getRoles().iterator().next().getName();
        }

        Long deptId = null;
        String deptName = null;
        if (employee.getDepartment() != null) {
            deptId = employee.getDepartment().getId();
            deptName = employee.getDepartment().getName();
        } else if (employee.getTeam() != null && employee.getTeam().getDepartment() != null) {
            deptId = employee.getTeam().getDepartment().getId();
            deptName = employee.getTeam().getDepartment().getName();
        }

        EmployeeDto dto = new EmployeeDto();
        dto.setId(employee.getId());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setDesignation(employee.getDesignation());
        dto.setJoiningDate(employee.getJoiningDate());
        dto.setAddress(employee.getAddress());
        dto.setDepartmentId(deptId);
        dto.setDepartmentName(deptName);
        dto.setTeamId(employee.getTeam() != null ? employee.getTeam().getId() : null);
        dto.setTeamName(employee.getTeam() != null ? employee.getTeam().getName() : null);
        dto.setUserId(employee.getUser() != null ? employee.getUser().getId() : null);
        dto.setUsername(employee.getUser() != null ? employee.getUser().getUsername() : null);
        dto.setRole(role);
        
        if (employee.getSkills() != null) {
            dto.setSkills(employee.getSkills().stream().map(Skill::getName).collect(Collectors.toSet()));
        }
        
        return dto;
    }

    public static Employee maptoEmployee(EmployeeDto employeeDto){
        Employee employee = new Employee();
        employee.setId(employeeDto.getId());
        employee.setFirstName(employeeDto.getFirstName());
        employee.setLastName(employeeDto.getLastName());
        employee.setEmail(employeeDto.getEmail());
        employee.setPhone(employeeDto.getPhone());
        employee.setDesignation(employeeDto.getDesignation());
        employee.setJoiningDate(employeeDto.getJoiningDate());
        employee.setAddress(employeeDto.getAddress());
        
        // Skills mapping (will be handled by service during update/create if complex, 
        // but here we just initialize the set if provided in DTO)
        if (employeeDto.getSkills() != null) {
            // Note: Service layer should handle finding/creating Skill entities
            // For mapping purposes, we just ensure a set exists
            employee.setSkills(new HashSet<>());
        }
        
        return employee;
    }
}
