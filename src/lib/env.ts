/** Validate required environment variables at startup */

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(
      `Missing required environment variable: ${varName}. ` +
        `Please set it in your .env.local file.`
    );
  }
}

export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;
