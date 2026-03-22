package com.ak.ems.util;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigrationRunner {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void migrate() {
        log.info("Starting database migration for 'is_active' column...");
        try {
            int updatedRows = jdbcTemplate.update("UPDATE employees SET is_active = true WHERE is_active IS NULL");
            log.info("Migration complete. Updated {} rows.", updatedRows);
        } catch (Exception e) {
            log.error("Migration failed: {}", e.getMessage());
        }
    }
}
