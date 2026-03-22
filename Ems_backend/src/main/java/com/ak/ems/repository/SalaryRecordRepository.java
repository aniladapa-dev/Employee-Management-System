package com.ak.ems.repository;

import com.ak.ems.entity.SalaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalaryRecordRepository extends JpaRepository<SalaryRecord, Long> {
    List<SalaryRecord> findByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);
    List<SalaryRecord> findByMonthAndYear(Integer month, Integer year);
    Optional<SalaryRecord> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
}
