# Database Architecture & Persistence Layer Specification

## Overview

This document specifies the PostgreSQL and Prisma ORM database architecture for the AI-Powered E-Commerce DevOps Platform. The database serves as the single source of truth for persistent application state, including user accounts, product catalogs, inventory control, shopping carts, wishlists, orders, payments, coupons, and product reviews.

---

## Conceptual Data Flow Architecture

```
┌──────────────┐
│  Client User │
└──────┬───────┘
       │ HTTP / HTTPS
       ▼
┌──────────────┐
│ React        │
│ Frontend     │
└──────┬───────┘
       │ REST API Calls (JSON)
       ▼
┌──────────────┐
│ Express      │
│ Backend API  │
└──────┬───────┘
       │ Service / Controller Layer
       ▼
┌──────────────┐
│ Prisma ORM   │
│ Client       │
└──────┬───────┘
       │ PostgreSQL Wire Protocol (Port 5432)
       ▼
┌──────────────┐
│ PostgreSQL   │
│ Database     │
└──────────────┘
```

---

## Architectural Roles

### 1. PostgreSQL Database
- **Role**: Relational database engine responsible for data durability, transaction isolation (ACID), relational integrity, indexing, and foreign key constraint enforcement.
- **Access**: Accessible strictly via backend application connection pools. Direct access from client browsers or public networks is prohibited.

### 2. Prisma ORM
- **Role**: Type-safe Object-Relational Mapping (ORM) layer.
- **Responsibilities**:
  - Auto-generating TypeScript definitions derived from `schema.prisma`.
  - Executing database migrations (`prisma migrate`).
  - Providing a query builder for data operations without raw SQL strings.
  - Managing connection pooling and safe parameter binding to prevent SQL injection vulnerabilities.

---

## Core Entities & Relational Schema

| Entity | Description | Key Relationships | Important Constraints |
| :--- | :--- | :--- | :--- |
| **`User`** | System account holders (`CUSTOMER`, `ADMIN`) | `addresses`, `cart`, `wishlist`, `orders`, `reviews` | Unique `email`, hashed passwords (`bcryptjs`) |
| **`Address`** | User shipping / billing addresses | Belongs to `User` | Cascading deletion on user removal |
| **`Category`** | Product classification hierarchy | Has many `Product` items | Unique `name` and `slug` |
| **`Product`** | E-commerce catalog items | Belongs to `Category`; Has `images`, `inventory`, `cartItems`, `orderItems`, `reviews` | Unique `slug` & `SKU`, `@db.Decimal(10, 2)` pricing, restricted deletion if bound to orders |
| **`ProductImage`** | Media assets associated with products | Belongs to `Product` | Ordered by `sortOrder` |
| **`Inventory`** | Stock level and reservation tracking | 1-to-1 with `Product` | `quantity` & `reservedQuantity` tracking |
| **`Cart` / `CartItem`** | Transient shopping cart storage | 1-to-1 with `User`, contains `CartItem` entries | Composite unique key `@@unique([cartId, productId])` |
| **`Wishlist` / `WishlistItem`** | User saved product collections | 1-to-1 with `User`, contains `WishlistItem` entries | Composite unique key `@@unique([wishlistId, productId])` |
| **`Order`** | Financial purchase records | Belongs to `User`; Has `orderItems`, `payment` | Unique `orderNumber`, address snapshotting, indexed status & creation date |
| **`OrderItem`** | Individual line items within an order | Belongs to `Order`; References `Product` (optional) | Product name and price snapshotting |
| **`Payment`** | Transaction payment records | 1-to-1 with `Order` | Unique `orderId` and `paymentReference` |
| **`Coupon`** | Promotional discount vouchers | Applied during order creation | Unique `code`, date range validity, usage limit |
| **`Review`** | Customer ratings and feedback | Belongs to `User` and `Product` | Rating values (1-5), composite unique key `@@unique([userId, productId])` |

---

## Key Technical Decisions

### 1. Safe Monetary Representation
All monetary fields (`price`, `compareAtPrice`, `subtotal`, `totalAmount`, `discountValue`, `unitPrice`) use `Decimal` with `@db.Decimal(10, 2)` precision instead of floating-point numbers (`Float`) to eliminate floating-point arithmetic errors.

### 2. Order Shipping Address Snapshotting
When an order is created, shipping details (`shippingFullName`, `shippingPhone`, `shippingAddressLine1`, `shippingCity`, `shippingState`, `shippingPostalCode`, `shippingCountry`) are copied directly into the `Order` table. This guarantees that past purchase records remain immutable even if the user subsequently updates or deletes their saved addresses in the `Address` table.

### 3. Historical Data Preservation & Delete Protection
- Products linked to orders cannot be accidentally deleted (`onDelete: Restrict` on Category and `SetNull` on OrderItem).
- Users with existing orders are protected from cascading deletion (`onDelete: Restrict` on Order).

### 4. Direct Database Access Restrictions (Why Frontend Cannot Connect Directly)
The frontend application (React) never connects directly to PostgreSQL for the following reasons:
1. **Security & Credentials**: Client side code running in user browsers is publicly visible. Database credentials (`DATABASE_URL`) would be compromised.
2. **Authentication & Authorization**: The backend API validates user JWT tokens and role permissions before querying or modifying database resources.
3. **Business Logic & Validation**: Data validation (e.g. stock reservation, discount calculations, order status state machine) must be enforced server-side.
4. **Connection Management**: Direct browser-to-database connections would exhaust database connection limits and lack pooling capabilities.

---

## Database Management Commands

### Run Prisma Migration
```bash
npm run prisma:migrate
```

### Seed Development Data
```bash
npm run prisma:seed
```

### Open Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

---

## Environment Configuration

Environment variables are managed via `.env` in `application/backend`:
```env
DATABASE_URL="postgresql://postgres:<PASSWORD>@localhost:5432/ecommerce_devops?schema=public"
```

> [!CAUTION]
> Never commit actual passwords or connection strings to version control. Keep `.env` listed in `.gitignore`.
