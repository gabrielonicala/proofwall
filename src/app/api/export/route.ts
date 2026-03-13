import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/plans";
import type { Database } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  const format = req.nextUrl.searchParams.get("format") ?? "csv";

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

  // Check plan allows export
  const { data: project } = await supabase
    .from("projects")
    .select("plan")
    .eq("id", projectId)
    .single();

  const limits = getPlanLimits(
    (project?.plan ?? "free") as Database["public"]["Enums"]["plan"]
  );

  if (!limits.hasExport) {
    return NextResponse.json(
      { error: "Export is available on the Business plan" },
      { status: 403 }
    );
  }

  // Fetch all testimonials
  const { data: testimonials, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }

  if (format === "json") {
    return new NextResponse(JSON.stringify(testimonials, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="testimonials-${Date.now()}.json"`,
      },
    });
  }

  // CSV format
  if (!testimonials || testimonials.length === 0) {
    return new NextResponse("No testimonials to export", { status: 200 });
  }

  const csvHeaders = Object.keys(testimonials[0]);
  const csvRows = [
    csvHeaders.join(","),
    ...testimonials.map((t) =>
      csvHeaders
        .map((h) => {
          const val = (t as Record<string, unknown>)[h];
          const str = val === null ? "" : String(val);
          // Escape CSV values
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];

  return new NextResponse(csvRows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="testimonials-${Date.now()}.csv"`,
    },
  });
}
