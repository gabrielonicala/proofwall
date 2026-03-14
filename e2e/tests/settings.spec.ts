import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/settings");
  });

  test("update project name", async ({ page }) => {
    const nameInput = page.getByPlaceholder("My Project").or(page.getByLabel(/Project Name/i));
    await nameInput.clear();
    await nameInput.fill("E2E Updated Project");
    await page.getByRole("button", { name: /Save Changes/i }).click();

    await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5_000 });

    // Restore
    await nameInput.clear();
    await nameInput.fill("E2E Test Project");
    await page.getByRole("button", { name: /Save Changes/i }).click();
  });

  test("update project website URL", async ({ page }) => {
    const urlInput = page.getByPlaceholder("https://example.com").or(page.getByLabel(/Website URL/i));
    await urlInput.clear();
    await urlInput.fill("https://e2e-test.laudica.com");
    await page.getByRole("button", { name: /Save Changes/i }).click();

    await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5_000 });
  });

  test("team members list shows current user as owner", async ({ page }) => {
    await expect(page.getByText("Team Members")).toBeVisible();
    await expect(page.getByText("Owner")).toBeVisible();
    await expect(page.getByText(process.env.TEST_USER_NAME || "E2E Test User")).toBeVisible();
  });

  test("invite team member with email and role", async ({ page }) => {
    await expect(page.getByText(/Invite New Member/i)).toBeVisible();
    const emailInput = page.getByPlaceholder("colleague@example.com");
    await emailInput.fill("e2e-invite-test@example.com");

    // Select role (dropdown defaults to "Member")
    const roleSelect = page.locator("select").filter({ hasText: /Member|Admin/i });
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption({ label: "Admin" });
    }

    // Click invite button
    await page.locator("button").filter({ has: page.locator("svg") }).filter({ hasText: /invite/i })
      .or(page.getByRole("button", { name: /invite/i }))
      .first().click();

    // Should show success or error (success if email not already a member)
    await page.waitForTimeout(2_000);
  });

  test("delete project shows confirmation with name typing", async ({ page }) => {
    // Scroll to danger zone
    await page.getByText("Danger Zone").scrollIntoViewIfNeeded();

    await page.getByRole("button", { name: /Delete Project/i }).click();

    // Confirmation dialog should appear
    await expect(page.getByText(/This action cannot be undone/i)).toBeVisible({ timeout: 5_000 });

    // The delete button should be disabled until name is typed
    const confirmDeleteBtn = page.getByRole("button", { name: /Delete Project Permanently/i });
    await expect(confirmDeleteBtn).toBeDisabled();

    // Cancel
    await page.getByRole("button", { name: /Cancel/i }).click();
  });
});
