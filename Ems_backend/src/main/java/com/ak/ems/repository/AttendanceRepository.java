package com.ak.ems.repository;

import com.ak.ems.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeId(Long employeeId);
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
    List<Attendance> findByDate(LocalDate date);
    Long countByEmployeeIdAndStatusAndDateBetween(Long employeeId, com.ak.ems.entity.AttendanceStatus status, LocalDate startDate, LocalDate endDate);
    Long countByEmployeeId(Long employeeId);
    Long countByDate(LocalDate date);
    Long countByEmployeeIdAndDate(Long employeeId, LocalDate date);

    @Query("SELECT a FROM Attendance a " +
           "JOIN a.employee e " +
           "LEFT JOIN e.department d " +
           "LEFT JOIN e.team t " +
           "WHERE a.date = :date " +
           "AND (:departmentId IS NULL OR d.id = :departmentId) " +
           "AND (:teamId IS NULL OR t.id = :teamId)")
    List<Attendance> getFilteredAttendance(@Param("date") LocalDate date, 
                                           @Param("departmentId") Long departmentId, 
                                           @Param("teamId") Long teamId);

    long countByDateAndStatus(LocalDate date, com.ak.ems.entity.AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = :status AND a.employee.department.id = :deptId")
    long countByDateAndStatusAndDepartment(@Param("date") LocalDate date, @Param("status") com.ak.ems.entity.AttendanceStatus status, @Param("deptId") Long deptId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = :status AND a.employee.team.id = :teamId")
    long countByDateAndStatusAndTeam(@Param("date") LocalDate date, @Param("status") com.ak.ems.entity.AttendanceStatus status, @Param("teamId") Long teamId);

    @Query("SELECT a.status, COUNT(a) FROM Attendance a WHERE a.date BETWEEN :start AND :end GROUP BY a.status")
    List<Object[]> countByStatusBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT a.status, COUNT(a) FROM Attendance a WHERE a.employee.id = :empId AND a.date >= :since GROUP BY a.status")
    List<Object[]> countAttendanceHistory(@Param("empId") Long empId, @Param("since") LocalDate since);

    @Query("SELECT a.status, COUNT(a) FROM Attendance a WHERE a.employee.department.id = :deptId AND a.date BETWEEN :start AND :end GROUP BY a.status")
    List<Object[]> countByDepartmentAndStatusBetween(@Param("deptId") Long deptId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT a.status, COUNT(a) FROM Attendance a WHERE a.employee.team.id = :teamId AND a.date BETWEEN :start AND :end GROUP BY a.status")
    List<Object[]> countByTeamAndStatusBetween(@Param("teamId") Long teamId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    List<Attendance> findByDateBetween(LocalDate start, LocalDate end);
    
    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate start, LocalDate end);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.employee e LEFT JOIN FETCH e.department LEFT JOIN FETCH e.team " +
           "WHERE a.date BETWEEN :start AND :end " +
           "AND (:departmentId IS NULL OR e.department.id = :departmentId) " +
           "AND (:teamId IS NULL OR e.team.id = :teamId)")
    List<Attendance> findAttendanceForReport(@Param("start") LocalDate start, 
                                             @Param("end") LocalDate end, 
                                             @Param("departmentId") Long departmentId, 
                                             @Param("teamId") Long teamId);
}

