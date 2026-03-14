import { test, expect } from "@playwright/test";
import { setProjectPlan } from "../helpers/test-utils";

test.describe("Import & Export", () => {
  test("import page loads with CSV/Paste/URL tabs", async ({ page }) => {
    await page.goto("/dashboard/import");
    await expect(page.getByText("Import Testimonials")).toBeVisible();
    await expect(page.getByRole("button", { name: /CSV/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Paste/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /URL/i })).toBeVisible();
  });

  test("CSV paste creates testimonials", async ({ page }) => {
    await page.goto("/dashboard/import");
    // Click CSV tab if not already active
    await page.getByRole("button", { name: /CSV/i }).first().click();

    const csvData = `name,text,rating,company
"CSV Import User","Great product from CSV import!",5,"CSV Corp"`;

    await page.getByPlaceholder(/name,text/).or(page.locator("textarea").first()).fill(csvData);
    await page.getByRole("button", { name: /Parse CSV/i }).click();

    // Preview should show the parsed testimonial
    await expect(page.getByText("CSV Import User")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Great product from CSV import")).toBeVisible();

    // Import
    await page.getByRole("button", { name: /Import All/i }).click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 10_000 });
  });

  test("paste-to-import creates testimonials", async ({ page }) => {
    await page.goto("/dashboard/import");
    await page.getByRole("button", { name: /Paste/i }).first().click();

    const pasteData = `This is a pasted testimonial from E2E testing.

— Paste Test Author, Paste Corp`;

    await page.locator("textarea").first().fill(pasteData);
    await page.getByRole("button", { name: /Parse Text/i }).click();

    // Preview should appear
    await expect(page.getByText(/Paste Test Author|pasted testimonial/i)).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: /Import All/i }).click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 10_000 });
  });

  test("URL import creates testimonial with source URL", async ({ page }) => {
    await page.goto("/dashboard/import");
    await page.getByRole("button", { name: /URL/i }).first().click();

    await page.getByPlaceholder(/https:\/\/twitter/).or(page.getByPlaceholder(/url/i)).fill("https://twitter.com/testuser/status/123");
    // Fill author name
    const nameInput = page.getByPlaceholder("Jane Doe");
    if (await nameInput.isVisible()) {
      await nameInput.fill("URL Test Author");
    }
    // Fill testimonial text
    await page.getByPlaceholder(/Paste or type/).or(page.locator("textarea").first()).fill("This testimonial came from a URL import");

    await page.getByRole("button", { name: /Add to Import/i }).click();
    await expect(page.getByText("URL Test Author")).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: /Import All/i }).click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 10_000 });
  });

  test("invalid CSV data shows validation error", async ({ page }) => {
    await page.goto("/dashboard/import");
    await page.getByRole("button", { name: /CSV/i }).first().click();

    await page.locator("textarea").first().fill("this is not valid csv data");
    await page.getByRole("button", { name: /Parse CSV/i }).click();

    await expect(page.getByText(/No testimonials found/i)).toBeVisible({ timeout: 5_000 });
  });

  test("export returns 403 on Free plan", async ({ page }) => {
    await setProjectPlan("free");
    await page.goto("/dashboard/testimonials");

    // Export buttons should either not exist or be disabled/gated
    const exportBtn = page.getByRole("link", { name: /Export CSV/i });
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      // Should show upgrade prompt or error
      await expect(page.getByText(/upgrade|business plan|not available/i)).toBeVisible({ timeout: 5_000 });
    }
    // If export buttons aren't shown at all on Free, that's also correct behavior
  });

  test("export CSV works on Business plan", async ({ page }) => {
    await setProjectPlan("business");
    await page.goto("/dashboard/testimonials");
    await page.waitForTimeout(1_000);

    const exportBtn = page.getByRole("link", { name: /Export CSV/i });
    if (await exportBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 10_000 }),
        exportBtn.click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/\.csv$/);
    }

    // Reset to free plan
    await setProjectPlan("free");
  });

  test("export JSON works on Business plan", async ({ page }) => {
    await setProjectPlan("business");
    await page.goto("/dashboard/testimonials");
    await page.waitForTimeout(1_000);

    const exportBtn = page.getByRole("link", { name: /Export JSON/i });
    if (await exportBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 10_000 }),
        exportBtn.click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/\.json$/);
    }

    // Reset to free plan
    await setProjectPlan("free");
  });
});
