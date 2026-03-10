import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { type FormField } from "@/lib/form-config";
import { PublicForm } from "./public-form";

export default async function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("collection_forms")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!form) notFound();

  return (
    <PublicForm
      formId={form.id}
      projectId={form.project_id}
      fields={(form.fields as unknown as FormField[]) ?? []}
      welcomeMessage={form.welcome_message}
      thankYouMessage={form.thank_you_message}
      accentColor={form.accent_color ?? "#4F46E5"}
      logoUrl={form.logo_url}
      redirectUrl={form.redirect_url}
    />
  );
}
