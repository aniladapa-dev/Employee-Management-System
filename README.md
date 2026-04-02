# Employee Management System (EMS) - Full Stack
A robust, enterprise-grade Employee Management System built with **Spring Boot 3**, **React 18**, and **MySQL**. This application provides a comprehensive suite of tools for managing employees, tracking attendance, handling salaries, and secure document storage.
### 🔗 Live Production Links
- **Frontend (Vercel)**: [https://employment-management-system-gamma.vercel.app/](https://employment-management-system-gamma.vercel.app/)
- **Backend (Render)**: [https://employment-management-system-mt72.onrender.com](https://employment-management-system-mt72.onrender.com)
- **Database**: Managed MySQL (Aiven)
---
## 🛠️ Tech Stack
### Backend
- **Java 21** / **Spring Boot 3.4**
- **Spring Security** (JWT-based Authentication)
- **Spring Data JPA** (Hibernate 6)
- **Cloudinary SDK** (Secure File & PDF Storage)
- **Lombok** (Boilerplate reduction)
- **MySQL 8** (Database)
### Frontend
- **React 18** (Vite)
- **Vanilla CSS** (Custom Premium UI/UX)
- **Axios** (API Interfacing)
- **Lucide-React** (Iconography)
---
##  Key Features
- **Role-Based Access Control (RBAC)**: Secure access for Admins and Staff.
- **Interactive Dashboard**: Real-time analytics, charts (Recharts), and system overviews.
- **Document Management**: 
    - Secure PDF/Resume uploads via Cloudinary.
    - **Signed URLs**: Temporary secure links for document downloads to resolve access restrictions.
- **Salary Management**: Track salary history and payroll simulations.
- **Attendance & Leave**: Automated leave balance tracking and attendance logs.
- **Email Notifications**: Automated onboarding emails containing login credentials for new employees.
- **Premium UI**: Dark-mode support, HSL-tailored color palettes, and glassmorphism effects.
---
## ⚙️ Environment Variables (Backend)
To run the backend in production, ensure the following variables are configured:
| Key | Description |
|---|---|
| `DB_URL` | Aiven MySQL Connection String (with `sslMode=REQUIRED`) |
| `DB_USERNAME` / `DB_PASSWORD` | Database credentials |
| `JWT_SECRET` | 256-bit Base64 encoded secret key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Name |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary Credentials |
| `EMAIL_USERNAME` | Gmail address for notifications |
| `EMAIL_PASSWORD` | 16-character Google App Password |
| `FRONTEND_URL` | URL of the deployed React application (for CORS) |
---
## 🏗️ Technical Architecture

The system follows a classic **N-tier Architecture** with a clear separation between the presentation, business logic, and data layers.

```mermaid
graph TD
    A[React Frontend] -->|REST API + JWT| B[Spring Boot Backend]
    B -->|JPA/Hibernate| C[(MySQL Database - Aiven)]
    B -->|Streaming| D[Cloudinary - Storage]
    B -->|Authentication| E[Spring Security - JWT]
```

### 🔹 Layered Design
- **Presentation Layer**: Built with **React**; uses **Axios** to communicate with the backend. It's fully stateless, relying on JWT tokens stored in the browser.
- **Security Layer**: **Spring Security** intercepts every request, validates the JWT, and enforces Role-Based Access Control (RBAC).
- **Service Layer**: Contains the core business logic, including salary calculations, attendance processing, and Cloudinary file handling.
- **Persistence Layer**: **Spring Data JPA** manages the database interactions with MySQL, ensuring data integrity and version control via Hibernate.
---


## 🔑 Demo Access

To explore the application, you can use the following demo credentials:

- **Username:** admin  
- **Password:** admin123  

> ⚠️ Note: This is a demo account with limited permissions, created for evaluation purposes.

---

*Developed by Anil Kumar Adapa - 2026*


