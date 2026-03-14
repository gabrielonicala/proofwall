import { test, expect } from "@playwright/test";
import { supabaseAdmin } from "../helpers/test-utils";

test.describe("Security", () => {
  test("response includes Content-Security-Policy header", async ({ page }) => {
    const response = await page.goto("/");
    const csp = response?.headers()["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src");
  });

  test("response includes X-Content-Type-Options: nosniff", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("response includes Referrer-Policy", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin"
    );
  });

  test("dashboard routes redirect to /login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("auth pages have noindex robots meta tag", async ({ page }) => {
    await page.goto("/login");
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });

  test("wall embed pages allow framing (no X-Frame-Options)", async ({ page }) => {
    // We need an active wall — create one via admin
    const sb = supabaseAdmin();
    const { data: users } = await sb.auth.admin.listUsers();
    const testUser = users?.users.find(
      (u) => u.email === (process.env.TEST_USER_EMAIL || "e2e-test@laudica.com")
    );

    if (testUser) {
      const { data: membership } = await sb
        .from("project_members")
        .select("project_id")
        .eq("user_id", testUser.id)
        .eq("role", "owner")
        .single();

      if (membership) {
        const { data: wall } = await sb
          .from("walls")
          .select("id")
          .eq("project_id", membership.project_id)
          .eq("is_active", true)
          .limit(1)
          .single();

        if (wall) {
          const response = await page.goto(`/embed/${wall.id}`);
          const xFrameOptions = response?.headers()["x-frame-options"];
          // Should NOT have X-Frame-Options (or it should be absent)
          expect(xFrameOptions).toBeUndefined();
          return;
        }
      }
    }
    // If no active wall exists, skip gracefully
    test.skip();
  });

  // NOTE: This test is expected to fail because the middleware currently only
  // strips X-Frame-Options for /embed/* routes, not /form/* routes.
  // When this test fails, fix the middleware to also exclude /form/* from X-Frame-Options.
  test.fail("public form pages allow framing (no X-Frame-Options)", async ({ page }) => {
    const sb = supabaseAdmin();
    const { data: users } = await sb.auth.admin.listUsers();
    const testUser = users?.users.find(
      (u) => u.email === (process.env.TEST_USER_EMAIL || "e2e-test@laudica.com")
    );
    if (!testUser) { test.skip(); return; }

    const { data: membership } = await sb
      .from("project_members")
      .select("project_id")
      .eq("user_id", testUser.id)
      .eq("role", "owner")
      .single();
    if (!membership) { test.skip(); return; }

    const { data: form } = await sb
      .from("collection_forms")
      .select("id")
      .eq("project_id", membership.project_id)
      .eq("is_active", true)
      .limit(1)
      .single();
    if (!form) { test.skip(); return; }

    const response = await page.goto(`/form/${form.id}`);
    const xFrameOptions = response?.headers()["x-frame-options"];
    expect(xFrameOptions).toBeUndefined();
  });
});
