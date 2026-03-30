# FlowDesk 🗂️

A full-stack task management application built with React + Spring Boot + MySQL.

---

## ERD Diagram

```
┌─────────────────────────────┐       ┌──────────────────────────────────────┐
│           users             │       │               tasks                  │
├─────────────────────────────┤       ├──────────────────────────────────────┤
│ id          BIGINT (PK)     │◄──┐   │ id            BIGINT (PK)            │
│ name        VARCHAR(100)    │   │   │ title         VARCHAR(255)           │
│ email       VARCHAR(255) UQ │   │   │ description   TEXT                   │
│ password_hash VARCHAR(255)  │   │   │ status        ENUM(TODO,IN_PROGRESS, │
│ role        ENUM(ADMIN,USER)│   │   │               DONE)                  │
│ active      BOOLEAN         │   └───│ assigned_to   BIGINT (FK → users.id) │
│ created_at  DATETIME        │   ┌───│ created_by    BIGINT (FK → users.id) │
└─────────────────────────────┘   │   │ created_at    DATETIME               │
                                  │   │ updated_at    DATETIME               │
          users ◄──────────────── ┘   └──────────────────────────────────────┘
```

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Axios     |
| Backend   | Spring Boot 3.3, Spring Security, JPA   |
| Database  | MySQL 8                                 |
| Auth      | JWT (Bearer token)                      |
| DevOps    | Docker, Docker Compose, GitHub Actions  |
| Docs      | Springdoc OpenAPI / Swagger UI          |

---

## Project Structure

```
teamflow/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── api/            # Axios client + endpoint functions
│   │   ├── components/     # Shared UI components (Layout, StatusBadge)
│   │   ├── context/        # AuthContext (JWT state)
│   │   └── pages/          # LoginPage, RegisterPage, DashboardPage,
│   │                       # TaskFormPage, TaskDetailPage, UsersPage
│   ├── Dockerfile
│   └── vite.config.js
│
├── backend/                # Spring Boot REST API
│   └── src/main/java/com/teamflow/
│       ├── controller/     # AuthController, TaskController, UserController
│       ├── service/        # AuthService, TaskService, UserService
│       ├── repository/     # UserRepository, TaskRepository
│       ├── model/          # User, Task (JPA entities)
│       ├── dto/            # Dtos.java (all request/response records)
│       ├── security/       # JwtUtils, JwtAuthFilter, UserDetailsServiceImpl
│       └── config/         # SecurityConfig, OpenApiConfig, DataSeeder
│
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

---

## Running Locally (without Docker)

### Prerequisites
- Java 17+
- Node 20+
- MySQL 8 running locally

### 1. Database
```bash
mysql -u root -p
CREATE DATABASE taskdb;
EXIT;
```

### 2. Backend
```bash
cd backend
# Edit src/main/resources/application.properties if needed
mvn spring-boot:run
# API available at http://localhost:8080
# Swagger UI: http://localhost:8080/api/swagger-ui.html
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## Running with Docker Compose

```bash
# 1. Copy and configure env vars
cp .env.example .env
# Edit .env — set a strong MYSQL_ROOT_PASSWORD and JWT_SECRET

# 2. Build backend JAR first
cd backend && mvn -B clean package -DskipTests && cd ..

# 3. Start everything
docker compose up --build

# App: http://localhost:4173
# API: http://localhost:8080
# Swagger: http://localhost:8080/api/swagger-ui.html
```

To tear down:
```bash
docker compose down -v   # -v removes the MySQL volume (data reset)
```

---

## Default Test Users

| Email                | Password  | Role  |
|----------------------|-----------|-------|
| admin@flowdesk.dev   | admin123  | ADMIN |

Register additional users via the `/register` page or `POST /api/auth/register`.

---

## API Reference

### Auth

| Method | Endpoint              | Auth     | Description         |
|--------|-----------------------|----------|---------------------|
| POST   | /api/auth/register    | Public   | Register new user   |
| POST   | /api/auth/login       | Public   | Login, get JWT      |

### Users

| Method | Endpoint                    | Auth      | Description         |
|--------|-----------------------------|-----------|---------------------|
| GET    | /api/users                  | ADMIN     | List all users      |
| GET    | /api/users/{id}             | Any user  | Get user by ID      |
| PATCH  | /api/users/{id}/deactivate  | ADMIN     | Deactivate user     |

### Tasks

| Method | Endpoint          | Auth      | Description                        |
|--------|-------------------|-----------|------------------------------------|
| GET    | /api/tasks        | Any user  | List tasks (filter: status, assignedTo) |
| GET    | /api/tasks/{id}   | Any user  | Get task by ID                     |
| POST   | /api/tasks        | Any user  | Create task                        |
| PUT    | /api/tasks/{id}   | Creator / Assignee / Admin | Update task      |
| DELETE | /api/tasks/{id}   | ADMIN     | Delete task                        |

**Filter examples:**
```
GET /api/tasks?status=TODO
GET /api/tasks?assignedTo=2
GET /api/tasks?status=IN_PROGRESS&assignedTo=3
```

### Auth header for protected routes:
```
Authorization: Bearer <token>
```

---

## Authorization Rules

| Action              | Rule                                               |
|---------------------|----------------------------------------------------|
| Create task         | Any authenticated user                             |
| Edit task           | Task creator OR task assignee OR Admin             |
| Delete task         | Admin only                                         |
| Assign task to user | Any user (self-assign); Admin can assign to anyone |
| List all users      | Admin only                                         |
| Deactivate user     | Admin only (cannot deactivate another Admin)       |

---

## Environment Variables

| Variable               | Default                        | Description              |
|------------------------|--------------------------------|--------------------------|
| MYSQL_ROOT_PASSWORD    | change-me                      | MySQL root password      |
| JWT_SECRET             | (long default string)          | JWT signing secret       |
| SPRING_DATASOURCE_URL  | jdbc:mysql://db:3306/taskdb... | Set automatically by Compose |

> ⚠️ Never commit `.env` to Git. It is in `.gitignore`.

---

## Known Limitations & Future Improvements

- No refresh token support (JWT expires in 24h, user must log in again)
- No pagination on task list (suitable for small teams; add `Pageable` for scale)
- No email verification on registration
- Tests are skipped in CI Docker build step (add integration tests with H2/Testcontainers)
- Role assignment is USER-only on self-registration; Admin must be seeded or promoted via DB

---

## CI / CD

GitHub Actions runs on every push/PR to `main`:
1. Builds the Spring Boot JAR with Maven
2. Builds the React app with Vite
3. Builds both Docker images to verify Dockerfiles compile

See `.github/workflows/ci.yml`.
