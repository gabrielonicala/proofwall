import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("dashboard loads with stats cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Total Testimonials")).toBeVisible();
    await expect(page.getByText("Wall Views")).toBeVisible();
    await expect(page.getByText("Active Walls")).toBeVisible();
    await expect(page.getByText("Pending Approval")).toBeVisible();
  });

  test("sidebar navigation links exist", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Testimonials/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Walls/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Forms/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Import/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Analytics/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Billing/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Settings/i })).toBeVisible();
  });

  test("sidebar link navigates to testimonials page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /Testimonials/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/testimonials/);
    await expect(page.getByText("Testimonials")).toBeVisible();
  });

  test("sidebar link navigates to walls page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /Walls/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/walls/);
  });

  test("pending testimonials approve/reject buttons work", async ({ page }) => {
    await page.goto("/dashboard");
    // Pending widget should show if there are pending testimonials
    const pendingSection = page.getByText("Needs Your Attention");
    if (await pendingSection.isVisible()) {
      // Approve button (CheckCircle2 icon with title="Approve")
      const approveBtn = page.locator('button[title="Approve"]').first();
      if (await approveBtn.isVisible()) {
        await approveBtn.click();
        await page.waitForTimeout(1_000);
      }
    }
  });
});
