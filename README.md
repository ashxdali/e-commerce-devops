# AI-Powered E-Commerce DevOps & Cloud-Native Delivery Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.5-blue)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-v4.21-lightgrey)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8)](https://tailwindcss.com/)

A enterprise-grade, cloud-native e-commerce application built to showcase modern software engineering and incremental DevOps delivery.

---

## 🏗 Architecture Overview

```
User (Browser) ──▶ React Frontend ──▶ Express REST API ──▶ Prisma ORM ──▶ PostgreSQL DB
```

The application is structured cleanly into two decoupled sub-applications inside `application/`:

- **Frontend**: React + Vite + TypeScript SPA with Tailwind CSS design system and React Router DOM.
- **Backend**: Node.js + Express + TypeScript API server with Prisma ORM preparation, centralized operational error handling, and structured request logging.

---

##  Repository Structure

```
ai-ecommerce-devops/
├── application/
│   ├── frontend/        # React + Vite + TypeScript client
│   └── backend/         # Node.js + Express + TypeScript API server
├── docs/                # Architecture and technical design documentation
├── .env.example         # Template for environment configuration
├── .gitignore           # Git ignore rules
└── README.md            # Root technical documentation
```

---

##  Technology Stack

### Frontend
- **Framework**: React 18 + Vite 5 + TypeScript
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS v3
- **Code Quality**: ESLint + Prettier

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database Access**: Prisma ORM (schema initialization)
- **Validation & Security**: Zod, Helmet, CORS
- **Logging & Errors**: Custom structured JSON request logger & centralized `AppError` handler

---

##  Environment Variables

Copy `.env.example` to create local `.env` files if needed:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db?schema=public
JWT_SECRET=super-secret-key-change-in-production-32bytes
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

---

##  How to Start the Application

### 1. Backend Service

```bash
cd application/backend
npm install
npm run dev
```

The backend server will start at `http://localhost:5000`.

Available Scripts (Backend):
- `npm run dev`: Starts development server with hot-reload via `tsx`
- `npm run build`: Compiles TypeScript to `dist/`
- `npm run start`: Runs compiled production code from `dist/server.js`
- `npm run lint`: Runs ESLint checks

### 2. Frontend Service

```bash
cd application/frontend
npm install
npm run dev
```

The frontend application will start at `http://localhost:5173`.

Available Scripts (Frontend):
- `npm run dev`: Starts Vite local dev server
- `npm run build`: Compiles production build to `dist/`
- `npm run preview`: Previews built production assets
- `npm run lint`: Runs ESLint checks

---

##  Health Check Endpoints

| Method | Endpoint | Description | Sample Output |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Primary service health status | `{"status":"ok","service":"ai-ecommerce-backend"}` |
| `GET` | `/health/live` | Process liveness probe | `{"status":"alive","timestamp":"..."}` |
| `GET` | `/health/ready` | Service readiness probe | `{"status":"ready","timestamp":"..."}` |
| `GET` | `/api/test-error` | Operational error verification endpoint | Centralized error JSON payload |

---

##  Implementation Status & Future Roadmap

This project is built incrementally stage by stage.

- [x] **Part 1 — Project Foundation & Application Architecture**:
  - React + Vite + TypeScript Frontend with design system and routing
  - Node.js + Express + TypeScript Backend with separate `app.ts` and `server.ts`
  - Health checks, central error handling, structured logging, Axios client, docs
- [ ] **Part 2 — Database Schema & Data Access**:
  - PostgreSQL container setup, Prisma database models, migrations, and seed scripts
- [ ] **Part 3 — Authentication & User Management**:
  - JWT authentication, bcrypt password hashing, auth middleware, user profiles
- [ ] **Part 4 — Product Catalog & E-Commerce APIs**:
  - Category & Product REST endpoints, filtering, searching, pagination
- [ ] **Part 5 — Cart, Orders & Checkout System**:
  - Cart persistence, Order management, state transitions
- [ ] **Future DevOps & Cloud Stages**:
  - Git / GitHub workflow automation & Bash scripts
  - Docker containerization & Docker Compose multi-container orchestrations
  - Jenkins CI/CD pipelines
  - Infrastructure as Code (Terraform) & Configuration Management (Ansible)
  - Kubernetes manifests & Helm charts deployment
  - Prometheus, Grafana & ELK monitoring/logging stack
  - DevSecOps pipeline security scanning
  - Cloud platform deployment & AI-assisted incident analysis
