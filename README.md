# Employment Management System (EMS)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust, full-stack Enterprise Resource Planning (ERP) solution tailored for modern workforce management. This system streamlines employee lifecycle management, attendance tracking, and administrative workflows with a focus on performance and user experience.

---

## 🛠️ Technology Stack

### Backend
- **Core**: Java 21, Spring Boot 3.4
- **Security**: Spring Security, JWT (JSON Web Token)
- **Data**: Spring Data JPA, Hibernate, MySQL 8.0
- **Documentation**: SpringDoc OpenAPI (Swagger)
- **Reporting**: Apache POI (Excel), OpenCSV

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Vanilla CSS (Modern, Responsive Design)
- **Icons**: Lucide React
- **Theming**: Dynamic Dark/Light mode with persistence

---

## Project Architecture

```text
.
├── Ems_backend          # Spring Boot REST API
│   ├── src/main/java    # Backend Source Code
│   ├── src/main/res     # Configuration (application.properties)
│   └── pom.xml          # Maven Dependencies
├── Ems_frontend         # React Frontend Application
│   ├── src/             # Components, Hooks, Services
│   ├── public/          # Static Assets
│   └── package.json     # NPM Dependencies
└── README.md            # Project Overview
```

---

##  Getting Started

### Prerequisites
- **JDK 21** or higher
- **Node.js 18** or higher
- **MySQL Server** running on port 3306

### 1. Database Setup
1. Log in to MySQL: `mysql -u root -p`
2. Create the database: `CREATE DATABASE ems;`
3. Update `Ems_backend/src/main/resources/application.properties` with your credentials.

### 2. Backend Installation
```bash
cd Ems_backend
./mvnw clean install
./mvnw spring-boot:run
```
> [!TIP]
> Access the API documentation at [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) once the server starts.

### 3. Frontend Installation
```bash
cd Ems_frontend
npm install
npm run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173).

---

## ✨ Key Features

- **Employee Directory**: Comprehensive management of employee profiles and documents.
- ** Attendance Engine**: Smart attendance logging with office/remote work modes.
- **Leave Workflow**: Automated leave request submission and approval system.
- **Secure Access**: Role-Based Access Control (RBAC) ensuring Admin, Team Leader, and Employee data privacy.
- **Reporting Center**: Generate professional Excel and CSV reports for attendance and team performance.
- **Adaptive UI**: premium design with seamless dark/light mode transition.

---

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
