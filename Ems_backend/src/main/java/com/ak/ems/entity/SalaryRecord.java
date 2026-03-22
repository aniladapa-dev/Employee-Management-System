package com.ak.ems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "salary_records")
public class SalaryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "record_month", nullable = false)
    private Integer month;

    @Column(name = "record_year", nullable = false)
    private Integer year;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal baseSalary;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal bonus;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal deductions;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal finalSalary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SalaryStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
