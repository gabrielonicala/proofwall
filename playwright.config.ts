import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 2,
  reporter: "html",
  timeout: 30_000,

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/auth.setup.json",
      },
      testMatch: [
        "dashboard.spec.ts",
        "testimonials.spec.ts",
        "import-export.spec.ts",
        "walls.spec.ts",
        "forms.spec.ts",
        "billing.spec.ts",
        "settings.spec.ts",
        "analytics.spec.ts",
        "embed.spec.ts",
        "api.spec.ts",
      ],
    },
    {
      name: "no-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [
        "public-pages.spec.ts",
        "auth.spec.ts",
        "security.spec.ts",
      ],
    },
  ],

  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
