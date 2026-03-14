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

  const { error: createError } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: TEST_NAME },
  });

  if (createError && !createError.message.includes("already been registered")) {
    throw new Error(`Failed to create test user: ${createError.message}`);
  }

  const baseURL = config.projects[0].use.baseURL || "http://localhost:3000";
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("**/dashboard**", { timeout: 15_000 });

  await page.context().storageState({ path: "e2e/auth.setup.json" });
  await browser.close();
}
