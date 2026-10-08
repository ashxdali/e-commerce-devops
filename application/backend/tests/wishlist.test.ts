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
      name: `Wishlist Test Category ${Date.now()}`,
      slug: `wishlist-test-cat-${Date.now()}`,
    },
  });
  testCategoryId = category.id;

  // Setup test product
  const product = await prisma.product.create({
    data: {
      name: 'Wishlist Test Headset',
      slug: `wishlist-test-headset-${Date.now()}`,
      description: 'Noise cancelling gaming headset',
      price: 149.99,
      sku: `SKU-WISH-HS-${Date.now()}`,
      categoryId: testCategoryId,
      isActive: true,
    },
  });
  testProductId = product.id;

  // Setup Customer 1
  const email1 = `wish.cust1.${Date.now()}@example.com`;
  const pwHash1 = await bcrypt.hash('CustomerPass123!', 10);
  const user1 = await prisma.user.create({
    data: {
      name: 'Wishlist Customer One',
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
  const email2 = `wish.cust2.${Date.now()}@example.com`;
  const pwHash2 = await bcrypt.hash('CustomerPass123!', 10);
  await prisma.user.create({
    data: {
      name: 'Wishlist Customer Two',
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

describe('PART 6 — Wishlist API Integration Tests', () => {
  test('GET /api/v1/wishlist - Unauthenticated request returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/wishlist`);
    assert.equal(res.status, 401);
  });

  test('GET /api/v1/wishlist - Authenticated user can retrieve empty wishlist (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/wishlist`, {
      headers: { Authorization: `Bearer ${customer1AccessToken}` },
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: { userId: string; items: Array<unknown>; itemCount: number };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.userId, customer1Id);
    assert.equal(body.data.items.length, 0);
    assert.equal(body.data.itemCount, 0);
  });

  test('POST /api/v1/wishlist/items - User can add product to wishlist (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/wishlist/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({
        productId: testProductId,
      }),
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: {
        items: Array<{ productId: string; product: { id: string; name: string } }>;
        itemCount: number;
      };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.items.length, 1);
    assert.equal(body.data.items[0].productId, testProductId);
    assert.equal(body.data.items[0].product.name, 'Wishlist Test Headset');
    assert.equal(body.data.itemCount, 1);
  });

  test('POST /api/v1/wishlist/items - Duplicate product addition is prevented (idempotent 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/wishlist/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({
        productId: testProductId,
      }),
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: { items: Array<unknown>; itemCount: number };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.items.length, 1, 'Duplicate entry must not be created');
    assert.equal(body.data.itemCount, 1);
  });

  test('POST /api/v1/wishlist/items - Non-existent product returns 404 Not Found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${baseUrl}/api/v1/wishlist/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({
        productId: fakeId,
      }),
    });
    assert.equal(res.status, 404);
  });

  test('User isolation - Customer 2 cannot view or modify Customer 1 wishlist', async () => {
    // Customer 2 fetches own wishlist
    const res2 = await fetch(`${baseUrl}/api/v1/wishlist`, {
      headers: { Authorization: `Bearer ${customer2AccessToken}` },
    });
    assert.equal(res2.status, 200);
    const body2 = (await res2.json()) as { data: { items: Array<unknown> } };
    assert.equal(body2.data.items.length, 0, 'Customer 2 wishlist must be separate and empty');

    // Customer 2 attempts to delete testProductId from Customer 2 wishlist (not present)
    const deleteRes2 = await fetch(`${baseUrl}/api/v1/wishlist/items/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer2AccessToken}` },
    });
    assert.equal(deleteRes2.status, 404, 'Product not in Customer 2 wishlist must return 404');
  });

  test('DELETE /api/v1/wishlist/items/:productId - User can remove product from wishlist (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/wishlist/items/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer1AccessToken}` },
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: { items: Array<unknown>; itemCount: number };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.items.length, 0);
    assert.equal(body.data.itemCount, 0);
  });

  test('DELETE /api/v1/wishlist/items/:productId - Removing item not in wishlist returns 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/api/v1/wishlist/items/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer1AccessToken}` },
    });
    assert.equal(res.status, 404);
  });

  test('DELETE /api/v1/wishlist - Clear wishlist empties all wishlist items (HTTP 200 OK)', async () => {
    // Add item first
    await fetch(`${baseUrl}/api/v1/wishlist/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer1AccessToken}`,
      },
      body: JSON.stringify({ productId: testProductId }),
    });

    // Clear wishlist
    const clearRes = await fetch(`${baseUrl}/api/v1/wishlist`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer1AccessToken}` },
    });
    assert.equal(clearRes.status, 200);

    const body = (await clearRes.json()) as {
      success: boolean;
      data: { items: Array<unknown>; itemCount: number };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.items.length, 0);
    assert.equal(body.data.itemCount, 0);
  });
});
