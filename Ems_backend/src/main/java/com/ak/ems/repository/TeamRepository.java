package com.ak.ems.repository;

import com.ak.ems.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
    boolean existsByName(String name);
    java.util.List<com.ak.ems.entity.Team> findByDepartmentId(Long departmentId);
    org.springframework.data.domain.Page<com.ak.ems.entity.Team> findByDepartmentId(Long departmentId, org.springframework.data.domain.Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT t FROM Team t WHERE " +
            "(:query IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "(:departmentId IS NULL OR t.department.id = :departmentId)")
    org.springframework.data.domain.Page<com.ak.ems.entity.Team> searchTeamsWithFilters(
            @org.springframework.data.repository.query.Param("query") String query,
            @org.springframework.data.repository.query.Param("departmentId") Long departmentId,
            org.springframework.data.domain.Pageable pageable);
}
