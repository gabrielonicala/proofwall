import { test, expect } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL || "e2e-test@laudica.com";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "TestPass123!";

test.describe("Authentication", () => {
  test("signup form shows check-your-email on success", async ({ page }) => {
    await page.goto("/signup");
    const uniqueEmail = `e2e-signup-${Date.now()}@laudica.com`;

    await page.getByPlaceholder("Jane Doe").fill("Test Signup User");
    await page.getByPlaceholder("you@example.com").fill(uniqueEmail);
    await page.getByPlaceholder("At least 6 characters").fill("TestPass123!");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByText("Check your email").or(page.getByText(/rate limit|already been registered/i))
    ).toBeVisible({ timeout: 10_000 });
  });

  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL("**/dashboard**", { timeout: 15_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill("nonexistent@example.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Error message should appear
    await expect(page.locator("text=/invalid|error|incorrect/i")).toBeVisible({ timeout: 10_000 });
  });

  test("forgot password flow shows confirmation", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(
      page.getByText("Check your email").or(page.getByText(/rate limit/i))
    ).toBeVisible({ timeout: 10_000 });
  });

  test("logged-in user is redirected away from /login", async ({ page, context }) => {
    // First log in
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });

    // Now try to visit /login
    await page.goto("/login");
    await page.waitForURL("**/dashboard**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("logged-in user is redirected away from /signup", async ({ page }) => {
    // First log in
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });

    // Now try to visit /signup
    await page.goto("/signup");
    await page.waitForURL("**/dashboard**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("logout returns to landing page", async ({ page }) => {
    // First log in
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });

    // Click sign out in sidebar — app redirects to /login after sign out
    await page.getByRole("button", { name: /sign out|log out/i }).click();
    await page.waitForURL("**/login**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated access to /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("Google OAuth button visible on login page", async ({ page }) => {
    await page.goto("/login");
    const googleButton = page.getByRole("button", { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible();
  });

  test("Google OAuth button visible on signup page", async ({ page }) => {
    await page.goto("/signup");
    const googleButton = page.getByRole("button", { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible();
  });

  test("/auth/callback without code redirects to login with error", async ({ page }) => {
    await page.goto("/auth/callback");
    await page.waitForURL("**/login**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login.*error/);
  });

  test("/auth/callback with invalid code redirects to login with error", async ({ page }) => {
    await page.goto("/auth/callback?code=invalid_code_123");
    await page.waitForURL("**/login**", { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login.*error/);
  });
});
