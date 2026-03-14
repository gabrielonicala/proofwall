import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "e2e-test@laudica.com";

export default async function globalTeardown() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users?.users.find((u) => u.email === TEST_EMAIL);
  if (!testUser) return;

  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", testUser.id)
    .eq("role", "owner");

  if (memberships && memberships.length > 0) {
    const projectIds = memberships.map((m) => m.project_id);

    await supabase.from("wall_views").delete().in("wall_id",
      (await supabase.from("walls").select("id").in("project_id", projectIds)).data?.map((w) => w.id) || []
    );
    await supabase.from("walls").delete().in("project_id", projectIds);
    await supabase.from("collection_forms").delete().in("project_id", projectIds);
    await supabase.from("testimonial_tags").delete().in("testimonial_id",
      (await supabase.from("testimonials").select("id").in("project_id", projectIds)).data?.map((t) => t.id) || []
    );
    await supabase.from("testimonials").delete().in("project_id", projectIds);
    await supabase.from("tags").delete().in("project_id", projectIds);
  }

  const signupUsers = users?.users.filter((u) =>
    u.email?.startsWith("e2e-signup-")
  );
  for (const user of signupUsers || []) {
    await supabase.auth.admin.deleteUser(user.id);
  }
}
