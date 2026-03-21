"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import { usePlan } from "@/hooks/use-plan";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { useRouter } from "next/navigation";
import { toggleFormActive, deleteForm } from "../actions";
import { type FormField, defaultFields } from "@/lib/form-config";
import { getThemeVars } from "@/lib/showcase-helpers";
import {
  Plus,
  FileText,
  Star,
  Upload,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  MoreVertical,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Form = {
  id: string;
  name: string;
  is_active: boolean;
  welcome_message: string | null;
  accent_color: string | null;
  logo_url: string | null;
  fields: FormField[] | null;
  theme: string;
  config: Record<string, unknown> | null;
  created_at: string;
};

const PREVIEW_DISPLAY_HEIGHT = 500;
const MAX_SCALE = 0.88;

function getPreviewScale(fields: FormField[], hasWelcome: boolean, hasLogo: boolean) {
  const logo = hasLogo ? 44 : 0;
  const welcome = hasWelcome ? 44 : 0;
  const fieldH = fields.reduce((sum, f) => {
    if (f.type === "textarea") return sum + 88;
    if (f.type === "rating") return sum + 48;
    if (f.type === "photo") return sum + 76;
    return sum + 58;
  }, 0);
  const gaps = Math.max(0, fields.length - 1) * 12;
  const submit = 54;
  const cardPadding = 48; // p-6 top + bottom
  const outerPadding = 48; // py-6 top + bottom
  const margin = 30;
  const contentHeight = logo + welcome + fieldH + gaps + submit + cardPadding + outerPadding + margin;
  const scale = Math.min(MAX_SCALE, PREVIEW_DISPLAY_HEIGHT / contentHeight);
  return { scale, renderHeight: contentHeight };
}

export default function FormsPage() {
  const { project } = useProject();
  const { limits } = usePlan();
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    if (!project) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("collection_forms")
      .select("id, name, is_active, welcome_message, accent_color, logo_url, fields, theme, config, created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });
    setForms((data ?? []) as Form[]);
    setLoading(false);
  }, [project]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  async function handleToggleActive(id: string, current: boolean) {
    if (!project) return;
    const result = await toggleFormActive(project.id, id, !current);
    if (result.error) return;
    setForms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_active: !current } : f))
    );
  }

  async function handleDelete(id: string) {
    if (!project) return;
    const result = await deleteForm(project.id, id);
    if (result.error) return;
    setForms((prev) => prev.filter((f) => f.id !== id));
  }

  function copyLink(id: string) {
    const url = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Upgrade banner */}
      {limits.maxForms !== -1 && forms.length >= limits.maxForms && (
        <UpgradeBanner message="You've reached your form limit." />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Collection Forms</h1>
          <p className="text-sm text-muted-foreground">
            {forms.length}{limits.maxForms !== -1 ? ` / ${limits.maxForms}` : ""} form{forms.length !== 1 ? "s" : ""} ·{" "}
            {forms.filter((f) => f.is_active).length} active
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/forms/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Create Form
        </button>
      </div>

      {/* Forms grid */}
      {forms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="mb-1 font-medium">No collection forms yet</p>
          <p className="text-sm text-muted-foreground">
            Create a form to start collecting testimonials from your customers.
          </p>
        </div>
      ) : (
        <div className="grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => {
            const fields = (form.fields ?? defaultFields).filter((f) => f.enabled);
            const accent = form.accent_color ?? "#4F46E5";
            const saved = form.config ?? {};
            const isCustom = form.theme === "custom";
            const isLight = form.theme === "light";
            const bgTransparent = (saved.bgTransparent as boolean) ?? false;
            const bgColor = (saved.bgColor as string) || "";
            const bgFade = (saved.bgFade as boolean) ?? false;
            const formColor = (saved.formColor as string) || "";
            const formBorderColor = (saved.formBorderColor as string) || "";
            const formBorderThickness = (saved.formBorderThickness as number) ?? 1;
            const inputColor = (saved.inputColor as string) || "";
            const borderRadius = (saved.borderRadius as string) ?? "rounded";
            const themeVars = getThemeVars(
              isCustom ? (bgTransparent ? "transparent" : "dark") : form.theme as "dark" | "light" | "auto",
              isCustom && bgColor && !bgTransparent ? { bgColor } : undefined
            );
            const { scale, renderHeight } = getPreviewScale(fields, !!form.welcome_message, !!form.logo_url);

            const radiusClass = isCustom
              ? borderRadius === "none"
                ? "rounded-none"
                : borderRadius === "subtle"
                  ? "rounded-md"
                  : borderRadius === "pill"
                    ? "rounded-3xl"
                    : "rounded-2xl"
              : "rounded-2xl";

            const formCardStyle: React.CSSProperties = isCustom
              ? {
                  backgroundColor: formColor || undefined,
                  border: `${formBorderThickness}px solid ${formBorderColor || "var(--border)"}`,
                }
              : {};

            const previewInputStyle: React.CSSProperties | undefined = isCustom && inputColor
              ? { backgroundColor: inputColor }
              : undefined;

            const bgValue = bgTransparent
              ? "transparent"
              : isCustom && bgColor
                ? bgColor
                : "var(--background)";

            return (
              <div
                key={form.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
              >
                {/* Header: name, status, actions */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div>
                    <h3 className="text-sm font-medium">{form.name}</h3>
                    {form.welcome_message && (
                      <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {form.welcome_message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {form.is_active ? (
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-muted-foreground" />
                        )}
                        {form.is_active ? "Active" : "Inactive"}
                      </span>
                      {copied === form.id && (
                        <span className="text-emerald-500">Copied!</span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="relative z-10 flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100">
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/forms/${form.id}`)}>
                          <Pencil className="mr-2 size-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(form.id)}>
                          <Copy className="mr-2 size-3.5" /> Copy link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/form/${form.id}`, "_blank")}>
                          <ExternalLink className="mr-2 size-3.5" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(form.id, form.is_active)}>
                          {form.is_active ? (
                            <><ToggleLeft className="mr-2 size-3.5" /> Deactivate</>
                          ) : (
                            <><ToggleRight className="mr-2 size-3.5" /> Activate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(form.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Mini form preview */}
                <div
                  className={`relative overflow-hidden border-t border-border ${isLight ? "light" : ""}`}
                  style={{
                    height: PREVIEW_DISPLAY_HEIGHT,
                    ...themeVars,
                    background: bgFade && !bgTransparent
                      ? `linear-gradient(to bottom, transparent, ${bgValue} 40%, ${bgValue} 60%, transparent)`
                      : bgTransparent
                        ? "repeating-conic-gradient(#2a2a2e 0% 25%, #1a1a1e 0% 50%) 0 0 / 16px 16px"
                        : bgValue,
                  }}
                >
                  <div
                    className="pointer-events-none"
                    style={{
                      width: `${100 / scale}%`,
                      height: renderHeight,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      background: bgFade ? "transparent" : undefined,
                    }}
                  >
                    <div className="flex w-full justify-center px-6 py-6">
                      <div
                        className={`w-full max-w-lg ${radiusClass} border border-border bg-card p-6 shadow-lg`}
                        style={formCardStyle}
                      >
                        {form.logo_url && (
                          <div className="mb-3 flex justify-center">
                            <img
                              src={form.logo_url}
                              alt="Logo"
                              className="h-8 object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>
                        )}
                        {form.welcome_message && (
                          <h2 className="mb-4 text-center text-lg font-semibold text-foreground">
                            {form.welcome_message}
                          </h2>
                        )}
                        <div className="space-y-3">
                          {fields.map((field) => (
                            <div key={field.id}>
                              <p className="mb-1 text-sm font-medium text-foreground">
                                {field.label}
                                {field.required && <span style={{ color: accent }}> *</span>}
                              </p>
                              {field.type === "rating" ? (
                                <div className="flex gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="size-5 text-muted-foreground/40" />
                                  ))}
                                </div>
                              ) : field.type === "photo" ? (
                                <div
                                  className="flex w-full items-center justify-center rounded-lg border border-input bg-background px-3 py-4"
                                  style={previewInputStyle}
                                >
                                  <Upload className="size-4 text-muted-foreground" />
                                </div>
                              ) : field.type === "textarea" ? (
                                <div
                                  className="h-16 rounded-lg border border-input bg-background px-3 py-2"
                                  style={previewInputStyle}
                                >
                                  <span className="text-sm text-muted-foreground/50">{field.placeholder}</span>
                                </div>
                              ) : (
                                <div
                                  className="rounded-lg border border-input bg-background px-3 py-2"
                                  style={previewInputStyle}
                                >
                                  <span className="text-sm text-muted-foreground/50">{field.placeholder}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div
                          className="mt-4 rounded-lg px-4 py-2 text-center text-sm font-medium text-white"
                          style={{ backgroundColor: accent }}
                        >
                          Submit
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Fade out at bottom */}
                  {!bgFade && (
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-8"
                      style={{ background: `linear-gradient(to top, ${bgValue}, transparent)` }}
                    />
                  )}
                </div>

                {/* Clickable overlay */}
                <button
                  onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                  className="absolute inset-0 rounded-xl"
                  aria-label={`Edit ${form.name}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
