"use server";

import { createClient } from "@/lib/supabase/server";
import { getPlanLimits, withinLimit } from "@/lib/plans";
import type { Database } from "@/lib/supabase/types";

type Plan = Database["public"]["Enums"]["plan"];

interface ActionResult {
  success?: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Authorization helper — verifies the user is a member of the project
// ---------------------------------------------------------------------------

async function authorizeProjectMember(
  projectId: string,
  requiredRoles?: ("owner" | "admin" | "member")[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", supabase, user: null, role: null };
  }

  const { data: member } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return {
      error: "You don't have access to this project",
      supabase,
      user,
      role: null,
    };
  }

  if (requiredRoles && !requiredRoles.includes(member.role as "owner" | "admin" | "member")) {
    return {
      error: "You don't have permission to perform this action",
      supabase,
      user,
      role: member.role,
    };
  }

  return { error: null, supabase, user, role: member.role };
}

/** Fetch the project's current plan and limits */
async function getProjectPlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string
) {
  const { data } = await supabase
    .from("projects")
    .select("plan")
    .eq("id", projectId)
    .single();

  const plan = (data?.plan ?? "free") as Plan;
  return { plan, limits: getPlanLimits(plan) };
}

// ---------------------------------------------------------------------------
// Input sanitization helpers
// ---------------------------------------------------------------------------

function sanitizeString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Testimonial actions
// ---------------------------------------------------------------------------

export async function updateTestimonialStatus(
  projectId: string,
  testimonialId: string,
  status: "pending" | "approved" | "featured" | "archived"
): Promise<ActionResult> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  const validStatuses = ["pending", "approved", "featured", "archived"];
  if (!validStatuses.includes(status)) {
    return { error: "Invalid status" };
  }

  // Verify testimonial belongs to this project
  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("id")
    .eq("id", testimonialId)
    .eq("project_id", projectId)
    .single();

  if (!testimonial) {
    return { error: "Testimonial not found" };
  }

  const { error: updateError } = await supabase
    .from("testimonials")
    .update({ status })
    .eq("id", testimonialId);

  if (updateError) return { error: "Failed to update status" };
  return { success: true };
}

export async function deleteTestimonial(
  projectId: string,
  testimonialId: string
): Promise<ActionResult> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  // Verify testimonial belongs to this project
  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("id")
    .eq("id", testimonialId)
    .eq("project_id", projectId)
    .single();

  if (!testimonial) {
    return { error: "Testimonial not found" };
  }

  await supabase.from("testimonial_tags").delete().eq("testimonial_id", testimonialId);
  const { error: deleteError } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", testimonialId);

  if (deleteError) return { error: "Failed to delete testimonial" };
  return { success: true };
}

export async function toggleTestimonialTag(
  projectId: string,
  testimonialId: string,
  tagId: string,
  action: "add" | "remove"
): Promise<ActionResult> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  // Verify testimonial and tag belong to this project
  const [{ data: testimonial }, { data: tag }] = await Promise.all([
    supabase
      .from("testimonials")
      .select("id")
      .eq("id", testimonialId)
      .eq("project_id", projectId)
      .single(),
    supabase
      .from("tags")
      .select("id")
      .eq("id", tagId)
      .eq("project_id", projectId)
      .single(),
  ]);

  if (!testimonial || !tag) {
    return { error: "Testimonial or tag not found" };
  }

  if (action === "remove") {
    await supabase
      .from("testimonial_tags")
      .delete()
      .eq("testimonial_id", testimonialId)
      .eq("tag_id", tagId);
  } else {
    await supabase
      .from("testimonial_tags")
      .insert({ testimonial_id: testimonialId, tag_id: tagId });
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Wall actions
// ---------------------------------------------------------------------------

export async function toggleWallActive(
  projectId: string,
  wallId: string,
  isActive: boolean
): Promise<ActionResult> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  // Verify wall belongs to this project
  const { data: wall } = await supabase
    .from("walls")
    .select("id")
    .eq("id", wallId)
    .eq("project_id", projectId)
    .single();

  if (!wall) return { error: "Wall not found" };

  const { error: updateError } = await supabase
    .from("walls")
    .update({ is_active: isActive })
    .eq("id", wallId);

  if (updateError) return { error: "Failed to update wall" };
  return { success: true };
}

