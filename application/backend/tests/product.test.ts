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
let testCategoryId: string;
let createdProductId: string;
let createdProductSku: string;

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
  const testCategory = await prisma.category.create({
    data: {
      name: `Prod Test Category ${Date.now()}`,
      slug: `prod-test-cat-${Date.now()}`,
      description: 'Category for product tests',
    },
  });
  testCategoryId = testCategory.id;

  // Setup Admin user
  const adminEmail = `prod.admin.${Date.now()}@example.com`;
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  await prisma.user.create({
    data: {
      name: 'Product Admin',
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
  const customerEmail = `prod.customer.${Date.now()}@example.com`;
  const customerPasswordHash = await bcrypt.hash('CustomerPassword123!', 10);
  await prisma.user.create({
    data: {
      name: 'Product Customer',
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

describe('PART 5 — Product Integration Tests', () => {
  test('9. Public product listing works (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: Array<{ id: string; name: string }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    };

    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.equal(typeof body.meta.total, 'number');
  });

  test('11. Admin can create product (HTTP 201 Created)', async () => {
    createdProductSku = `SKU-TEST-${Date.now()}`;
    const res = await fetch(`${baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Ultra HD Gaming Monitor 27 Inch',
        description: '4K High Refresh Rate IPS Gaming Display with HDR support',
        price: 349.99,
        compareAtPrice: 399.99,
        sku: createdProductSku,
        categoryId: testCategoryId,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
            altText: 'Ultra HD Gaming Monitor Front View',
            sortOrder: 0,
          },
        ],
        stockQuantity: 25,
      }),
    });

    assert.equal(res.status, 201);
    const body = (await res.json()) as {
      success: boolean;
      data: {
        id: string;
        name: string;
        sku: string;
        price: string | number;
        images: Array<{ url: string }>;
        inventory: { quantity: number };
      };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.name, 'Ultra HD Gaming Monitor 27 Inch');
    assert.equal(body.data.sku, createdProductSku);
    assert.equal(body.data.images.length, 1);
    assert.equal(body.data.inventory.quantity, 25);

    createdProductId = body.data.id;
  });

  test('10. Public product details work (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products/${createdProductId}`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: { id: string; name: string; category: { id: string }; inventory: { quantity: number } };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.id, createdProductId);
    assert.equal(body.data.category.id, testCategoryId);
    assert.equal(body.data.inventory.quantity, 25);
  });

  test('12. Customer cannot create product (HTTP 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Product',
        description: 'Description',
        price: 99.99,
        sku: `SKU-CUST-${Date.now()}`,
        categoryId: testCategoryId,
      }),
    });

    assert.equal(res.status, 403);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  test('13. Unauthenticated user cannot create product (HTTP 401 Unauthorized)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Anonymous Product',
        description: 'Description',
        price: 99.99,
        sku: `SKU-ANON-${Date.now()}`,
        categoryId: testCategoryId,
      }),
    });

    assert.equal(res.status, 401);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('14. Duplicate SKU is handled (HTTP 409 Conflict)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate SKU Product',
        description: 'Description',
        price: 99.99,
        sku: createdProductSku,
        categoryId: testCategoryId,
      }),
    });

    assert.equal(res.status, 409);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'CONFLICT');
  });

  test('15. Invalid negative price is rejected (HTTP 400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Price Product',
        description: 'Description',
        price: -50.00,
        sku: `SKU-NEG-${Date.now()}`,
        categoryId: testCategoryId,
      }),
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  test('16. Invalid negative stock is rejected (HTTP 400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Stock Product',
        description: 'Description',
        price: 50.00,
        sku: `SKU-NEGSTOCK-${Date.now()}`,
        categoryId: testCategoryId,
        stockQuantity: -10,
      }),
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  test('17. Non-existent category ID is rejected (HTTP 400 Bad Request)', async () => {
    const fakeCategoryId = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Category Product',
        description: 'Description',
        price: 50.00,
        sku: `SKU-INVCAT-${Date.now()}`,
        categoryId: fakeCategoryId,
      }),
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as { success: boolean; error: { code: string; message: string } };
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('does not exist') || body.error.code === 'BAD_REQUEST');
  });

  test('18. Admin can update product (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products/${createdProductId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Ultra HD Gaming Monitor 27 Inch (Updated)',
        price: 329.99,
        stockQuantity: 30,
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      success: boolean;
      data: { name: string; price: string | number; inventory: { quantity: number } };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.name, 'Ultra HD Gaming Monitor 27 Inch (Updated)');
    assert.equal(body.data.inventory.quantity, 30);
  });

  test('19. Admin can delete/deactivate product (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products/${createdProductId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminAccessToken}`,
      },
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; data: { isActive: boolean; message: string } };
    assert.equal(body.success, true);
    assert.equal(body.data.isActive, false);

    // Public fetch of deactivated product must return 404 Not Found
    const publicGetRes = await fetch(`${baseUrl}/api/v1/products/${createdProductId}`);
    assert.equal(publicGetRes.status, 404);
  });

  test('20. Non-existent product returns 404 Not Found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await fetch(`${baseUrl}/api/v1/products/${fakeId}`);
    assert.equal(res.status, 404);
  });

  test('21. Product Search works (HTTP 200 OK)', async () => {
    // Create an active product for search test
    const searchSku = `SKU-SEARCH-${Date.now()}`;
    await fetch(`${baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Ergonomic Coding Chair Apex',
        description: 'Mesh lumbar support office chair for software engineers',
        price: 299.00,
        sku: searchSku,
        categoryId: testCategoryId,
      }),
    });

    const res = await fetch(`${baseUrl}/api/v1/products?search=Apex`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: Array<{ name: string }>;
    };

    assert.equal(body.success, true);
    assert.ok(body.data.some((p) => p.name.includes('Apex')));
  });

  test('22. Category filtering works (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products?categoryId=${testCategoryId}`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: Array<{ categoryId: string }>;
    };

    assert.equal(body.success, true);
    assert.ok(body.data.length > 0);
    assert.ok(body.data.every((p) => p.categoryId === testCategoryId));
  });

  test('23. Price filtering works (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products?minPrice=200&maxPrice=350`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: Array<{ price: string | number }>;
    };

    assert.equal(body.success, true);
    for (const item of body.data) {
      const val = typeof item.price === 'number' ? item.price : parseFloat(item.price);
      assert.ok(val >= 200 && val <= 350);
    }
  });

  test('24. Sorting works (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products?sortBy=price&sortOrder=asc`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: Array<{ price: string | number }>;
    };

    assert.equal(body.success, true);
    if (body.data.length >= 2) {
      const p1 = typeof body.data[0].price === 'number' ? body.data[0].price : parseFloat(body.data[0].price);
      const p2 = typeof body.data[1].price === 'number' ? body.data[1].price : parseFloat(body.data[1].price);
      assert.ok(p1 <= p2, `Ascending sort failed: ${p1} > ${p2}`);
    }
  });

  test('25. Pagination works (HTTP 200 OK)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products?page=1&limit=2`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      success: boolean;
      data: Array<unknown>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    };

    assert.equal(body.success, true);
    assert.equal(body.meta.page, 1);
    assert.equal(body.meta.limit, 2);
    assert.ok(body.data.length <= 2);
  });

  test('26. Invalid pagination parameters handled cleanly (HTTP 400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/products?page=0&limit=500`);
    assert.equal(res.status, 400);

    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });
});
