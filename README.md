# FlowDesk

FlowDesk is a lightweight task management web app built for small teams who need a single place to create, assign, and track work — without the overhead of enterprise tools.

---

## Why FlowDesk?

Most small teams track tasks in spreadsheets or chat threads. This causes:

- No clear ownership — anyone can claim a task was "done"
- Status is invisible unless you ask someone directly
- No history of who did what or when
- Admins have no bird's-eye view of team workload

FlowDesk solves this with a simple dashboard, role-based access, and a clean REST API connecting a React frontend to a Spring Boot backend.

---

## Database Schema

```
users
─────────────────────────────────────
id            BIGINT        PK, AUTO_INCREMENT
name          VARCHAR(100)  NOT NULL
email         VARCHAR(255)  NOT NULL, UNIQUE
password_hash VARCHAR(255)  NOT NULL
role          ENUM          'ADMIN' | 'USER'
active        BOOLEAN       DEFAULT true
created_at    DATETIME      auto-set on insert


tasks
─────────────────────────────────────
id            BIGINT        PK, AUTO_INCREMENT
title         VARCHAR(255)  NOT NULL
description   TEXT          nullable
status        ENUM          'TODO' | 'IN_PROGRESS' | 'DONE'
assigned_to   BIGINT        FK → users.id  (nullable)
created_by    BIGINT        FK → users.id  (NOT NULL)
created_at    DATETIME      auto-set on insert
updated_at    DATETIME      auto-updated on change


Relationships
─────────────────────────────────────
tasks.assigned_to  →  users.id   (many-to-one, optional)
tasks.created_by   →  users.id   (many-to-one, required)
```

---

## Tech Stack

**Frontend**
- React 18 with Vite
- Tailwind CSS for styling
- Axios for HTTP requests
- React Router v6 for navigation

**Backend**
- Spring Boot 3.3
- Spring Security with stateless JWT auth
- Spring Data JPA + Hibernate
- MySQL 8 as the database

**Infrastructure**
- Docker + Docker Compose (three services: db, backend, frontend)
- GitHub Actions for CI

---

## Folder Structure

```
flowdesk/
│
├── frontend/
│   ├── src/
│   │   ├── api/            # axios instance + all endpoint calls
│   │   ├── components/     # Layout (sidebar + nav), StatusBadge
│   │   ├── context/        # AuthContext — stores JWT + user in state
│   │   └── pages/          # Login, Register, Dashboard, TaskForm,
│   │                       # TaskDetail, Users
│   ├── Dockerfile
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   └── src/main/java/com/teamflow/
│       ├── config/         # SecurityConfig, OpenApiConfig, DataSeeder
│       ├── controller/     # AuthController, TaskController,
│       │                   # UserController, GlobalExceptionHandler
│       ├── dto/            # All request + response DTOs in Dtos.java
│       ├── model/          # User.java, Task.java (JPA entities)
│       ├── repository/     # UserRepository, TaskRepository (JPQL queries)
│       ├── security/       # JwtUtils, JwtAuthFilter,
│       │                   # UserDetailsServiceImpl
│       └── service/        # AuthService, TaskService, UserService
│
├── docker-compose.yml
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml
```

---

## How to Run Locally

### Prerequisites
- Java 17
- Node 20
- MySQL 8 running on localhost
- Maven 3.9+

### 1. Create the database
```sql
CREATE DATABASE taskdb;
```

### 2. Start the backend
```bash
cd backend
mvn spring-boot:run
```

The API starts on `http://localhost:8080`. On first boot it seeds an admin account automatically.

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

App is available at `http://localhost:5173`. The Vite dev server proxies `/api` calls to port 8080 automatically.

---

## How to Run with Docker

> Make sure Docker Desktop is running before these steps.

```bash
# 1. Build the backend JAR
cd backend
mvn clean package -DskipTests
cd ..

# 2. Set up environment
cp .env.example .env
# Open .env and set a strong MYSQL_ROOT_PASSWORD and JWT_SECRET

# 3. Start all services
docker compose up --build
```

| Service  | URL                                         |
|----------|---------------------------------------------|
| App      | http://localhost:4173                       |
| API      | http://localhost:8080                       |
| Swagger  | http://localhost:8080/api/swagger-ui.html   |

To stop everything:
```bash
docker compose down
# Add -v to also wipe the database volume
docker compose down -v
```

---

## Default Credentials

| Role  | Email               | Password |
|-------|---------------------|----------|
| Admin | admin@flowdesk.dev  | admin123 |

New regular users can self-register at `/register`.

---

## API Endpoints

### Authentication
```
POST  /api/auth/register    public
POST  /api/auth/login       public — returns { token, user }
```

### Users
```
GET   /api/users                  Admin only
GET   /api/users/{id}             Authenticated
PATCH /api/users/{id}/deactivate  Admin only
```

### Tasks
```
POST   /api/tasks           Create (any authenticated user)
GET    /api/tasks           List with optional filters
GET    /api/tasks/{id}      Get single task
PUT    /api/tasks/{id}      Update (creator / assignee / admin)
DELETE /api/tasks/{id}      Admin only
```

**Filtering tasks:**
```
GET /api/tasks?status=TODO
GET /api/tasks?assignedTo=3
GET /api/tasks?status=IN_PROGRESS&assignedTo=2
```

All protected routes require:
```
Authorization: Bearer <token>
```

---

## Role & Permission Rules

| Action                  | Who can do it                          |
|-------------------------|----------------------------------------|
| Register                | Anyone (public)                        |
| Login                   | Anyone (public)                        |
| Create a task           | Any logged-in user                     |
| Edit a task             | Task creator, assigned user, or Admin  |
| Delete a task           | Admin only                             |
| Assign tasks            | Any user (self-assign); Admin for any  |
| View all users          | Admin only                             |
| Deactivate a user       | Admin only (cannot deactivate Admins)  |

---

## Environment Variables

Defined in `.env` (copy from `.env.example`):

| Variable             | Description                        |
|----------------------|------------------------------------|
| MYSQL_ROOT_PASSWORD  | Password for the MySQL root user   |
| JWT_SECRET           | Secret key used to sign JWT tokens |

> Never commit `.env` to version control. It is listed in `.gitignore`.

---

## CI Pipeline

GitHub Actions runs on every push or pull request to `main`:

1. Sets up Java 17 (Eclipse Temurin) and runs `mvn clean verify`
2. Sets up Node 20 and runs `npm install && npm run build`
3. Builds both Docker images to verify the Dockerfiles are valid

See `.github/workflows/ci.yml`.

---

## Known Limitations

- JWT tokens expire after 24 hours with no refresh mechanism
- No email verification on registration
- Task list is not paginated (fine for small teams, add `Pageable` to scale)
- CI skips integration tests (add Testcontainers for full coverage)
