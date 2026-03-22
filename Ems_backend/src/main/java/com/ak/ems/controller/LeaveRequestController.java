package com.ak.ems.controller;

import com.ak.ems.dto.LeaveRequestDto;
import com.ak.ems.entity.LeaveStatus;
import com.ak.ems.response.ApiResponse;
import com.ak.ems.service.LeaveRequestService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/leaves")
@AllArgsConstructor
public class LeaveRequestController {

    private LeaveRequestService leaveRequestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> applyLeave(@Valid @RequestBody LeaveRequestDto leaveRequestDto) {
        LeaveRequestDto savedRequest = leaveRequestService.applyLeave(leaveRequestDto);
        return new ResponseEntity<>(new ApiResponse<>(true, "Leave request submitted successfully", savedRequest), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> getLeaveById(@PathVariable("id") Long id) {
        LeaveRequestDto leaveRequestDto = leaveRequestService.getLeaveRequestById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Leave request fetched successfully", leaveRequestDto));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getEmployeeLeaves(@PathVariable("employeeId") Long employeeId) {
        List<LeaveRequestDto> leaves = leaveRequestService.getEmployeeLeaveRequests(employeeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Employee leave requests fetched successfully", leaves));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getAllLeaves() {
        List<LeaveRequestDto> leaves = leaveRequestService.getAllLeaveRequests();
        return ResponseEntity.ok(new ApiResponse<>(true, "All leave requests fetched successfully", leaves));
    }

    @GetMapping("/pending-for-me")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    public ResponseEntity<ApiResponse<List<LeaveRequestDto>>> getPendingForMe() {
        List<LeaveRequestDto> leaves = leaveRequestService.getPendingApprovalsForMe();
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending approvals fetched", leaves));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    public ResponseEntity<ApiResponse<LeaveRequestDto>> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") LeaveStatus status,
            @RequestParam(name = "remarks", required = false) String remarks) {
        LeaveRequestDto updatedRequest = leaveRequestService.updateLeaveStatus(id, status, remarks);
        return ResponseEntity.ok(new ApiResponse<>(true, "Leave status updated successfully", updatedRequest));
    }

    @GetMapping("/balance/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<com.ak.ems.dto.LeaveBalanceDto>> getLeaveBalance(@PathVariable("employeeId") Long employeeId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Leave balance fetched successfully", leaveRequestService.getLeaveBalance(employeeId)));
    }
}
