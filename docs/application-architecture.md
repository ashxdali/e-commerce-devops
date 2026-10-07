# Application Architecture Specification

## Architecture Diagram

```
User (Browser / Client)
       │
       ▼
React Frontend (Vite + TypeScript + Tailwind CSS)
       │  (HTTP / REST API via Axios)
       ▼
Node.js + Express Backend API (TypeScript)
       │  (Prisma ORM - Configured in Part 2)
       ▼
PostgreSQL Database (Part 2)
```

## Security & Separation of Concerns

### Why the Frontend Must NEVER Connect Directly to PostgreSQL

1. **Security & Access Control**: Databases contain raw business data, credentials, and user data. Exposing direct database connections on the browser client exposes database port/credentials to public network traffic and client-side inspection.
2. **Business & Validation Logic**: All input validation, business rules, authorization, rate limiting, and sanitization must occur in a secure backend environment before reaching the data storage layer.
3. **Connection Pooling & Performance**: Browsers cannot manage PostgreSQL TCP connection pools efficiently. The Express API acts as a gateway and manages connection pooling securely via Prisma ORM.

## Current Part 1 Status & Part 2 Roadmap

- **Part 1 (Current)**:
  - Application foundation, routing, application shell, component design system, Express server setup, health checks, structured logging, and centralized operational error handling.
  - Database schemas and models are intentionally omitted. Prisma configuration initialized.

- **Part 2 (Next Stage)**:
  - Full PostgreSQL database setup via Prisma ORM.
  - Complete schema definition (Users, Products, Categories, Orders, Cart, Payments, Reviews).
  - Database connection health checking integrated into `/health/ready`.