export async function deleteWall(
  projectId: string,
  wallId: string
): Promise<ActionResult> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  // Verify wall belongs to this project
  const { data: wall } = await supabase
    .from("walls")
    .select("id")
    .eq("id", wallId)
    .eq("project_id", projectId)
    .single();

  if (!wall) return { error: "Wall not found" };

  await supabase.from("wall_views").delete().eq("wall_id", wallId);
  const { error: deleteError } = await supabase
    .from("walls")
    .delete()
    .eq("id", wallId);

  if (deleteError) return { error: "Failed to delete wall" };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Form actions
// ---------------------------------------------------------------------------

export async function toggleFormActive(
  projectId: string,
  formId: string,
  isActive: boolean
): Promise<ActionResult> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  const { data: form } = await supabase
    .from("collection_forms")
    .select("id")
    .eq("id", formId)
    .eq("project_id", projectId)
    .single();

  if (!form) return { error: "Form not found" };

  const { error: updateError } = await supabase
    .from("collection_forms")
    .update({ is_active: isActive })
    .eq("id", formId);

  if (updateError) return { error: "Failed to update form" };
  return { success: true };
}

export async function deleteForm(
  projectId: string,
  formId: string
): Promise<ActionResult> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  const { data: form } = await supabase
    .from("collection_forms")
    .select("id")
    .eq("id", formId)
    .eq("project_id", projectId)
    .single();

  if (!form) return { error: "Form not found" };

  const { error: deleteError } = await supabase
    .from("collection_forms")
    .delete()
    .eq("id", formId);

  if (deleteError) return { error: "Failed to delete form" };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Settings actions
// ---------------------------------------------------------------------------

export async function updateProjectSettings(
  projectId: string,
  data: { name: string; websiteUrl: string }
): Promise<ActionResult> {
  const { error, supabase } = await authorizeProjectMember(projectId, [
    "owner",
    "admin",
  ]);
  if (error) return { error };

  const name = sanitizeString(data.name, 100);
  if (!name) return { error: "Project name is required" };

  const websiteUrl = data.websiteUrl.trim();
  if (websiteUrl && !isValidUrl(websiteUrl)) {
    return { error: "Invalid website URL" };
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      name,
      website_url: websiteUrl || null,
    })
    .eq("id", projectId);

  if (updateError) return { error: "Failed to save settings" };
  return { success: true };
}

export async function removeMember(
  projectId: string,
  memberId: string
): Promise<ActionResult> {
  const { error, supabase } = await authorizeProjectMember(projectId, [
    "owner",
    "admin",
  ]);
  if (error) return { error };

  // Verify member belongs to this project and is not an owner
  const { data: member } = await supabase
    .from("project_members")
    .select("id, role")
    .eq("id", memberId)
    .eq("project_id", projectId)
    .single();

  if (!member) return { error: "Member not found" };
  if (member.role === "owner") return { error: "Cannot remove the project owner" };

  const { error: deleteError } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId);

  if (deleteError) return { error: "Failed to remove member" };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Import action (server-side with sanitization)
// ---------------------------------------------------------------------------

interface ImportRow {
  author_name: string;
  author_title: string;
  author_company: string;
  text: string;
  rating: number | null;
  source: string;
  source_url: string;
}

/** Sanitize a cell value to prevent CSV injection */
function sanitizeCellValue(value: string): string {
  // Strip leading characters that could trigger formula execution in spreadsheet apps
  let sanitized = value.replace(/^[=+\-@\t\r]+/, "");
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");
  return sanitized;
}

