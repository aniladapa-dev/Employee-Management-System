package com.ak.ems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.HashSet;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "email_id", nullable = false, unique = true)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "current_salary", precision = 19, scale = 2)
    private BigDecimal currentSalary;

    private String phone;
    private String designation;
    private LocalDate joiningDate;
    private String address;

    @Column(name = "is_active")
    private Boolean active = true;

    @Column(name = "total_leaves")
    private Integer totalLeaves = 24;

    @Column(name = "used_leaves")
    private Integer usedLeaves = 0;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "employee_skills",
        joinColumns = @JoinColumn(name = "employee_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> skills = new HashSet<>();

    public int getRemainingLeaves() {
        return (totalLeaves != null ? totalLeaves : 24) - (usedLeaves != null ? usedLeaves : 0);
    }
}
