import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/settings");
    // Wait for team members section to load (it's fetched async)
    await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test("update project name", async ({ page }) => {
    const nameInput = page.getByRole("textbox", { name: /Project Name/i }).or(page.getByPlaceholder("My Project"));
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
    const urlInput = page.getByRole("textbox", { name: /Website URL/i }).or(page.getByPlaceholder("https://example.com"));
    await urlInput.clear();
    await urlInput.fill("https://e2e-test.laudica.com");
    await page.getByRole("button", { name: /Save Changes/i }).click();

    await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5_000 });
  });

  test("team members list shows current user as owner", async ({ page }) => {
    // Wait for the Team Members section to fully render
    await expect(page.getByRole("heading", { name: "Team Members" })).toBeVisible({ timeout: 10_000 });

    // The ARIA tree shows: generic "E2E Test User", paragraph "e2e-test@laudica.com", text "Owner"
    await expect(page.getByText("Owner")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("E2E Test User")).toBeVisible({ timeout: 5_000 });
  });

  test("invite team member with email and role", async ({ page }) => {
    await expect(page.getByText(/Invite New Member/i)).toBeVisible({ timeout: 5_000 });
    const emailInput = page.getByPlaceholder("colleague@example.com");
    await emailInput.fill("e2e-invite-test@example.com");

    // Select role (dropdown defaults to "Member")
    const roleSelect = page.getByRole("combobox").or(page.locator("select").filter({ hasText: /Member|Admin/i }));
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption({ label: "Admin" });
    }

    // Click invite button
    await page.getByRole("button", { name: /Invite/i }).click();

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
    if (await confirmDeleteBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await expect(confirmDeleteBtn).toBeDisabled();
    }

    // Cancel
    await page.getByRole("button", { name: /Cancel/i }).click();
  });
});
