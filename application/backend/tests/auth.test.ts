import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { Server } from 'http';
import { prisma } from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

let server: Server;
let baseUrl: string;

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

describe('PART 4 — Authentication & Authorization Integration Tests', () => {
  const testCustomerEmail = `test.customer.${Date.now()}@example.com`;
  const testCustomerPassword = 'SecurePassword123!';
  let customerAccessToken: string = '';
  let customerCookieHeader: string = '';

  test('POST /api/v1/auth/register - Valid registration creates customer user with 201 Created', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: testCustomerEmail,
        password: testCustomerPassword,
        phone: '+1234567890',
      }),
    });

    assert.equal(res.status, 201);

    // Extract set-cookie header
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.ok(setCookie.includes('refreshToken='));
    assert.ok(setCookie.includes('HttpOnly'));

    const body = (await res.json()) as {
      success: boolean;
      data: {
        user: { id: string; name: string; email: string; role: string; passwordHash?: string };
        accessToken: string;
      };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.user.email, testCustomerEmail.toLowerCase());
    assert.equal(body.data.user.role, 'CUSTOMER');
    assert.equal(body.data.user.passwordHash, undefined, 'passwordHash must never be exposed');
    assert.ok(body.data.accessToken, 'Access token must be returned');

    customerAccessToken = body.data.accessToken;
    customerCookieHeader = setCookie.split(';')[0];
  });

  test('POST /api/v1/auth/register - Duplicate email returns 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate User',
        email: testCustomerEmail,
        password: testCustomerPassword,
      }),
    });

    assert.equal(res.status, 409);
    const body = (await res.json()) as { success: boolean; error: { code: string; message: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'CONFLICT');
    assert.ok(body.error.message.includes('already exists'));
  });

  test('POST /api/v1/auth/register - Weak password rejected with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Weak Password User',
        email: `weak.${Date.now()}@example.com`,
        password: 'short',
      }),
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  test('POST /api/v1/auth/login - Valid login returns access token and sets refresh cookie', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: testCustomerPassword,
      }),
    });

    assert.equal(res.status, 200);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.ok(setCookie.includes('refreshToken='));

    const body = (await res.json()) as {
      success: boolean;
      data: { user: { email: string; role: string; passwordHash?: string }; accessToken: string };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.user.email, testCustomerEmail.toLowerCase());
    assert.equal(body.data.user.passwordHash, undefined);
    assert.ok(body.data.accessToken);

    // Save active access token and cookie header for subsequent tests
    customerAccessToken = body.data.accessToken;
    customerCookieHeader = setCookie.split(';')[0];
  });

  test('POST /api/v1/auth/login - Wrong password returns generic 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: 'WrongPassword999!',
      }),
    });

    assert.equal(res.status, 401);
    const body = (await res.json()) as { success: boolean; error: { code: string; message: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
    assert.equal(body.error.message, 'Invalid email or password');
  });

  test('POST /api/v1/auth/login - Non-existent email returns generic 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `nonexistent.${Date.now()}@example.com`,
        password: testCustomerPassword,
      }),
    });

    assert.equal(res.status, 401);
    const body = (await res.json()) as { success: boolean; error: { code: string; message: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
    assert.equal(body.error.message, 'Invalid email or password');
  });

  test('GET /api/v1/auth/me - Authenticated user can fetch profile without passwordHash', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${customerAccessToken}` },
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      success: boolean;
      data: { user: { email: string; role: string; passwordHash?: string } };
    };

    assert.equal(body.success, true);
    assert.equal(body.data.user.email, testCustomerEmail.toLowerCase());
    assert.equal(body.data.user.passwordHash, undefined);
  });

  test('GET /api/v1/auth/me - Missing token returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`);
    assert.equal(res.status, 401);
  });

  test('GET /api/v1/auth/me - Malformed token returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: 'Bearer not.a.valid.jwt.token' },
    });
    assert.equal(res.status, 401);
  });

  test('Role Authorization - CUSTOMER cannot access ADMIN-only endpoint (HTTP 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/test`, {
      headers: { Authorization: `Bearer ${customerAccessToken}` },
    });

    assert.equal(res.status, 403);
    const body = (await res.json()) as { success: boolean; error: { code: string; message: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
    assert.ok(body.error.message.includes('Access forbidden'));
  });

  test('Role Authorization - ADMIN can access ADMIN-only endpoint (HTTP 200 OK)', async () => {
    // Create an admin user directly for test purposes
    const adminEmail = `test.admin.${Date.now()}@example.com`;
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);

    const adminUser = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: Role.ADMIN,
      },
    });

    // Login as admin
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: 'AdminPassword123!',
      }),
    });

    assert.equal(loginRes.status, 200);
    const loginBody = (await loginRes.json()) as { data: { accessToken: string } };

    // Access admin test endpoint with admin access token
    const res = await fetch(`${baseUrl}/api/v1/admin/test`, {
      headers: { Authorization: `Bearer ${loginBody.data.accessToken}` },
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; data: { message: string } };
    assert.equal(body.success, true);
    assert.equal(body.data.message, 'Admin authorization successful');

    // Clean up test admin user
    await prisma.user.delete({ where: { id: adminUser.id } });
  });

  test('POST /api/v1/auth/refresh - Refresh token rotation generates new tokens', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: customerCookieHeader },
    });

    assert.equal(res.status, 200);

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.ok(setCookie.includes('refreshToken='));

    const body = (await res.json()) as { success: boolean; data: { accessToken: string } };
    assert.equal(body.success, true);
    assert.ok(body.data.accessToken);

    const oldCookieHeader = customerCookieHeader;
    customerCookieHeader = setCookie.split(';')[0];
    customerAccessToken = body.data.accessToken;

    // Verify old refresh token is revoked and fails on reuse
    const rotatedRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: oldCookieHeader },
    });
    assert.equal(rotatedRes.status, 401, 'Revoked old refresh token must be rejected');
  });

  test('POST /api/v1/auth/logout - Revokes session and clears cookie', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Cookie: customerCookieHeader },
    });

    assert.equal(res.status, 200);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);

    // Subsequent refresh using the logged-out cookie must fail
    const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: customerCookieHeader },
    });

    assert.equal(refreshRes.status, 401);
  });
});
