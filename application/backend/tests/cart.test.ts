import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { Server } from 'http';
import { prisma } from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

let server: Server;
let baseUrl: string;
let customer1AccessToken: string;
let customer1Id: string;
let customer2AccessToken: string;
let testProductId: string;
let testCategoryId: string;

before(async () => {
  const app = createApp();

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (typeof address === 'object' && address !== null) {
        baseUrl = `http://localhost:${address.port}`;
      }
      resolve();
    });
  });

  // Setup test category
  const category = await prisma.category.create({
    data: {
      name: `Cart Test Category ${Date.now()}`,
      slug: `cart-test-cat-${Date.now()}`,
    },
  });
  testCategoryId = category.id;

  // Setup test product with inventory 10
  const product = await prisma.product.create({
    data: {
      name: 'Cart Test Keyboard',
      slug: `cart-test-keyboard-${Date.now()}`,
      description: 'Mechanical RGB keyboard',
      price: 99.99,
      sku: `SKU-CART-KB-${Date.now()}`,
      categoryId: testCategoryId,
      isActive: true,
      inventory: {
        create: {
          quantity: 10,
          reservedQuantity: 0,
        },
      },
    },
  });
  testProductId = product.id;

  // Setup Customer 1
  const email1 = `cart.cust1.${Date.now()}@example.com`;
  const pwHash1 = await bcrypt.hash('CustomerPass123!', 10);
  const user1 = await prisma.user.create({
    data: {
      name: 'Cart Customer One',
      email: email1,
      passwordHash: pwHash1,
      role: Role.CUSTOMER,
    },
  });
  customer1Id = user1.id;

  const loginRes1 = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email1, password: 'CustomerPass123!' }),
  });
  const loginBody1 = (await loginRes1.json()) as { data: { accessToken: string } };
  customer1AccessToken = loginBody1.data.accessToken;

  // Setup Customer 2
  const email2 = `cart.cust2.${Date.now()}@example.com`;
  const pwHash2 = await bcrypt.hash('CustomerPass123!', 10);
  await prisma.user.create({
    data: {
      name: 'Cart Customer Two',
      email: email2,
      passwordHash: pwHash2,
      role: Role.CUSTOMER,
    },
  });

  const loginRes2 = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email2, password: 'CustomerPass123!' }),
  });
  const loginBody2 = (await loginRes2.json()) as { data: { accessToken: string } };
  customer2AccessToken = loginBody2.data.accessToken;
});

after(async () => {
  await new Promise<void>((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
});

describe('PART 6 — Cart API Integration Tests', () => {
  test('GET /api/v1/cart - Unauthenticated request returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart`);
    assert.equal(res.status, 401);
  });

  test('GET /api/v1/cart - Authenticated user can retrieve empty cart (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart`, {
      headers: { Authorization: `Bearer ${customer1AccessToken}` },
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: { userId: string; items: Array<unknown>; subtotal: number; total: number };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.userId, customer1Id);
    assert.equal(body.data.items.length, 0);
    assert.equal(body.data.subtotal, 0);
    assert.equal(body.data.total, 0);
  });

  test('POST /api/v1/cart/items - User can add product to cart (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({
        productId: testProductId,
        quantity: 2,
      }),
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: {
        items: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>;
        subtotal: number;
        total: number;
      };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.items.length, 1);
    assert.equal(body.data.items[0].productId, testProductId);
    assert.equal(body.data.items[0].quantity, 2);
    assert.equal(body.data.items[0].unitPrice, 99.99);
    assert.equal(body.data.items[0].subtotal, 199.98);
    assert.equal(body.data.subtotal, 199.98);
  });

  test('POST /api/v1/cart/items - Adding duplicate product updates existing CartItem quantity', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({
        productId: testProductId,
        quantity: 3,
      }),
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: {
        items: Array<{ productId: string; quantity: number; subtotal: number }>;
        subtotal: number;
      };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.items.length, 1, 'Should update existing item instead of creating duplicate');
    assert.equal(body.data.items[0].quantity, 5); // 2 + 3 = 5
    assert.equal(body.data.items[0].subtotal, 499.95);
  });

  test('POST /api/v1/cart/items - Exceeding available stock returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({
        productId: testProductId,
        quantity: 10, // 5 existing + 10 = 15 > 10 stock
      }),
    });
    assert.equal(res.status, 400);

    const body = (await res.json()) as { success: boolean; error: { code: string; message: string } };
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('exceeds available stock') || body.error.code === 'INSUFFICIENT_STOCK');
  });

  test('POST /api/v1/cart/items - Invalid zero or negative quantity is rejected with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({
        productId: testProductId,
        quantity: 0,
      }),
    });
    assert.equal(res.status, 400);

    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  test('PATCH /api/v1/cart/items/:productId - User can update item quantity (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart/items/${testProductId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({
        quantity: 4,
      }),
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: { items: Array<{ productId: string; quantity: number }>; subtotal: number };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.items[0].quantity, 4);
    assert.equal(body.data.subtotal, 399.96);
  });

  test('PATCH /api/v1/cart/items/:productId - Updating to quantity exceeding stock returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart/items/${testProductId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({
        quantity: 50,
      }),
    });
    assert.equal(res.status, 400);
  });

  test('User isolation - Customer 2 cannot view or modify Customer 1 cart items', async () => {
    // Customer 2 fetches own cart
    const res2 = await fetch(`${baseUrl}/api/v1/cart`, {
      headers: { Authorization: `Bearer ${customer2AccessToken}` },
    });
    assert.equal(res2.status, 200);
    const body2 = (await res2.json()) as { data: { items: Array<unknown> } };
    assert.equal(body2.data.items.length, 0, 'Customer 2 cart must be separate and empty');

    // Customer 2 attempts to update testProductId in Customer 2 cart (not present)
    const patchRes2 = await fetch(`${baseUrl}/api/v1/cart/items/${testProductId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer2AccessToken}`,
      },
      body: JSON.stringify({ quantity: 1 }),
    });
    assert.equal(patchRes2.status, 404, 'Product not in Customer 2 cart must return 404');
  });

  test('DELETE /api/v1/cart/items/:productId - User can remove item from cart (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart/items/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer1AccessToken}` },
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: { items: Array<unknown>; subtotal: number };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.items.length, 0);
    assert.equal(body.data.subtotal, 0);
  });

  test('DELETE /api/v1/cart/items/:productId - Removing item not in cart returns 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cart/items/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer1AccessToken}` },
    });
    assert.equal(res.status, 404);
  });

  test('DELETE /api/v1/cart - Clear cart empties all cart items (HTTP 200 OK)', async () => {
    // Add item first
    await fetch(`${baseUrl}/api/v1/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({ productId: testProductId, quantity: 1 }),
    });

    // Clear cart
    const clearRes = await fetch(`${baseUrl}/api/v1/cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer1AccessToken}` },
    });
    assert.equal(clearRes.status, 200);

    const body = (await clearRes.json()) as {
      success: boolean;
      data: { items: Array<unknown>; subtotal: number };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.items.length, 0);
    assert.equal(body.data.subtotal, 0);
  });
});
