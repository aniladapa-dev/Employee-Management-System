package com.ak.ems.service;

import com.ak.ems.dto.LeaveRequestDto;
import com.ak.ems.entity.LeaveStatus;

import java.util.List;

public interface LeaveRequestService {
    LeaveRequestDto applyLeave(LeaveRequestDto leaveRequestDto);
    LeaveRequestDto getLeaveRequestById(Long id);
    List<LeaveRequestDto> getEmployeeLeaveRequests(Long employeeId);
    List<LeaveRequestDto> getAllLeaveRequests();
    List<LeaveRequestDto> getPendingApprovalsForMe();
    LeaveRequestDto updateLeaveStatus(Long id, LeaveStatus status, String adminRemarks);
    com.ak.ems.dto.LeaveBalanceDto getLeaveBalance(Long employeeId);
}
