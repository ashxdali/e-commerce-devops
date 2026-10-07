# Backend API Foundation Architecture

This document details the backend API architecture for the AI-Powered E-Commerce DevOps Platform.

---

## 1. Backend Architecture Overview

The backend is built with Node.js, Express, TypeScript, Prisma, and PostgreSQL. It strictly adheres to a layered separation of concerns to maximize maintainability, testability, and scalability.

```
Client (React / Vite)
      ↓
HTTP REST Request
      ↓
Express App (app.ts)
      ↓
Global Middleware (Helmet, CORS, Body Parser, Request Logger, Correlation ID)
      ↓
Versioned API Routes (/api/v1)
      ↓
Validation Middleware (Zod Schema Validation)
      ↓
Controllers (HTTP Request Parsing & Response Formatting)
      ↓
Services (Core E-Commerce Business Logic & Rules)
      ↓
Prisma Client Singleton (Data Access Layer)
      ↓
PostgreSQL Database
```

---

## 2. Layered Request Flow

1. **Client**: Transmits HTTP/HTTPS request with headers (e.g., `Content-Type`, `X-Request-ID`).
2. **Express Application**: `app.ts` initializes global security headers (`helmet`), CORS policies, body limits (`1mb`), and request correlation ID middleware.
3. **Global Middleware**: Measures request duration, assigns or propagates `X-Request-ID`, and logs structured JSON metadata.
4. **Router (`src/routes/v1/index.ts`)**: Routes incoming requests based on path and HTTP method under the `/api/v1` namespace.
5. **Validation Middleware (`src/middleware/validate.middleware.ts`)**: Validates `body`, `params`, and `query` using Zod schemas before hitting controller logic.
6. **Controller Layer**: Parses input, invokes appropriate domain service methods, and formats standardized JSON responses.
7. **Service Layer**: Executes business rules, transactions, and domain validations. Interacts with database via Prisma Client.
8. **Prisma Client Singleton**: Executes database queries against PostgreSQL via managed connection pool.
9. **Global Error Handler (`src/middleware/error.middleware.ts`)**: Catches operational (`AppError`) and unexpected errors, sanitizes messages, logs context, and returns uniform JSON error payloads.

---

## 3. Controller Responsibility

Controllers act purely as the bridge between HTTP interfaces and business logic services:
- Parsing request parameters (`req.params`), body (`req.body`), and query parameters (`req.query`).
- Delegating actual execution to dedicated service methods.
- Formatting and returning standard JSON responses via `sendSuccess`, `sendPaginated`, or `sendError`.
- Forwarding caught errors to Express `next(error)` or utilizing `asyncHandler`.

### Why Controllers Must NOT Directly Execute Database Queries
- **Separation of Concerns**: Controllers are coupled to Express request/response interfaces; database logic should be reusable across REST endpoints, CLI commands, background jobs, or GraphQL.
- **Testability**: Services can be unit tested independently of HTTP mocks or Express request handling.
- **Maintainability**: Prevents controllers from bloating into monolithic files containing complex SQL/Prisma logic mixed with HTTP status management.

---

## 4. Service Responsibility

Services represent the core domain of the e-commerce platform:
- Encapsulate all business rules, calculations, permissions, and entity workflows.
- Interact with the database exclusively through the Prisma Client singleton (`src/config/database.ts`).
- Remain decoupled from Express HTTP objects (`req`, `res`).
- Return clean domain objects/data structures or throw strongly-typed operational errors (`AppError`).

---

## 5. Prisma & Database Responsibility

- **ORM Provider**: Prisma Client (`@prisma/client`) provides type-safe database queries.
- **Singleton Management**: `src/config/database.ts` maintains a single global Prisma Client instance to prevent connection pool exhaustion during development hot-reloads.
- **Database Connection**: PostgreSQL database `ecommerce_devops` handles ACID transactions, unique constraints, and foreign key relations.

---

## 6. Middleware Layer

The middleware pipeline handles cross-cutting concerns:
- **`helmet`**: Configures secure HTTP response headers (XSS Protection, HSTS, Sniff Prevention).
- **`cors`**: Controls cross-origin resource sharing restricted to configured `FRONTEND_URL`.
- **`express.json` & `express.urlencoded`**: Parsers with `1mb` body limits to mitigate DoS payload attacks.
- **`requestLogger`**: Generates/propagates `X-Request-ID`, measures execution duration, and writes structured JSON logs.
- **`notFoundHandler`**: Catches unmapped routes and converts them into standardized 404 JSON responses.
- **`errorHandler`**: Global error handling middleware producing uniform JSON error envelopes.

