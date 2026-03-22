-- Create roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (id, name) VALUES (2, 'ROLE_MANAGER') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (id, name) VALUES (3, 'ROLE_TEAM_LEADER') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles (id, name) VALUES (4, 'ROLE_EMPLOYEE') ON DUPLICATE KEY UPDATE name=name;

-- Create default admin user: username=admin, password=admin
-- Password hash for 'admin' using BCrypt
INSERT INTO users (id, email, name, password, username) VALUES 
(1, 'admin@ems.com', 'System Admin', '$2a$10$wY1txQsroSljgRv2B4w4M.z9bY6A2wO18t7.A.H/2I8XJd324kKHO', 'admin')
ON DUPLICATE KEY UPDATE email=email;

-- Assign ROLE_ADMIN to admin user
INSERT INTO users_roles (user_id, role_id) VALUES (1, 1) ON DUPLICATE KEY UPDATE user_id=user_id;

