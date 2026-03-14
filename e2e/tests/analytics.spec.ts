import { test, expect } from "@playwright/test";
import { supabaseAdmin, getTestProjectId } from "../helpers/test-utils";

test.describe("Analytics", () => {
  test("analytics page loads", async ({ page }) => {
    await page.goto("/dashboard/analytics");
    await expect(page.getByText("Analytics")).toBeVisible();
  });

  test("stats display with overview cards", async ({ page }) => {
    await page.goto("/dashboard/analytics");
    await expect(page.getByText("Total Testimonials")).toBeVisible();
    await expect(page.getByText("Total Wall Views")).toBeVisible();
  });

  test("view count increments after visiting embed", async ({ page }) => {
    // Get initial view count from database
    const sb = supabaseAdmin();
    const projectId = await getTestProjectId();
    const { count: initialCount } = await sb
      .from("wall_views")
      .select("*", { count: "exact", head: true })
      .eq("wall_id",
        (await sb.from("walls").select("id").eq("project_id", projectId).eq("is_active", true).limit(1).single()).data?.id || ""
      );

    const { data: wall } = await sb
      .from("walls")
      .select("id")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (!wall) { test.skip(); return; }

    // Visit embed to trigger a view
    await page.goto(`/embed/${wall.id}`);
    await page.waitForTimeout(3_000);

    // Check that a new view was recorded
    const { count: newCount } = await sb
      .from("wall_views")
      .select("*", { count: "exact", head: true })
      .eq("wall_id", wall.id);

    expect(newCount).toBeGreaterThan(initialCount || 0);
  });
});
