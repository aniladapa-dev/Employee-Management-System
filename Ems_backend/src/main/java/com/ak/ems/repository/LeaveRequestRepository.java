package com.ak.ems.repository;

import com.ak.ems.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    List<LeaveRequest> findByStatus(com.ak.ems.entity.LeaveStatus status);
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, com.ak.ems.entity.LeaveStatus status);
    List<LeaveRequest> findTop5ByEmployeeIdOrderByIdDesc(Long employeeId);

    @Query("SELECT l FROM LeaveRequest l JOIN FETCH l.employee e LEFT JOIN FETCH e.department LEFT JOIN FETCH e.team " +
           "WHERE (:departmentId IS NULL OR e.department.id = :departmentId) " +
           "AND (:teamId IS NULL OR e.team.id = :teamId)")
    List<LeaveRequest> findLeavesForReport(@Param("departmentId") Long departmentId, @Param("teamId") Long teamId);

    long countByStatus(com.ak.ems.entity.LeaveStatus status);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.status = 'APPROVED' AND :today BETWEEN l.startDate AND l.endDate")
    long countOnLeaveToday(@Param("today") java.time.LocalDate today);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employee.department.id = :deptId AND l.status = 'APPROVED' AND :today BETWEEN l.startDate AND l.endDate")
    long countOnLeaveTodayByDepartment(@Param("today") java.time.LocalDate today, @Param("deptId") Long deptId);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.employee.team.id = :teamId AND l.status = 'APPROVED' AND :today BETWEEN l.startDate AND l.endDate")
    long countOnLeaveTodayByTeam(@Param("today") java.time.LocalDate today, @Param("teamId") Long teamId);

    @Query("SELECT l.leaveType, COUNT(l) FROM LeaveRequest l WHERE l.startDate >= :since GROUP BY l.leaveType")
    List<Object[]> countLeaveByTypeSince(@Param("since") java.time.LocalDate since);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.department.id = :deptId AND l.status = 'APPROVED' AND :today BETWEEN l.startDate AND l.endDate")
    List<LeaveRequest> findEmployeesOnLeaveByDepartment(@Param("today") java.time.LocalDate today, @Param("deptId") Long deptId);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.team.id = :teamId AND l.status = 'APPROVED' AND :today BETWEEN l.startDate AND l.endDate")
    List<LeaveRequest> findEmployeesOnLeaveByTeam(@Param("today") java.time.LocalDate today, @Param("teamId") Long teamId);

    List<LeaveRequest> findByEmployee_Team_IdAndStatus(Long teamId, com.ak.ems.entity.LeaveStatus status);

    List<LeaveRequest> findTop5ByEmployeeIdOrderByStartDateDesc(Long employeeId);

    @Query("SELECT l.status, COUNT(l) FROM LeaveRequest l WHERE l.employee.team.id = :teamId GROUP BY l.status")
    List<Object[]> countByTeamAndStatus(@Param("teamId") Long teamId);
}
