import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { Server } from 'http';
import { prisma } from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

let server: Server;
let baseUrl: string;
let adminAccessToken: string;
let customerAccessToken: string;
let createdCategoryId: string;

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

  // Setup Admin user
  const adminEmail = `cat.admin.${Date.now()}@example.com`;
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  await prisma.user.create({
    data: {
      name: 'Category Admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: 'AdminPassword123!' }),
  });
  const adminLoginBody = (await adminLoginRes.json()) as { data: { accessToken: string } };
  adminAccessToken = adminLoginBody.data.accessToken;

  // Setup Customer user
  const customerEmail = `cat.customer.${Date.now()}@example.com`;
  const customerPasswordHash = await bcrypt.hash('CustomerPassword123!', 10);
  await prisma.user.create({
    data: {
      name: 'Category Customer',
      email: customerEmail,
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  const customerLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password: 'CustomerPassword123!' }),
  });
  const customerLoginBody = (await customerLoginRes.json()) as { data: { accessToken: string } };
  customerAccessToken = customerLoginBody.data.accessToken;
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

describe('PART 5 — Category Integration Tests', () => {
  test('1. Public category listing works (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as { success: boolean; data: Array<{ id: string; name: string; slug: string }> };
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  test('2. Admin can create category (HTTP 201 Created)', async () => {
    const categoryName = `Test Category ${Date.now()}`;
    const res = await fetch(`${baseUrl}/api/v1/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        name: categoryName,
        description: 'Test category description',
      }),
    });

    assert.equal(res.status, 201);
    const body = (await res.json()) as { success: boolean; data: { id: string; name: string; slug: string } };
    assert.equal(body.success, true);
    assert.equal(body.data.name, categoryName);
    assert.ok(body.data.slug);

    createdCategoryId = body.data.id;
  });

  test('3. Customer cannot create category (HTTP 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Category',
      }),
    });

    assert.equal(res.status, 403);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  test('4. Unauthenticated user cannot create category (HTTP 401 Unauthorized)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Anonymous Category',
      }),
    });

    assert.equal(res.status, 401);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('5. Duplicate category handling returns 409 Conflict', async () => {
    const categoryName = `Duplicate Category ${Date.now()}`;
    // Create first category
    await fetch(`${baseUrl}/api/v1/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({ name: categoryName }),
    });

    // Try creating again with duplicate name
    const res = await fetch(`${baseUrl}/api/v1/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({ name: categoryName }),
    });

    assert.equal(res.status, 409);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'CONFLICT');
  });

  test('6. Admin can update category (HTTP 200 OK)', async () => {
    const updatedName = `Updated Name ${Date.now()}`;
    const res = await fetch(`${baseUrl}/api/v1/categories/${createdCategoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        name: updatedName,
        description: 'Updated description',
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; data: { id: string; name: string; description: string } };
    assert.equal(body.success, true);
    assert.equal(body.data.name, updatedName);
    assert.equal(body.data.description, 'Updated description');
  });

  test('7. Non-existent category returns 404 Not Found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${baseUrl}/api/v1/categories/${fakeId}`);
    assert.equal(res.status, 404);

    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  test('8. Admin can delete empty category (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories/${createdCategoryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminAccessToken}`,
      },
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; data: { message: string } };
    assert.equal(body.success, true);
    assert.ok(body.data.message.includes('deleted successfully'));
  });

  test('9. Admin cannot delete category containing products (HTTP 409 Conflict)', async () => {
    // Find or create a category with products
    const categoryWithProducts = await prisma.category.findFirst({
      where: { products: { some: {} } },
    });

    if (categoryWithProducts) {
      const res = await fetch(`${baseUrl}/api/v1/categories/${categoryWithProducts.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,
        },
      });

      assert.equal(res.status, 409);
      const body = (await res.json()) as { success: boolean; error: { code: string; message: string } };
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'CONFLICT');
      assert.ok(body.error.message.includes('associated product'));
    }
  });
});
