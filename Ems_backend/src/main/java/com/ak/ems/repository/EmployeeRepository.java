package com.ak.ems.repository;

import com.ak.ems.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("SELECT e FROM Employee e WHERE " +
           "(:query IS NULL OR (LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')))) " +
           "AND (:departmentId IS NULL OR e.department.id = :departmentId) " +
           "AND (:teamId IS NULL OR e.team.id = :teamId)")
    Page<Employee> searchEmployeesWithFilters(@Param("query") String query, 
                                              @Param("departmentId") Long departmentId, 
                                              @Param("teamId") Long teamId, 
                                              Pageable pageable);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.department LEFT JOIN FETCH e.team WHERE " +
           "(:departmentId IS NULL OR e.department.id = :departmentId) " +
           "AND (:teamId IS NULL OR e.team.id = :teamId)")
    List<Employee> findEmployeesForReport(@Param("departmentId") Long departmentId, @Param("teamId") Long teamId);

    boolean existsByEmail(String email);

    boolean existsByUser_Id(Long userId);

    Optional<Employee> findByUser_Id(Long userId);

    Optional<Employee> findByUser_Username(String username);

    long countByActive(boolean active);

    @Query("SELECT e.department.name, COUNT(e) FROM Employee e GROUP BY e.department.name")
    List<Object[]> countEmployeesByDepartment();

    List<Employee> findTop5ByOrderByJoiningDateDesc();

    List<Employee> findByActiveFalse();

    long countByDepartmentId(Long departmentId);
    long countByDepartmentIdAndActive(Long departmentId, boolean active);

    @Query("SELECT e.team.id, COUNT(e) FROM Employee e WHERE e.department.id = :departmentId GROUP BY e.team.id")
    List<Object[]> countTeamsByDepartment(@Param("departmentId") Long departmentId);

    long countByTeamId(Long teamId);
    long countByTeamIdAndActive(Long teamId, boolean active);
    List<Employee> findByDesignation(String designation);

    List<Employee> findBySkills_Name(String skillName);
}
