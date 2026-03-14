import { test, expect } from "@playwright/test";
import { supabaseAdmin, getTestProjectId, setProjectPlan } from "../helpers/test-utils";

test.describe("API Endpoints", () => {
  test("GET /api/v1/testimonials returns data with auth", async ({ request }) => {
    await setProjectPlan("business");

    const sb = supabaseAdmin();
    const testEmail = process.env.TEST_USER_EMAIL || "e2e-test@laudica.com";
    const testPassword = process.env.TEST_USER_PASSWORD || "TestPass123!";

    // Get auth token
    const { data: auth } = await sb.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    const projectId = await getTestProjectId();

    const response = await request.get(`/api/v1/testimonials?projectId=${projectId}`, {
      headers: {
        Authorization: `Bearer ${auth?.session?.access_token}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("pagination");

    await setProjectPlan("free");
  });

  test("GET /api/v1/testimonials returns 401 without auth", async ({ baseURL }) => {
    const projectId = await getTestProjectId();
    const url = `${baseURL || "http://localhost:3000"}/api/v1/testimonials?projectId=${projectId}`;

    // Use native fetch with no cookies — completely unauthenticated
    const response = await fetch(url, {
      headers: { "Cache-Control": "no-cache" },
      redirect: "manual",
    });

    // Without auth, the API returns 401 (route handler) or 403 (middleware/missing membership)
    expect([401, 403]).toContain(response.status);
  });

  test("GET /api/v1/testimonials returns 403 on non-Business plan", async ({ request }) => {
    await setProjectPlan("free");

    const sb = supabaseAdmin();
    const { data: auth } = await sb.auth.signInWithPassword({
      email: process.env.TEST_USER_EMAIL || "e2e-test@laudica.com",
      password: process.env.TEST_USER_PASSWORD || "TestPass123!",
    });

    const projectId = await getTestProjectId();

    const response = await request.get(`/api/v1/testimonials?projectId=${projectId}`, {
      headers: {
        Authorization: `Bearer ${auth?.session?.access_token}`,
      },
    });

    expect(response.status()).toBe(403);
  });

  test("GET /api/export returns file on Business plan", async ({ request }) => {
    await setProjectPlan("business");

    const sb = supabaseAdmin();
    const { data: auth } = await sb.auth.signInWithPassword({
      email: process.env.TEST_USER_EMAIL || "e2e-test@laudica.com",
      password: process.env.TEST_USER_PASSWORD || "TestPass123!",
    });

    const projectId = await getTestProjectId();

    const response = await request.get(`/api/export?projectId=${projectId}&format=csv`, {
      headers: {
        Authorization: `Bearer ${auth?.session?.access_token}`,
      },
    });

    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"];
    // When there are testimonials it returns text/csv; with 0 testimonials it returns text/plain
    expect(contentType).toMatch(/text\/(csv|plain)/);

    await setProjectPlan("free");
  });
});
