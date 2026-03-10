"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

interface ActionResult {
  success?: boolean;
  error?: string;
}

function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}

export async function inviteMemberByEmail(
  projectId: string,
  email: string,
  role: "admin" | "member"
): Promise<ActionResult> {
  const supabase = await createClient();

  // Verify the current user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify the current user is owner or admin of this project
  const { data: currentMember } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (
    !currentMember ||
    (currentMember.role !== "owner" && currentMember.role !== "admin")
  ) {
    return { error: "You don't have permission to invite members" };
  }

  // Use admin client to look up user by email
  const adminClient = createAdminClient();

  if (!adminClient) {
    return {
      error:
        "Server configuration error. Please ensure SUPABASE_SERVICE_ROLE_KEY is set.",
    };
  }

  const {
    data: { users },
    error: listError,
  } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (listError) {
    return { error: "Failed to search for user" };
  }

  const targetUser = users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!targetUser) {
    return { error: "No user found with that email" };
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", targetUser.id)
    .maybeSingle();

  if (existingMember) {
    return { error: "This user is already a member of the project" };
  }

  // Insert the new member
  const { error: insertError } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: targetUser.id,
      role,
    });

  if (insertError) {
    return { error: "Failed to add member. Please try again." };
  }

  return { success: true };
}

export async function deleteProject(
  projectId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify user is the owner
  const { data: member } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!member || member.role !== "owner") {
    return { error: "Only the project owner can delete the project" };
  }

  // Delete related data in dependency order

  // 1. Get wall IDs for this project, then delete wall_views
  const { data: walls } = await supabase
    .from("walls")
    .select("id")
    .eq("project_id", projectId);

  if (walls && walls.length > 0) {
    const wallIds = walls.map((w) => w.id);
    await supabase.from("wall_views").delete().in("wall_id", wallIds);
  }

  // 2. Delete walls
  await supabase.from("walls").delete().eq("project_id", projectId);

  // 3. Get testimonial IDs for this project, then delete testimonial_tags
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id")
    .eq("project_id", projectId);

  if (testimonials && testimonials.length > 0) {
    const testimonialIds = testimonials.map((t) => t.id);
    await supabase
      .from("testimonial_tags")
      .delete()
      .in("testimonial_id", testimonialIds);
  }

  // 4. Delete testimonials
  await supabase
    .from("testimonials")
    .delete()
    .eq("project_id", projectId);

  // 5. Delete collection forms
  await supabase
    .from("collection_forms")
    .delete()
    .eq("project_id", projectId);

  // 6. Delete tags
  await supabase.from("tags").delete().eq("project_id", projectId);

  // 7. Delete project members
  await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId);

  // 8. Delete the project itself
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return { error: "Failed to delete project. Please try again." };
  }

  return { success: true };
}
