import { test, expect } from "@playwright/test";

const publicPages = [
  { path: "/", title: /Laudica/i },
  { path: "/docs", title: /Documentation/i },
  { path: "/integrations", title: /Integrations/i },
  { path: "/integrations/html", title: /HTML/i },
  { path: "/integrations/react", title: /React/i },
  { path: "/integrations/wordpress", title: /WordPress/i },
  { path: "/integrations/webflow", title: /Webflow/i },
  { path: "/privacy", title: /Privacy/i },
  { path: "/terms", title: /Terms/i },
];

test.describe("Public pages", () => {
  for (const { path, title } of publicPages) {
    test(`${path} loads without error`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
    });
  }

  test("navbar links navigate correctly", async ({ page }) => {
    await page.goto("/");
    // Check integrations nav link
    await page.getByRole("link", { name: "Integrations" }).click();
    await expect(page).toHaveURL(/\/integrations$/);
  });

  test("footer links navigate correctly", async ({ page }) => {
    await page.goto("/");
    // Check documentation footer link
    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "Documentation" }).click();
    await expect(page).toHaveURL(/\/docs$/);
  });

  test("SEO meta tags are present on landing page", async ({ page }) => {
    await page.goto("/");
    // Title
    await expect(page).toHaveTitle(/Laudica/);
    // Meta description
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.+/);
    // Canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("content", /.+/);
    // OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /.+/);
  });

  test("JSON-LD structured data renders on landing page", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThan(0);
    const content = await jsonLd.first().textContent();
    const parsed = JSON.parse(content!);
    // Should have Organization or WebSite schema
    expect(JSON.stringify(parsed)).toContain("schema.org");
  });
});
