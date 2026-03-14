import { chromium, type FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "e2e-test@laudica.com";
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "TestPass123!";
const TEST_NAME = process.env.TEST_USER_NAME || "E2E Test User";

export default async function globalSetup(config: FullConfig) {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Create test user (or confirm it already exists)
  const { data: createdUser, error: createError } =
    await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: TEST_NAME },
    });

  if (createError && !createError.message.includes("already been registered")) {
    throw new Error(`Failed to create test user: ${createError.message}`);
  }

  // 2. Resolve the user ID (works whether user was just created or already existed)
  let userId = createdUser?.user?.id;
  if (!userId) {
    const { data: users } = await supabase.auth.admin.listUsers();
    userId = users?.users.find((u) => u.email === TEST_EMAIL)?.id;
  }
  if (!userId) throw new Error("Could not resolve test user ID");

  // 3. Ensure the test user has a project (the app creates one lazily on first
  //    dashboard visit, but global setup may close the browser before that
  //    async operation finishes — so we create it directly via admin)
  const { data: existingMembership } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  if (!existingMembership) {
    const { data: newProject } = await supabase
      .from("projects")
      .insert({ name: "My Project", created_by: userId })
      .select()
      .single();

    if (newProject) {
      await supabase.from("project_members").insert({
        project_id: newProject.id,
        user_id: userId,
        role: "owner",
      });

      // Seed default tags (matches the app's ProjectProvider behavior)
      const DEFAULT_TAGS = [
        { name: "Pricing", color: "#6C3FE8" },
        { name: "Trust", color: "#3B82F6" },
        { name: "Results", color: "#10B981" },
        { name: "Quality", color: "#F59E0B" },
        { name: "Speed", color: "#EF4444" },
        { name: "Features", color: "#8B5CF6" },
        { name: "Support", color: "#EC4899" },
        { name: "Onboarding", color: "#14B8A6" },
      ];
      await supabase.from("tags").insert(
        DEFAULT_TAGS.map((t) => ({
          project_id: newProject.id,
          name: t.name,
          color: t.color,
        }))
      );

      console.log(`Global setup: created project ${newProject.id} for test user`);
    }
  }

  // Resolve the project ID for seeding
  const { data: membership } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .limit(1)
    .single();

  if (membership) {
    const projectId = membership.project_id;

    // 3b. Seed a testimonial if none exists (needed for embed tests)
    const { data: existingTestimonial } = await supabase
      .from("testimonials")
      .select("id")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();

    if (!existingTestimonial) {
      await supabase.from("testimonials").insert({
        project_id: projectId,
        author_name: "Seed Testimonial",
        text: "This testimonial was seeded by global setup for E2E tests.",
        rating: 5,
        status: "approved",
        source: "manual",
      });
      console.log("Global setup: seeded default testimonial");
    }

    // 3c. Seed a wall if none exists (needed for embed & security tests)
    const { data: existingWall } = await supabase
      .from("walls")
      .select("id")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!existingWall) {
      await supabase.from("walls").insert({
        project_id: projectId,
        name: "E2E Seed Wall",
        style: "cards-grid",
        is_active: true,
      });
      console.log("Global setup: seeded default wall");
    }

    // NOTE: We do NOT seed a form here because the free plan only allows 1 form,
    // and forms.spec.ts creates its own "E2E Test Form". Embed/security tests that
    // need a form query for existing ones or create temporary ones via admin.
  }

  // 4. Log in via browser and save auth state
  const baseURL = config.projects[0].use.baseURL || "http://localhost:3000";
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("**/dashboard**", { timeout: 15_000 });

  // Wait for the dashboard to fully render (project loaded)
  await page.waitForTimeout(3_000);

  await page.context().storageState({ path: "e2e/auth.setup.json" });
  await browser.close();
}
