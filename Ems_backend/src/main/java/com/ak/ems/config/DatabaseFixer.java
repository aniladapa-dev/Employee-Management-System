package com.ak.ems.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE attendance MODIFY COLUMN status VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE attendance MODIFY COLUMN work_mode VARCHAR(255)");
            System.out.println("DEBUG_FIX: Database schema columns updated successfully.");

            // 1. Link existing employees to users by email if user_id is NULL
            jdbcTemplate.execute("UPDATE employees e " +
                    "JOIN users u ON e.email_id = u.email " +
                    "SET e.user_id = u.id " +
                    "WHERE e.user_id IS NULL");
            System.out.println("DEBUG_FIX: Linked existing employees to users based on email.");

            // 2. Sync remaining Users to Employees if they don't exist in employees table at all
            jdbcTemplate.execute("INSERT INTO employees (first_name, last_name, email_id, user_id) " +
                    "SELECT SUBSTRING_INDEX(name, ' ', 1), " +
                    "CASE WHEN name LIKE '% %' THEN SUBSTRING_INDEX(name, ' ', -1) ELSE '' END, " +
                    "email, id FROM users " +
                    "WHERE id NOT IN (SELECT user_id FROM employees WHERE user_id IS NOT NULL)");
            System.out.println("DEBUG_FIX: User-Employee synchronization completed.");


        } catch (Exception e) {
            System.err.println("DEBUG_FIX: Failed to update database: " + e.getMessage());
        }
    }
}
