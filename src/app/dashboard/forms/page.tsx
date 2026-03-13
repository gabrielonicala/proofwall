"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import { usePlan } from "@/hooks/use-plan";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { useRouter } from "next/navigation";
import { toggleFormActive, deleteForm } from "../actions";
import {
  Plus,
  FileText,
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
  created_at: string;
};

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
      .select("id, name, is_active, welcome_message, created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });
    setForms(data ?? []);
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              {/* Top row */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="size-4 text-primary" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">{form.name}</h3>
                    {form.welcome_message && (
                      <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                        {form.welcome_message}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100">
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

              {/* Meta */}
              <div className="mt-auto flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
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

              {/* Clickable overlay */}
              <button
                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                className="absolute inset-0 rounded-xl"
                aria-label={`Edit ${form.name}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
