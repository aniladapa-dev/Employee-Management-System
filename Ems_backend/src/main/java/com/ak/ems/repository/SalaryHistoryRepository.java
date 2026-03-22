package com.ak.ems.repository;

import com.ak.ems.entity.SalaryHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalaryHistoryRepository extends JpaRepository<SalaryHistory, Long> {
    List<SalaryHistory> findByEmployeeIdOrderByChangedAtDesc(Long employeeId);
    Optional<SalaryHistory> findFirstByEmployeeIdOrderByChangedAtDesc(Long employeeId);
}
