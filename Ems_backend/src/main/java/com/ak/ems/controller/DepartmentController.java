package com.ak.ems.controller;

import com.ak.ems.dto.DepartmentDto;
import com.ak.ems.response.ApiResponse;
import com.ak.ems.response.PageResponse;
import com.ak.ems.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private DepartmentService departmentService;

    // Build Create Department REST API
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(@Valid @RequestBody DepartmentDto departmentDto){
        DepartmentDto department = departmentService.createDepartment(departmentDto);
        return new ResponseEntity<>(ApiResponse.success("Department created successfully", department), HttpStatus.CREATED);
    }

    // Build Get Department REST API
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<DepartmentDto>> getDepartmentById(@PathVariable("id") Long departmentId){
        DepartmentDto departmentDto = departmentService.getDepartmentById(departmentId);
        return ResponseEntity.ok(ApiResponse.success("Department fetched successfully", departmentDto));
    }

    // Build Get All Departments REST API
    // Note: Everyone might need to see the departments list for forms/dropdowns, usually Employees included. 
    // Depending on RBAC matrix, allowing 'EMPLOYEE', 'TEAM_LEADER' as well.
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DepartmentDto>>> getAllDepartments(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "10", required = false) int size,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc", required = false) String sortDir
    ){
        PageResponse<DepartmentDto> departments = departmentService.getAllDepartments(query, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Departments fetched successfully", departments));
    }

    // Build Update Department REST API
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<DepartmentDto>> updateDepartment(@PathVariable("id") Long departmentId,
                                                                       @Valid @RequestBody DepartmentDto updatedDepartment){
        DepartmentDto departmentDto = departmentService.updateDepartment(departmentId, updatedDepartment);
        return ResponseEntity.ok(ApiResponse.success("Department updated successfully", departmentDto));
    }

    // Build Delete Department REST API
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<String>> deleteDepartment(@PathVariable("id") Long departmentId){
        departmentService.deleteDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success("Department deleted successfully", null));
    }
}
