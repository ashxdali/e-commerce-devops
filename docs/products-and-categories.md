# Part 5 — Categories & Products Documentation

## Overview

Part 5 implements the core Product Catalog and Category Management system for the AI-Powered E-Commerce DevOps Platform.

It provides high-performance, robust, and secure RESTful endpoints for public product browsing, filtering, searching, sorting, pagination, and admin-only catalog management.

---

## Category Management API Endpoints

### 1. Public Category Listing

- **Endpoint**: `GET /api/v1/categories`
- **Access**: Public (Unauthenticated / Customer / Admin)
- **Response**: `200 OK`
- **Body**:

```json
{
  "success": true,
  "data": [
    {
      "id": "c1f7a4b0-3998-4a4a-9b1b-1234567890ab",
      "name": "Electronics & Gadgets",
      "slug": "electronics",
      "description": "High quality gadgets, headphones, and developer accessories.",
      "createdAt": "2026-10-08T05:00:00.000Z",
      "updatedAt": "2026-10-08T05:00:00.000Z",
      "_count": {
        "products": 5
      }
    }
  ]
}
```

---

### 2. Category Details

- **Endpoint**: `GET /api/v1/categories/:id`
- **Access**: Public
- **Response**: `200 OK` (or `404 NOT FOUND`)

---

### 3. Create Category (Admin Only)

- **Endpoint**: `POST /api/v1/categories`
- **Access**: Admin Only (`requireAuth` + `requireRole("ADMIN")`)
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Request Body**:

```json
{
  "name": "Smart Home Devices",
  "description": "Connected smart home automation sensors and hub controllers.",
  "slug": "smart-home"
}
```

- **Response**: `201 CREATED`
- **Errors**: `400 BAD REQUEST`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `409 CONFLICT`

---

### 4. Update Category (Admin Only)

- **Endpoint**: `PATCH /api/v1/categories/:id`
- **Access**: Admin Only (`requireAuth` + `requireRole("ADMIN")`)
- **Request Body**:

```json
{
  "name": "Smart Home & Automation",
  "description": "Updated smart home category description."
}
```

- **Response**: `200 OK`

---

### 5. Delete Category (Admin Only)

- **Endpoint**: `DELETE /api/v1/categories/:id`
- **Access**: Admin Only (`requireAuth` + `requireRole("ADMIN")`)
- **Safety Rule**: If category has linked products, deletion is blocked (`onDelete: Restrict`) returning `409 CONFLICT` with message `"Cannot delete category with associated products"`.
- **Response**: `200 OK`

---

## Product Catalog API Endpoints

### 1. Product Listing (Pagination, Search, Filter, Sort)

- **Endpoint**: `GET /api/v1/products`
- **Access**: Public
- **Query Parameters**:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | Integer (>= 1) | `1` | Page number for pagination |
| `limit` | Integer (1..100) | `12` | Number of items per page |
| `search` | String | - | Search query matching name, description, SKU |
| `categoryId` | UUID String | - | Filter by category ID |
| `minPrice` | Decimal/Number (>= 0) | - | Minimum price bound |
| `maxPrice` | Decimal/Number (>= 0) | - | Maximum price bound |
| `sortBy` | Enum | `createdAt` | `name`, `price`, `createdAt`, `updatedAt` |
| `sortOrder` | Enum | `desc` | `asc`, `desc` |

- **Example Query**:
  `GET /api/v1/products?search=headphone&minPrice=50&maxPrice=300&page=1&limit=12&sortBy=price&sortOrder=asc`

- **Response Payload**:

```json
{
  "success": true,
  "data": [
    {
      "id": "p8f9b1c2-5555-4444-9999-123456789012",
      "name": "Wireless Pro Noise-Canceling Headphones",
      "slug": "wireless-pro-noise-canceling-headphones",
      "description": "Premium active noise-canceling headphones with 40-hour battery life.",
      "price": "199.99",
      "compareAtPrice": "249.99",
      "sku": "AUDIO-HEADPHONE-PRO1",
      "categoryId": "c1f7a4b0-3998-4a4a-9b1b-1234567890ab",
      "isActive": true,
      "category": {
        "id": "c1f7a4b0-3998-4a4a-9b1b-1234567890ab",
        "name": "Electronics & Gadgets",
        "slug": "electronics"
      },
      "images": [
        {
          "id": "img-001",
          "url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
          "altText": "Headphones Black",
          "sortOrder": 0
        }
      ],
      "inventory": {
        "quantity": 45,
        "reservedQuantity": 0
      },
      "createdAt": "2026-10-08T05:00:00.000Z",
      "updatedAt": "2026-10-08T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 2. Product Details

- **Endpoint**: `GET /api/v1/products/:id` (Supports ID or Slug)
- **Access**: Public
- **Response**: `200 OK` (returns full product representation) or `404 NOT FOUND` if non-existent or inactive for public user.

---

### 3. Create Product (Admin Only)

- **Endpoint**: `POST /api/v1/products`
- **Access**: Admin Only (`requireAuth` + `requireRole("ADMIN")`)
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Request Body**:

```json
{
  "name": "4K Ultra-Wide Curved Monitor 34-Inch",
  "description": "144Hz refresh rate, 1ms response time ergonomic curved display.",
  "price": 599.99,
  "compareAtPrice": 699.99,
  "sku": "DISP-34-CURVED-1",
  "categoryId": "<CATEGORY_UUID>",
  "isActive": true,
  "images": [
    {
      "url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
      "altText": "Monitor Front View",
      "sortOrder": 0
    }
  ],
  "stockQuantity": 35
}
```

- **Response**: `201 CREATED`
- **Validation**: Rejects negative price, invalid category ID, or duplicate SKU.

---

### 4. Update Product (Admin Only)

- **Endpoint**: `PATCH /api/v1/products/:id`
- **Access**: Admin Only (`requireAuth` + `requireRole("ADMIN")`)
- **Request Body**:

```json
{
  "price": 549.99,
  "stockQuantity": 50
}
```

- **Response**: `200 OK`

---

### 5. Delete/Deactivate Product (Admin Only)

- **Endpoint**: `DELETE /api/v1/products/:id`
- **Access**: Admin Only (`requireAuth` + `requireRole("ADMIN")`)
- **Behavior**: Performs soft-deletion / deactivation by setting `isActive: false` to preserve order item foreign key integrity.
- **Response**: `200 OK`

---

## Authorization & Security Summary

| Role | Categories Read | Categories Write | Products Read | Products Write |
|---|---|---|---|---|
| **Unauthenticated** | Yes | No (401) | Yes (Active Only) | No (401) |
| **CUSTOMER** | Yes | No (403) | Yes (Active Only) | No (403) |
| **ADMIN** | Yes | Yes | Yes (All) | Yes |

---

## Example cURL Requests

### Create Category (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Developer Tools", "description": "Hardware and software dev kits"}'
```

### Search & Filter Products (Public)
```bash
curl "http://localhost:5000/api/v1/products?search=keyboard&minPrice=50&sortBy=price&sortOrder=asc&page=1&limit=10"
```
