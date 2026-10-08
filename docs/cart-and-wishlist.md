# Part 6 — Cart & Wishlist Documentation

## Overview

Part 6 implements the authenticated Customer **Cart** and **Wishlist** management system for the AI-Powered E-Commerce DevOps Platform.

It provides secure, real-time RESTful API endpoints for customer shopping carts and product wishlists, integrating stock boundary checks against the `Inventory` model without requiring schema modifications or database resets.

---

## Cart API Endpoints

All Cart endpoints require customer or admin authentication via JWT Bearer token in the `Authorization` header (`requireAuth`).

### 1. Get Cart
- **Endpoint**: `GET /api/v1/cart`
- **Authentication**: Required (`Bearer <ACCESS_TOKEN>`)
- **Description**: Returns the authenticated user's shopping cart, items, stock availability, subtotal, and total amount.
- **Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "c1f7a4b0-3998-4a4a-9b1b-1234567890ab",
    "userId": "u1f7a4b0-3998-4a4a-9b1b-1234567890cd",
    "items": [
      {
        "id": "ci1f7a4b0-3998-4a4a-9b1b-1234567890ef",
        "cartId": "c1f7a4b0-3998-4a4a-9b1b-1234567890ab",
        "productId": "p8f9b1c2-5555-4444-9999-123456789012",
        "quantity": 2,
        "unitPrice": 99.99,
        "subtotal": 199.98,
        "product": {
          "id": "p8f9b1c2-5555-4444-9999-123456789012",
          "name": "RGB Mechanical Keyboard",
          "slug": "rgb-mechanical-keyboard",
          "description": "Custom mechanical keyboard with hot-swappable switches",
          "price": 99.99,
          "compareAtPrice": 129.99,
          "sku": "KB-RGB-PRO",
          "categoryId": "cat-001",
          "isActive": true,
          "images": [],
          "availableStock": 10
        },
        "createdAt": "2026-10-08T06:00:00.000Z",
        "updatedAt": "2026-10-08T06:00:00.000Z"
      }
    ],
    "itemCount": 1,
    "totalItems": 2,
    "subtotal": 199.98,
    "total": 199.98,
    "createdAt": "2026-10-08T06:00:00.000Z",
    "updatedAt": "2026-10-08T06:00:00.000Z"
  }
}
```

---

### 2. Add Item to Cart
- **Endpoint**: `POST /api/v1/cart/items`
- **Authentication**: Required (`Bearer <ACCESS_TOKEN>`)
- **Request Body**:
```json
{
  "productId": "p8f9b1c2-5555-4444-9999-123456789012",
  "quantity": 1
}
```
- **Validation**:
  - `productId`: Non-empty string (Required)
  - `quantity`: Integer >= 1 (Default: 1)
- **Behavior**:
  - Verifies product existence and active status (`isActive === true`).
  - Checks available stock (`inventory.quantity - inventory.reservedQuantity`). Rejects requests exceeding available inventory with `400 BAD REQUEST`.
  - If the product already exists in user's cart, updates existing item quantity instead of creating a duplicate row.
- **Response**: `200 OK`

---

### 3. Update Cart Item Quantity
- **Endpoint**: `PATCH /api/v1/cart/items/:productId`
- **Authentication**: Required (`Bearer <ACCESS_TOKEN>`)
- **Request Body**:
```json
{
  "quantity": 3
}
```
- **Validation**:
  - `quantity`: Integer >= 1
- **Behavior**: Updates item quantity in the cart. Checks available stock bounds.
- **Response**: `200 OK`

---

### 4. Remove Item from Cart
- **Endpoint**: `DELETE /api/v1/cart/items/:productId`
- **Authentication**: Required (`Bearer <ACCESS_TOKEN>`)
- **Behavior**: Removes specified product from user's cart. Returns `404 NOT FOUND` if item was not in cart.
- **Response**: `200 OK`

---

### 5. Clear Cart
- **Endpoint**: `DELETE /api/v1/cart`
- **Authentication**: Required (`Bearer <ACCESS_TOKEN>`)
- **Behavior**: Removes all items from user's cart.
- **Response**: `200 OK`

---

## Wishlist API Endpoints

All Wishlist endpoints require customer or admin authentication (`requireAuth`).

### 1. Get Wishlist
- **Endpoint**: `GET /api/v1/wishlist`
- **Authentication**: Required (`Bearer <ACCESS_TOKEN>`)
- **Description**: Returns the authenticated user's wishlist and items.
- **Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "w1f7a4b0-3998-4a4a-9b1b-1234567890ab",
    "userId": "u1f7a4b0-3998-4a4a-9b1b-1234567890cd",
    "items": [
      {
        "id": "wi1f7a4b0-3998-4a4a-9b1b-1234567890ef",
        "wishlistId": "w1f7a4b0-3998-4a4a-9b1b-1234567890ab",
        "productId": "p8f9b1c2-5555-4444-9999-123456789012",
        "product": {
          "id": "p8f9b1c2-5555-4444-9999-123456789012",
          "name": "Wireless Pro Noise-Canceling Headphones",
          "slug": "wireless-pro-noise-canceling-headphones",
          "price": 199.99,
          "isActive": true
        },
        "createdAt": "2026-10-08T06:00:00.000Z"
      }
    ],
    "itemCount": 1,
    "createdAt": "2026-10-08T06:00:00.000Z",
    "updatedAt": "2026-10-08T06:00:00.000Z"
  }
}
```

---

### 2. Add Item to Wishlist
- **Endpoint**: `POST /api/v1/wishlist/items`
- **Authentication**: Required (`Bearer <ACCESS_TOKEN>`)
- **Request Body**:
```json
{
  "productId": "p8f9b1c2-5555-4444-9999-123456789012"
}
```
- **Validation**:
  - `productId`: Non-empty string
- **Behavior**: Adds product to wishlist. Rejects non-existent or inactive products. Duplicate additions are handled idempotently without error or duplicate rows.
- **Response**: `200 OK`

---

### 3. Remove Item from Wishlist
- **Endpoint**: `DELETE /api/v1/wishlist/items/:productId`
- **Authentication**: Required (`Bearer <ACCESS_TOKEN>`)
- **Behavior**: Removes specified product from wishlist. Returns `404 NOT FOUND` if item is not in wishlist.
- **Response**: `200 OK`

---

### 4. Clear Wishlist
- **Endpoint**: `DELETE /api/v1/wishlist`
- **Authentication**: Required (`Bearer <ACCESS_TOKEN>`)
- **Behavior**: Removes all items from user's wishlist.
- **Response**: `200 OK`

---

## Authorization & Data Security Matrix

| Action | Unauthenticated | Customer (Own Cart/Wishlist) | Customer (Other User's Cart/Wishlist) |
|---|---|---|---|
| Read Cart / Wishlist | 401 Unauthorized | 200 OK | Isolated (Access Impossible) |
| Add / Update Item | 401 Unauthorized | 200 OK | Isolated (Access Impossible) |
| Delete Item / Clear | 401 Unauthorized | 200 OK | Isolated (Access Impossible) |

---

## Example cURL Requests

### Add Item to Cart
```bash
curl -X POST http://localhost:5000/api/v1/cart/items \
  -H "Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId": "<PRODUCT_UUID>", "quantity": 2}'
```

### Add Item to Wishlist
```bash
curl -X POST http://localhost:5000/api/v1/wishlist/items \
  -H "Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId": "<PRODUCT_UUID>"}'
```
