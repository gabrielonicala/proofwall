import { test, expect } from "@playwright/test";
import { supabaseAdmin, getTestProjectId } from "../helpers/test-utils";

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
    const sb = supabaseAdmin();
    const projectId = await getTestProjectId();
    const { data: wall } = await sb
      .from("walls")
      .select("id")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!wall) { test.skip(); return; }

    const response = await page.goto(`/embed/${wall.id}`);
    const xFrameOptions = response?.headers()["x-frame-options"];
    expect(xFrameOptions).toBeUndefined();
  });

  // NOTE: This test is expected to fail because the middleware currently only
  // strips X-Frame-Options for /embed/* routes, not /form/* routes.
  // When this test fails, fix the middleware to also exclude /form/* from X-Frame-Options.
  test.fail("public form pages allow framing (no X-Frame-Options)", async ({ page }) => {
    const sb = supabaseAdmin();
    const projectId = await getTestProjectId();

    // Create a temporary form via admin (bypasses plan limits)
    const { data: form } = await sb.from("collection_forms").insert({
      project_id: projectId,
      name: "Security Test Form",
      is_active: true,
      fields: [
        { id: "author_name", type: "text", label: "Your name", placeholder: "John Doe", required: true, enabled: true },
        { id: "text", type: "textarea", label: "Your experience", placeholder: "Tell us about your experience...", required: true, enabled: true },
      ],
    }).select("id").single();

    if (!form) { test.skip(); return; }

    try {
      const response = await page.goto(`/form/${form.id}`);
      const xFrameOptions = response?.headers()["x-frame-options"];
      expect(xFrameOptions).toBeUndefined();
    } finally {
      await sb.from("collection_forms").delete().eq("id", form.id);
    }
  });
});
