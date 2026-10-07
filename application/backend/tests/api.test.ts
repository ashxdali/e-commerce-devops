import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { Server } from 'http';

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

describe('API Foundation & Architecture Tests', () => {
  test('GET /health - Root health endpoint returns 200 OK', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { status: string; service: string; timestamp: string };
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'ai-ecommerce-backend');
    assert.ok(body.timestamp);
  });

  test('GET /health/live - Liveness endpoint returns 200 OK', async () => {
    const res = await fetch(`${baseUrl}/health/live`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { status: string; uptimeSeconds: number };
    assert.equal(body.status, 'alive');
    assert.ok(typeof body.uptimeSeconds === 'number');
  });

  test('GET /health/ready - Readiness endpoint returns 200 OK or 503 Service Unavailable', async () => {
    const res = await fetch(`${baseUrl}/health/ready`);
    assert.ok(res.status === 200 || res.status === 503);
    const body = (await res.json()) as { status: string };
    assert.ok(body.status === 'ready' || body.status === 'unhealthy');
  });

  test('GET /api/v1 - API information endpoint returns standard success response', async () => {
    const res = await fetch(`${baseUrl}/api/v1`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { success: boolean; data: { name: string; version: string } };
    assert.equal(body.success, true);
    assert.equal(body.data.name, 'AI-Powered E-Commerce API');
    assert.equal(body.data.version, 'v1');
  });

  test('GET /api/v1/unknown-route - 404 Not Found returns standard error response and X-Request-ID header', async () => {
    const res = await fetch(`${baseUrl}/api/v1/unknown-route`);
    assert.equal(res.status, 404);
    assert.ok(res.headers.has('x-request-id'));
    const body = (await res.json()) as { success: boolean; error: { code: string; message: string } };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.ok(body.error.message.includes('Route not found'));
  });

  test('POST /api/v1/validate-test - Validation middleware returns 400 Bad Request on invalid payload', async () => {
    const res = await fetch(`${baseUrl}/api/v1/validate-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', quantity: 0 }),
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as {
      success: boolean;
      error: { code: string; details: Array<{ field: string; message: string }> };
    };
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(body.error.details));
    assert.equal(body.error.details.length, 2);
  });

  test('POST /api/v1/validate-test - Validation middleware passes on valid payload', async () => {
    const res = await fetch(`${baseUrl}/api/v1/validate-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', quantity: 5 }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      success: boolean;
      data: { validated: boolean; input: { email: string; quantity: number } };
    };
    assert.equal(body.success, true);
    assert.equal(body.data.input.email, 'user@example.com');
  });
});