---

## 7. Request Validation

Validation is implemented using **Zod** and wrapped in reusable middleware (`src/middleware/validate.middleware.ts`).
- Validates `body`, `params`, and `query` parameters against schema definitions.
- On validation failure, produces a `400 Bad Request` response with error code `VALIDATION_ERROR` listing detailed field error messages.

---

## 8. Error Handling System

All application errors inherit from `AppError` (`src/utils/AppError.ts`).

### Standardized Error Categories:
| Category | HTTP Status | Error Code | Description |
|---|---|---|---|
| **Validation Error** | 400 | `VALIDATION_ERROR` | Request payload fails schema validation |
| **Bad Request** | 400 | `BAD_REQUEST` | Malformed request or client error |
| **Unauthorized** | 401 | `UNAUTHORIZED` | Missing or invalid authentication token |
| **Forbidden** | 403 | `FORBIDDEN` | Insufficient permissions for requested resource |
| **Not Found** | 404 | `NOT_FOUND` | Target resource or endpoint does not exist |
| **Conflict** | 409 | `CONFLICT` | Resource state conflict (e.g. duplicate email/sku) |
| **Internal Error** | 500 | `INTERNAL_SERVER_ERROR` | Unexpected server exception |

### Production Sanitization:
In production (`NODE_ENV=production`), unexpected internal errors are masked as `"An internal server error occurred."` and stack traces are suppressed from API responses to prevent information leakage.

---

## 9. Structured Logging

`src/utils/logger.ts` outputs JSON-formatted structured logs:
- Fields include `timestamp`, `level`, `message`, `requestId`, `method`, `path`, `statusCode`, and `durationMs`.
- **Automatic Sanitization**: Sensitive keys (`password`, `token`, `jwt`, `secret`, `authorization`, `database_url`, `db_pass`) are automatically masked as `[REDACTED]`.

---

## 10. API Versioning

API endpoints are versioned under explicit base paths:
- Current Base Route: `/api/v1`
- Root Info Endpoint: `GET /api/v1`

---

## 11. Standard Response Format

### Success Response Contract:
```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response Contract:
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response Contract:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

---

## 12. HTTP Status Conventions

- `200 OK`: Successful read or update operations.
- `201 Created`: Successful resource creation.
- `204 No Content`: Successful request with no body returned.
- `400 Bad Request`: Client validation or input syntax failure.
- `401 Unauthorized`: Authentication credential missing/invalid.
- `403 Forbidden`: Authenticated user lacks permission.
- `404 Not Found`: Endpoint or requested resource not found.
- `409 Conflict`: Conflict with current resource state (e.g. unique constraint).
- `500 Internal Server Error`: Unhandled application exception.
- `503 Service Unavailable`: Dependent service (e.g. PostgreSQL) unreachable.

---

## 13. Request ID Correlation

- Every request is tagged with a unique request ID.
- Upstream `X-Request-ID` headers are preserved if present; otherwise, a UUID `crypto.randomUUID()` is generated.
- The request ID is injected into the response header `X-Request-ID` and included in all structured log statements for trace correlation in Jenkins, Kubernetes, Prometheus, or ELK.

---

## 14. Health & Observability Endpoints

- `GET /health`: Basic service operational status.
- `GET /health/live`: Container liveness probe returning process uptime.
- `GET /health/ready`: Readiness probe verifying PostgreSQL database connectivity using Prisma (`SELECT 1`).

---

## 15. Security Foundations

- Security HTTP Headers (`helmet`).
- CORS restricted to allowed origins (`config.FRONTEND_URL`).
- Body payload size limit (`1mb`).
- Sanitized error messages hiding sensitive trace info in production.
- Environment variable validation with failure prevention on missing variables.

---

## 16. Future Business Module Boundaries

The routing foundation is structured to mount upcoming e-commerce modules cleanly:
- `/api/v1/auth` - Authentication & User Registration
- `/api/v1/categories` - Product Category Management
- `/api/v1/products` - Product Catalog & Details
- `/api/v1/cart` - Shopping Cart Management
- `/api/v1/wishlist` - Customer Wishlist
- `/api/v1/orders` - Order Processing & Tracking
- `/api/v1/reviews` - Product Reviews & Ratings
- `/api/v1/admin` - Administrative Dashboard APIs