export async function importTestimonials(
  projectId: string,
  rows: ImportRow[]
): Promise<ActionResult & { count?: number }> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  // Check testimonial limit
  const { limits } = await getProjectPlan(supabase, projectId);
  if (limits.maxTestimonials !== -1) {
    const { count } = await supabase
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    const remaining = limits.maxTestimonials - (count ?? 0);
    if (remaining <= 0) {
      return {
        error: `You've reached the limit of ${limits.maxTestimonials} testimonials on the Free plan. Upgrade to Pro for unlimited testimonials.`,
      };
    }
    if (rows.length > remaining) {
      return {
        error: `You can only import ${remaining} more testimonial${remaining === 1 ? "" : "s"} on the Free plan. Upgrade to Pro for unlimited.`,
      };
    }
  }

  if (rows.length === 0) return { error: "No testimonials to import" };
  if (rows.length > 500) return { error: "Maximum 500 testimonials per import" };

  const sanitizedRows = rows.map((r) => ({
    project_id: projectId,
    author_name: sanitizeString(sanitizeCellValue(r.author_name || "Anonymous"), 200),
    author_title: r.author_title
      ? sanitizeString(sanitizeCellValue(r.author_title), 200)
      : null,
    author_company: r.author_company
      ? sanitizeString(sanitizeCellValue(r.author_company), 200)
      : null,
    text: sanitizeString(sanitizeCellValue(r.text), 5000),
    rating:
      r.rating !== null && r.rating >= 1 && r.rating <= 5
        ? Math.round(r.rating)
        : null,
    source: (["csv", "manual", "url"].includes(r.source) ? r.source : "manual") as "csv" | "manual" | "url",
    source_url:
      r.source_url && isValidUrl(r.source_url)
        ? sanitizeString(r.source_url, 2000)
        : null,
    status: "pending" as const,
  }));

  // Filter out rows without text
  const validRows = sanitizedRows.filter((r) => r.text.length > 0);
  if (validRows.length === 0) return { error: "No valid testimonials to import" };

  const { error: insertError } = await supabase
    .from("testimonials")
    .insert(validRows);

  if (insertError) return { error: "Import failed. Please try again." };
  return { success: true, count: validRows.length };
}

// ---------------------------------------------------------------------------
// Plan-gated creation actions
// ---------------------------------------------------------------------------

export async function createWall(
  projectId: string,
  data: { name: string; style?: string }
): Promise<ActionResult & { wallId?: string }> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  const { limits } = await getProjectPlan(supabase, projectId);
  if (limits.maxWalls !== -1) {
    const { count } = await supabase
      .from("walls")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    if (!withinLimit(limits.maxWalls, count ?? 0)) {
      return {
        error: `You've reached the limit of ${limits.maxWalls} walls on the Free plan. Upgrade to Pro for unlimited walls.`,
      };
    }
  }

  const name = sanitizeString(data.name, 100);
  if (!name) return { error: "Wall name is required" };

  const { data: wall, error: insertError } = await supabase
    .from("walls")
    .insert({
      project_id: projectId,
      name,
      style: (data.style ?? "cards-grid") as Database["public"]["Enums"]["wall_style"],
    })
    .select("id")
    .single();

  if (insertError || !wall) return { error: "Failed to create wall" };
  return { success: true, wallId: wall.id };
}

export async function createForm(
  projectId: string,
  data: { name: string }
): Promise<ActionResult & { formId?: string }> {
  const { error, supabase } = await authorizeProjectMember(projectId);
  if (error) return { error };

  const { limits } = await getProjectPlan(supabase, projectId);
  if (limits.maxForms !== -1) {
    const { count } = await supabase
      .from("collection_forms")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    if (!withinLimit(limits.maxForms, count ?? 0)) {
      return {
        error: `You've reached the limit of ${limits.maxForms} collection form${limits.maxForms === 1 ? "" : "s"} on the Free plan. Upgrade to Pro for unlimited forms.`,
      };
    }
  }

  const name = sanitizeString(data.name, 100);
  if (!name) return { error: "Form name is required" };

  const { data: form, error: insertError } = await supabase
    .from("collection_forms")
    .insert({
      project_id: projectId,
      name,
    })
    .select("id")
    .single();

  if (insertError || !form) return { error: "Failed to create form" };
  return { success: true, formId: form.id };
}
