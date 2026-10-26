import assert from "node:assert/strict";
import { after, before, test } from "node:test";

process.env.JWT_SECRET ??= "test-only-secret-never-use-in-production";
process.env.FRONTEND_ORIGIN ??= "http://localhost:5173";

const { app } = await import("../src/app.js");
let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("health endpoint responds without requiring a database", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});

test("unknown API routes return a JSON 404", async () => {
  const response = await fetch(`${baseUrl}/api/not-a-route`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "API endpoint not found." });
});

test("registration rejects weak passwords before accessing MySQL", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      password: "short",
    }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /12 to 72 UTF-8 bytes/);
});

test("registration rejects passwords beyond bcrypt's supported byte length", async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      password: "a".repeat(73),
    }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /72 UTF-8 bytes/);
});

test("logout clears the HTTP-only session cookie", async () => {
  const response = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST" });
  assert.equal(response.status, 204);
  assert.match(response.headers.get("set-cookie") ?? "", /afx_session=/);
  assert.match(response.headers.get("set-cookie") ?? "", /HttpOnly/i);
});

test("profile endpoints require authentication", async () => {
  const getResponse = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(getResponse.status, 401);

  const updateResponse = await fetch(`${baseUrl}/api/auth/me`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Updated User", email: "updated@example.com" }),
  });
  assert.equal(updateResponse.status, 401);
});

test("journal and administrator endpoints require authentication", async () => {
  const journalResponse = await fetch(`${baseUrl}/api/journal`);
  assert.equal(journalResponse.status, 401);

  const adminResponse = await fetch(`${baseUrl}/api/admin/overview`);
  assert.equal(adminResponse.status, 401);
});

test("admin mutation methods are allowed by CORS preflight", async () => {
  const response = await fetch(`${baseUrl}/api/admin/users/1/role`, {
    method: "OPTIONS",
    headers: {
      origin: "http://localhost:5173",
      "access-control-request-method": "PATCH",
      "access-control-request-headers": "content-type",
    },
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
  assert.match(response.headers.get("access-control-allow-methods") ?? "", /PATCH/);
});

test("API does not disclose its Express fingerprint", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.headers.get("x-powered-by"), null);
});
