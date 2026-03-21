import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { type FormField } from "@/lib/form-config";
import { PublicForm } from "./public-form";
import { EmbedResize } from "@/app/embed/[id]/embed-resize";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

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

  const saved = (form.config as Record<string, unknown>) ?? {};

  return (
    <>
      <EmbedResize />
      <PublicForm
        formId={form.id}
        projectId={form.project_id}
        fields={(form.fields as unknown as FormField[]) ?? []}
        welcomeMessage={form.welcome_message}
        thankYouMessage={form.thank_you_message}
        accentColor={form.accent_color ?? "#4F46E5"}
        logoUrl={form.logo_url}
        redirectUrl={form.redirect_url}
        theme={(form.theme as "dark" | "light" | "auto" | "custom") ?? "light"}
        bgColor={(saved.bgColor as string) ?? ""}
        formColor={(saved.formColor as string) ?? ""}
        formBorderColor={(saved.formBorderColor as string) ?? ""}
        formBorderThickness={(saved.formBorderThickness as number) ?? 1}
        inputColor={(saved.inputColor as string) ?? ""}
        bgTransparent={(saved.bgTransparent as boolean) ?? false}
        bgFade={(saved.bgFade as boolean) ?? false}
        embedPadding={(saved.embedPadding as number) ?? 3}
      />
    </>
  );
}
