import { test, expect } from "@playwright/test";
import { createForm, supabaseAdmin, getTestProjectId } from "../helpers/test-utils";

test.describe("Collection Forms", () => {
  test("create new collection form", async ({ page }) => {
    await page.goto("/dashboard/forms/new");
    await page.getByPlaceholder("Form name...").fill("E2E Test Form");
    await page.getByRole("button", { name: "Create Form" }).click();

    await page.waitForURL("**/dashboard/forms/**", { timeout: 10_000 });
  });

  test("configure form fields", async ({ page }) => {
    await page.goto("/dashboard/forms");
    await page.getByRole("button", { name: /Edit E2E Test Form/i }).click();
    await page.waitForURL("**/dashboard/forms/**");

    // Toggle a field's required status
    const requiredCheckbox = page.locator("input[type='checkbox']").filter({ hasText: /required/i }).or(
      page.getByLabel(/Required/i)
    );
    if (await requiredCheckbox.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await requiredCheckbox.first().click();
    }

    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1_000);
  });

  test("set welcome and thank-you messages", async ({ page }) => {
    await page.goto("/dashboard/forms");
    await page.getByRole("button", { name: /Edit E2E Test Form/i }).click();
    await page.waitForURL("**/dashboard/forms/**");

    // Set welcome message
    const welcomeInput = page.getByPlaceholder("We'd love to hear from you!");
    if (await welcomeInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await welcomeInput.clear();
      await welcomeInput.fill("E2E Welcome Message");
    }

    // Set thank you message
    const thankYouInput = page.getByPlaceholder("Thank you for your feedback!");
    if (await thankYouInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await thankYouInput.clear();
      await thankYouInput.fill("E2E Thank You Message");
    }

    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1_000);
  });

  test("set accent color", async ({ page }) => {
    await page.goto("/dashboard/forms");
    await page.getByRole("button", { name: /Edit E2E Test Form/i }).click();
    await page.waitForURL("**/dashboard/forms/**");

    // Find color input
    const colorInput = page.locator('input[type="color"]').or(page.getByPlaceholder("#"));
    if (await colorInput.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await colorInput.first().fill("#FF5733");
    }

    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1_000);
  });

  test("public form page loads", async ({ page }) => {
    // Get form ID from database
    const sb = supabaseAdmin();
    const projectId = await getTestProjectId();
    const { data: form } = await sb
      .from("collection_forms")
      .select("id")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!form) {
      test.skip();
      return;
    }

    await page.goto(`/form/${form.id}`);
    // Form should render — check for form element or submit button
    await expect(
      page.getByRole("button", { name: /Submit|Send/i }).or(page.locator("form")).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("submit testimonial through public form", async ({ page }) => {
    const sb = supabaseAdmin();
    const projectId = await getTestProjectId();
    const { data: form } = await sb
      .from("collection_forms")
      .select("id")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!form) {
      test.skip();
      return;
    }

    await page.goto(`/form/${form.id}`);
    await expect(page.getByRole("button", { name: /Submit/i })).toBeVisible({ timeout: 10_000 });

    // Fill name (placeholder is "John Doe")
    await page.getByPlaceholder("John Doe").fill("Form Submitter");

    // Set rating (click 5th star)
    const starButtons = page.locator("form button[type='button']");
    if (await starButtons.count() >= 5) {
      await starButtons.nth(4).click();
    }

    // Fill experience textarea
    await page.locator("textarea").first().fill("Submitted via E2E public form test");

    await page.getByRole("button", { name: /Submit/i }).click();

    // Should show thank you message
    await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 10_000 });
  });

  test("submitted testimonial appears in dashboard as pending", async ({ page }) => {
    await page.goto("/dashboard/testimonials");

    // Search for the submitted testimonial
    await page.getByPlaceholder("Search testimonials...").fill("Form Submitter");
    await page.waitForTimeout(1_000);

    await expect(page.getByText("Form Submitter", { exact: true })).toBeVisible({ timeout: 5_000 });
  });

  test("deactivated form shows inactive message", async ({ page }) => {
    const sb = supabaseAdmin();
    const projectId = await getTestProjectId();
    const { data: form } = await sb
      .from("collection_forms")
      .select("id")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();

    if (!form) {
      test.skip();
      return;
    }

    // Deactivate form via admin
    await sb.from("collection_forms").update({ is_active: false }).eq("id", form.id);

    const response = await page.goto(`/form/${form.id}`);
    // Should show inactive/not found state — either 404 or the page shows an error message
    const status = response?.status() ?? 200;
    const hasErrorMessage = await page.getByText(/not found|inactive|unavailable|no longer/i).isVisible({ timeout: 3_000 }).catch(() => false);
    expect(status >= 400 || hasErrorMessage).toBeTruthy();

    // Reactivate
    await sb.from("collection_forms").update({ is_active: true }).eq("id", form.id);
  });
});
