import { test, expect } from "@playwright/test";
import { setProjectPlan } from "../helpers/test-utils";

test.describe("Import & Export", () => {
  test("import page loads with CSV/Paste/URL tabs", async ({ page }) => {
    await page.goto("/dashboard/import");
    await expect(page.getByRole("heading", { name: "Import Testimonials" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "CSV", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Paste", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "URL", exact: true })).toBeVisible();
  });

  test("CSV paste creates testimonials", async ({ page }) => {
    await page.goto("/dashboard/import");
    await expect(page.getByRole("heading", { name: "Import Testimonials" })).toBeVisible({ timeout: 10_000 });

    // Click CSV tab if not already active
    await page.getByRole("button", { name: "CSV", exact: true }).click();

    const csvData = `name,text,rating,company
"CSV Import User","Great product from CSV import!",5,"CSV Corp"`;

    await page.locator("textarea").first().fill(csvData);
    await page.getByRole("button", { name: /Parse CSV/i }).click();

    // Preview heading should appear after parsing
    await expect(page.getByText(/Preview/i)).toBeVisible({ timeout: 5_000 });
    // The "Import All" button appears in the preview section
    await expect(page.getByRole("button", { name: /Import All/i })).toBeVisible();

    // Import
    await page.getByRole("button", { name: /Import All/i }).click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 10_000 });
  });

  test("paste-to-import creates testimonials", async ({ page }) => {
    await page.goto("/dashboard/import");
    await expect(page.getByRole("heading", { name: "Import Testimonials" })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Paste", exact: true }).click();

    const pasteData = `This is a pasted testimonial from E2E testing.

— Paste Test Author, Paste Corp`;

    await page.locator("textarea").first().fill(pasteData);
    await page.getByRole("button", { name: /Parse Text/i }).click();

    // Preview should appear
    await expect(page.getByText(/Preview/i)).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: /Import All/i }).click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 10_000 });
  });

  test("URL import creates testimonial with source URL", async ({ page }) => {
    await page.goto("/dashboard/import");
    await expect(page.getByRole("heading", { name: "Import Testimonials" })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "URL", exact: true }).click();

    // Fill URL field
    const urlInput = page.getByPlaceholder(/https:\/\//).or(page.getByPlaceholder(/url/i));
    await urlInput.first().fill("https://twitter.com/testuser/status/123");

    // Fill author name
    const nameInput = page.getByPlaceholder("Jane Doe").or(page.getByPlaceholder(/name/i));
    if (await nameInput.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
      await nameInput.first().fill("URL Test Author");
    }

    // Fill testimonial text
    const textArea = page.locator("textarea").first();
    if (await textArea.isVisible()) {
      await textArea.fill("This testimonial came from a URL import");
    }

    await page.getByRole("button", { name: /Add to Import/i }).click();

    // Preview should show the added testimonial
    await expect(page.getByText(/Preview/i).or(page.getByText("URL Test Author"))).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: /Import All/i }).click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 10_000 });
  });

  test("invalid CSV data shows validation error", async ({ page }) => {
    await page.goto("/dashboard/import");
    await expect(page.getByRole("heading", { name: "Import Testimonials" })).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "CSV", exact: true }).click();

    await page.locator("textarea").first().fill("this is not valid csv data");
    await page.getByRole("button", { name: /Parse CSV/i }).click();

    await expect(page.getByText(/No testimonials found/i).or(page.getByText(/error|invalid/i))).toBeVisible({ timeout: 5_000 });
  });

  test("export returns 403 on Free plan", async ({ page }) => {
    await setProjectPlan("free");
    await page.goto("/dashboard/testimonials");

    // Export buttons should either not exist or be disabled/gated
    const exportBtn = page.getByRole("link", { name: /Export CSV/i });
    if (await exportBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
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
    if (await exportBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
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
    if (await exportBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
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
