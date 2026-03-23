package com.ak.ems.controller;

import com.ak.ems.dto.EmployeeDto;
import com.ak.ems.service.EmployeeService;
import lombok.AllArgsConstructor;
import com.ak.ems.response.ApiResponse;
import com.ak.ems.response.PageResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;





//@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private EmployeeService employeeService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<EmployeeDto>> getLoggedInEmployee(){
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        EmployeeDto employeeDto = employeeService.getEmployeeByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("Current employee fetched successfully", employeeDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDto>> createEmployee(@Valid @RequestBody EmployeeDto employeeDto){
        EmployeeDto savedEmployee = employeeService.createEmployee(employeeDto);
        return new ResponseEntity<>(ApiResponse.success("Employee created successfully", savedEmployee), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<EmployeeDto>> getEmployeeById(@PathVariable("id") Long employeeId){
        EmployeeDto employeeDto = employeeService.getEmployeeById(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Employee fetched successfully", employeeDto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeDto>>> getAllEmployees(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "teamId", required = false) Long teamId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "10", required = false) int size,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc", required = false) String sortDir
    ){
        PageResponse<EmployeeDto> employeeDtos = employeeService.getAllEmployees(query, departmentId, teamId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Employees fetched successfully", employeeDtos));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<EmployeeDto>> updateEmployee(@PathVariable("id") Long employeeid, @Valid @RequestBody EmployeeDto updatedEmployeeDto){
        EmployeeDto employeeDto = employeeService.updateEmployee(employeeid, updatedEmployeeDto);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", employeeDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<String>> deleteEmployee(@PathVariable("id") Long employeeId){
        employeeService.deleteEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    @GetMapping("/designation/{designation}")
    public ResponseEntity<ApiResponse<java.util.List<EmployeeDto>>> getEmployeesByDesignation(@PathVariable("designation") String designation) {
        return ResponseEntity.ok(ApiResponse.success("Employees with designation '" + designation + "' fetched", employeeService.getEmployeesByDesignation(designation)));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    @GetMapping("/skill/{skillName}")
    public ResponseEntity<ApiResponse<java.util.List<EmployeeDto>>> getEmployeesBySkill(@PathVariable("skillName") String skillName) {
        return ResponseEntity.ok(ApiResponse.success("Employees with skill '" + skillName + "' fetched", employeeService.getEmployeesBySkill(skillName)));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    @PostMapping("/{id}/skills")
    public ResponseEntity<ApiResponse<String>> addSkillToEmployee(@PathVariable("id") Long id, @RequestParam("skillName") String skillName) {
        employeeService.addSkillToEmployee(id, skillName);
        return ResponseEntity.ok(ApiResponse.success("Skill added successfully", null));
    }
}

