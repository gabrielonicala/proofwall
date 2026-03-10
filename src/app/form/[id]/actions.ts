"use server";

import { createClient } from "@/lib/supabase/server";

interface SubmitData {
  formId: string;
  projectId: string;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  authorPhoto?: string;
  text: string;
  rating?: number;
}

export async function submitTestimonial(data: SubmitData) {
  const supabase = await createClient();

  // Verify the form exists and is active
  const { data: form } = await supabase
    .from("collection_forms")
    .select("id, project_id, is_active")
    .eq("id", data.formId)
    .single();

  if (!form || !form.is_active || form.project_id !== data.projectId) {
    return { error: "This form is no longer accepting submissions." };
  }

  const { error } = await supabase.from("testimonials").insert({
    project_id: data.projectId,
    author_name: data.authorName || "Anonymous",
    author_title: data.authorTitle || null,
    author_company: data.authorCompany || null,
    author_photo: data.authorPhoto || null,
    text: data.text,
    rating: data.rating || null,
    source: "form" as const,
    status: "pending" as const,
    source_url: data.formId,
  });

  if (error) {
    return { error: "Failed to submit. Please try again." };
  }

  return { success: true };
}
