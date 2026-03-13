import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/plans";
import type { Database } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized — API key required" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  // Verify membership
  const { data: member } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Not a project member" }, { status: 403 });
  }

  // Check plan
  const { data: project } = await supabase
    .from("projects")
    .select("plan")
    .eq("id", projectId)
    .single();

  const limits = getPlanLimits(
    (project?.plan ?? "free") as Database["public"]["Enums"]["plan"]
  );

  if (!limits.hasApiAccess) {
    return NextResponse.json(
      { error: "API access is available on the Business plan" },
      { status: 403 }
    );
  }

  // Fetch testimonials
  const status = req.nextUrl.searchParams.get("status");
  let query = supabase
    .from("testimonials")
    .select("id, author_name, author_title, author_company, author_photo, text, rating, source, status, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status as Database["public"]["Enums"]["testimonial_status"]);
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0");
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: { limit, offset, count: data?.length ?? 0 },
  });
}
