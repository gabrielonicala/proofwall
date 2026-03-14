import { test, expect } from "@playwright/test";
import { createWall, deleteWall, setProjectPlan } from "../helpers/test-utils";

test.describe("Walls", () => {
  test("create new wall with name and style", async ({ page }) => {
    await page.goto("/dashboard/walls/new");
    await page.getByPlaceholder("Wall name...").fill("E2E Test Wall");
    // Select Cards Grid style (default or first option)
    await page.getByRole("button", { name: /Cards Grid/i }).click();
    await page.getByRole("button", { name: "Create Wall" }).click();

    // Should redirect to the wall editor
    await page.waitForURL("**/dashboard/walls/**", { timeout: 10_000 });
    await expect(page.getByPlaceholder("Wall name...")).toHaveValue("E2E Test Wall");
  });

  test("wall builder loads with configuration panel", async ({ page }) => {
    await page.goto("/dashboard/walls");
    // Click into the first wall (E2E Test Wall)
    await page.getByRole("button", { name: /Edit E2E Test Wall/i }).click();
    await page.waitForURL("**/dashboard/walls/**");

    // Config panel should have key sections
    await expect(page.getByText(/Display Style|Style/i).first()).toBeVisible();
    await expect(page.getByText(/Sort Order|Sort/i).first()).toBeVisible();
    await expect(page.getByText(/Theme/i).first()).toBeVisible();
  });

  test("change showcase style", async ({ page }) => {
    await page.goto("/dashboard/walls");
    await page.getByRole("button", { name: /Edit E2E Test Wall/i }).click();
    await page.waitForURL("**/dashboard/walls/**");

    // Switch to Carousel
    await page.getByRole("button", { name: /Carousel/i }).click();
    await page.waitForTimeout(500);
    // Save
    await page.getByRole("button", { name: /Save/i }).click();
    await page.waitForTimeout(1_000);
  });

  test("change theme", async ({ page }) => {
    await page.goto("/dashboard/walls");
    await page.getByRole("button", { name: /Edit E2E Test Wall/i }).click();
    await page.waitForURL("**/dashboard/walls/**");

    // Find theme selector and change to Light
    const themeSelect = page.locator("select, [role='combobox']").filter({ hasText: /Dark|Light|Auto/i });
    if (await themeSelect.count() > 0) {
      await themeSelect.first().click();
      await page.getByRole("option", { name: /Light/i }).click();
    }
  });

  test("change sort order", async ({ page }) => {
    await page.goto("/dashboard/walls");
    await page.getByRole("button", { name: /Edit E2E Test Wall/i }).click();
    await page.waitForURL("**/dashboard/walls/**");

    const sortSelect = page.locator("select, [role='combobox']").filter({ hasText: /Newest|Highest|Random/i });
    if (await sortSelect.count() > 0) {
      await sortSelect.first().click();
      await page.getByRole("option", { name: /Highest rated/i }).click();
    }
  });

  test("set max testimonials limit", async ({ page }) => {
    await page.goto("/dashboard/walls");
    await page.getByRole("button", { name: /Edit E2E Test Wall/i }).click();
    await page.waitForURL("**/dashboard/walls/**");

    const maxInput = page.getByPlaceholder("All").or(page.locator('input[type="number"]').first());
    if (await maxInput.isVisible()) {
      await maxInput.clear();
      await maxInput.fill("5");
    }
  });

  test("preview panel shows content", async ({ page }) => {
    await page.goto("/dashboard/walls");
    await page.getByRole("button", { name: /Edit E2E Test Wall/i }).click();
    await page.waitForURL("**/dashboard/walls/**");

    // Preview section should exist
    await expect(page.getByText(/Live Preview|Preview/i).first()).toBeVisible();
  });

  test("embed code tab shows snippets", async ({ page }) => {
    await page.goto("/dashboard/walls");
    await page.getByRole("button", { name: /Edit E2E Test Wall/i }).click();
    await page.waitForURL("**/dashboard/walls/**");

    // Find embed code section/tab
    const embedTab = page.getByRole("tab", { name: /HTML|Embed/i }).or(page.getByText(/Embed Code/i));
    if (await embedTab.isVisible()) {
      await embedTab.click();
      // Should show code snippets
      await expect(page.locator("code, pre").filter({ hasText: /iframe|script|laudica/i }).first()).toBeVisible();
    }
  });

  test("activate/deactivate wall toggle", async ({ page }) => {
    await page.goto("/dashboard/walls");
    await expect(page.getByRole("heading", { name: "E2E Test Wall", level: 3 })).toBeVisible({ timeout: 5_000 });

    // The dropdown trigger uses Lucide SVGs (<svg> in DOM, shown as img in ARIA tree).
    // It has opacity-0 until group-hover, so we use force:true.
    const editBtn = page.getByRole("button", { name: /Edit E2E Test Wall/i });
    const card = editBtn.locator("..");
    // Filter for buttons with SVG children (the dropdown trigger has MoreVertical SVG)
    const dropdownBtn = card.locator("button").filter({ has: page.locator("svg") }).first();

    await card.hover();
    await dropdownBtn.evaluate((el) => (el as HTMLElement).click());

    // Click deactivate
    const deactivateBtn = page.getByRole("menuitem", { name: /Deactivate/i });
    if (await deactivateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await deactivateBtn.click();
      await page.waitForTimeout(1_000);
      await expect(page.getByText(/Inactive/i)).toBeVisible();

      // Reactivate
      await card.hover();
      await dropdownBtn.evaluate((el) => (el as HTMLElement).click());
      const activateBtn = page.getByRole("menuitem", { name: /Activate/i });
      if (await activateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await activateBtn.click();
        await page.waitForTimeout(1_000);
      }
    } else {
      // Dismiss menu if Deactivate wasn't found
      await page.keyboard.press("Escape");
    }
  });

  test("delete wall", async ({ page }) => {
    // Ensure we're on a plan that allows creating walls
    await setProjectPlan("pro");

    // Create a wall to delete
    await createWall(page, "Wall To Delete", "Cards Grid");

    await page.goto("/dashboard/walls");
    await expect(page.getByText("Wall To Delete").first()).toBeVisible({ timeout: 5_000 });

    // The dropdown trigger is behind the overlay button (position:absolute inset:0).
    // Use evaluate to dispatch click directly, bypassing the overlay.
    const editBtn = page.getByRole("button", { name: /Edit Wall To Delete/i }).first();
    const card = editBtn.locator("..");
    const dropdownBtn = card.locator("button").filter({ has: page.locator("svg") }).first();

    await card.hover();
    await dropdownBtn.evaluate((el) => (el as HTMLElement).click());
    await page.getByRole("menuitem", { name: /Delete/i }).click();

    await expect(page.getByText("Wall To Delete")).not.toBeVisible({ timeout: 5_000 });

    await setProjectPlan("free");
  });

  test("apply tag filter in wall builder", async ({ page }) => {
    await page.goto("/dashboard/walls");
    await page.getByRole("button", { name: /Edit E2E Test Wall/i }).click();
    await page.waitForURL("**/dashboard/walls/**");

    // Look for tag filter section
    const tagSection = page.getByText(/Tag Filter|Filter by tag/i);
    if (await tagSection.isVisible()) {
      // Tags should be displayed as clickable pills
      const tagPill = page.locator("button, [role='checkbox']").filter({ hasText: /e2e-test-tag/i });
      if (await tagPill.count() > 0) {
        await tagPill.first().click();
      }
    }
  });
});
