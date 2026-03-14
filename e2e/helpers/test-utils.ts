import { type Page, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// --- Supabase Admin Client ---

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// --- Testimonial Helpers ---

export interface TestimonialFields {
  name: string;
  text: string;
  rating?: number;
  title?: string;
  company?: string;
  photoUrl?: string;
}

export async function createTestimonial(page: Page, fields: TestimonialFields) {
  await page.getByRole("button", { name: "Add Testimonial" }).click();
  await page.getByRole("heading", { name: "Add Testimonial" }).waitFor();

  if (fields.rating) {
    const starContainer = page.locator('[role="dialog"] .flex.gap-1, [role="dialog"] .flex.gap-0\\.5').first();
    await starContainer.locator("button").nth(fields.rating - 1).click();
  }

  await page.getByPlaceholder("What did they say?").fill(fields.text);
  await page.getByPlaceholder("Jane Doe").fill(fields.name);

  if (fields.title) {
    await page.getByPlaceholder("CEO").fill(fields.title);
  }
  if (fields.company) {
    await page.getByPlaceholder("Acme Inc").fill(fields.company);
  }
  if (fields.photoUrl) {
    await page.getByPlaceholder("https://...").fill(fields.photoUrl);
  }

  await page.getByRole("button", { name: "Add Testimonial" }).last().click();
}

export async function deleteTestimonial(page: Page, name: string) {
  const card = page.locator(`text=${name}`).first().locator("..").locator("..");
  await card.getByRole("button").filter({ hasText: /delete|trash/i }).click();
  await page.getByRole("button", { name: /delete|confirm/i }).click();
}

// --- Wall Helpers ---

export async function createWall(page: Page, name: string, style?: string) {
  await page.goto("/dashboard/walls/new");
  await page.getByPlaceholder("Wall name...").fill(name);
  if (style) {
    await page.getByRole("button", { name: style }).click();
  }
  await page.getByRole("button", { name: "Create Wall" }).click();
  await page.waitForURL("**/dashboard/walls/**");
}

export async function deleteWall(page: Page, name: string) {
  await page.goto("/dashboard/walls");
  const card = page.locator(`text=${name}`).first().locator("..").locator("..");
  await card.hover();
  await card.locator('[aria-label="More options"], button:has(svg)').last().click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
}

// --- Form Helpers ---

export async function createForm(page: Page, name: string) {
  await page.goto("/dashboard/forms/new");
  await page.getByPlaceholder("Form name...").fill(name);
  await page.getByRole("button", { name: "Create Form" }).click();
  await page.waitForURL("**/dashboard/forms/**");
}

export async function deleteForm(page: Page, name: string) {
  await page.goto("/dashboard/forms");
  const card = page.locator(`text=${name}`).first().locator("..").locator("..");
  await card.locator('[aria-label="More options"], button:has(svg)').last().click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("button", { name: /delete|confirm/i }).click();
}

// --- Assertion Helpers ---

export async function expectToastMessage(page: Page, text: string | RegExp) {
  const toast = page.locator('[role="status"], [data-sonner-toast], .toast').filter({ hasText: text });
  await expect(toast.first()).toBeVisible({ timeout: 5_000 });
}

// --- Auth Helpers ---

export async function getTestUserId(): Promise<string> {
  const sb = supabaseAdmin();
  const { data } = await sb.auth.admin.listUsers();
  const user = data?.users.find(
    (u) => u.email === (process.env.TEST_USER_EMAIL || "e2e-test@laudica.com")
  );
  if (!user) throw new Error("Test user not found");
  return user.id;
}

export async function getTestProjectId(): Promise<string> {
  const sb = supabaseAdmin();
  const userId = await getTestUserId();
  const { data } = await sb
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .single();
  if (!data) throw new Error("Test project not found");
  return data.project_id;
}

// --- Plan Elevation ---

export async function setProjectPlan(plan: "free" | "pro" | "business") {
  const sb = supabaseAdmin();
  const projectId = await getTestProjectId();
  await sb.from("projects").update({ plan }).eq("id", projectId);
}
