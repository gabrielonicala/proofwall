"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import { usePlan } from "@/hooks/use-plan";
import {
  type FormField,
  type FormConfig,
  defaultFormConfig,
} from "@/lib/form-config";
import {
  ArrowLeft,
  Save,
  Loader2,
  GripVertical,
  Star,
  Upload,
} from "lucide-react";

export default function FormEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { project } = useProject();
  const { limits } = usePlan();
  const isNew = params.id === "new";

  const [name, setName] = useState("New Form");
  const [config, setConfig] = useState<FormConfig>(defaultFormConfig);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!project) return;
    if (!isNew) {
      const supabase = createClient();
      const { data: form } = await supabase
        .from("collection_forms")
        .select("*")
        .eq("id", params.id)
        .single();

      if (form) {
        setName(form.name);
        setIsActive(form.is_active);
        const fields = (form.fields as unknown as FormField[]) ?? defaultFormConfig.fields;
        setConfig({
          fields,
          welcomeMessage: form.welcome_message ?? defaultFormConfig.welcomeMessage,
          thankYouMessage: form.thank_you_message ?? defaultFormConfig.thankYouMessage,
          accentColor: form.accent_color ?? defaultFormConfig.accentColor,
          logoUrl: form.logo_url ?? defaultFormConfig.logoUrl,
          redirectUrl: form.redirect_url ?? defaultFormConfig.redirectUrl,
        });
      }
    }
    setLoading(false);
  }, [project, isNew, params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave() {
    if (!project || !name.trim()) return;
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: name.trim(),
      project_id: project.id,
      fields: JSON.parse(JSON.stringify(config.fields)),
      welcome_message: config.welcomeMessage || null,
      thank_you_message: config.thankYouMessage || null,
      accent_color: config.accentColor || null,
      logo_url: config.logoUrl || null,
      redirect_url: config.redirectUrl || null,
      is_active: isActive,
    };

    if (isNew) {
      const { data } = await supabase.from("collection_forms").insert(payload).select("id").single();
      setSaving(false);
      if (data) router.replace(`/dashboard/forms/${data.id}`);
    } else {
      await supabase.from("collection_forms").update(payload).eq("id", params.id);
      setSaving(false);
    }
  }

  function updateField(id: string, updates: Partial<FormField>) {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/forms")}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-none bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground"
            placeholder="Form name..."
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isNew ? "Create Form" : "Save"}
        </button>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Config */}
        <div className="w-80 flex-shrink-0 overflow-y-auto border-r border-border p-4">
          <div className="space-y-6">
            {/* Welcome message */}
            <Section title="Welcome Message">
              <textarea
                value={config.welcomeMessage}
                onChange={(e) => setConfig((p) => ({ ...p, welcomeMessage: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                placeholder="We'd love to hear from you!"
              />
            </Section>

            {/* Thank you message */}
            <Section title="Thank You Message">
              <textarea
                value={config.thankYouMessage}
                onChange={(e) => setConfig((p) => ({ ...p, thankYouMessage: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                placeholder="Thank you for your feedback!"
              />
            </Section>

            {/* Form fields */}
            <Section title="Fields">
              <div className="space-y-2">
                {config.fields.map((field) => (
                  <div
                    key={field.id}
                    className={`rounded-lg border p-3 transition-colors ${
                      field.enabled
                        ? "border-border bg-card"
                        : "border-transparent bg-muted/50 opacity-60"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="size-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{field.label}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {field.type}
                        </span>
                      </div>
                      <Toggle
                        checked={field.enabled}
                        onChange={(v) => updateField(field.id, { enabled: v })}
                      />
                    </div>
                    {field.enabled && (
                      <div className="space-y-2 pl-5">
                        <div className="flex items-center gap-2">
                          <input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                            placeholder="Label"
                          />
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="size-3.5 rounded border-input accent-primary"
                            />
                            Required
                          </label>
                        </div>
                        {field.type !== "rating" && field.type !== "photo" && (
                          <input
                            value={field.placeholder ?? ""}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            className="w-full rounded border border-input bg-background px-2 py-1 text-xs outline-none placeholder:text-muted-foreground focus:border-ring"
                            placeholder="Placeholder text..."
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            {/* Branding */}
            <Section title="Branding">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Accent color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => setConfig((p) => ({ ...p, accentColor: e.target.value }))}
                      className="size-8 cursor-pointer rounded border border-input"
                    />
                    <input
                      value={config.accentColor}
                      onChange={(e) => setConfig((p) => ({ ...p, accentColor: e.target.value }))}
                      className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Logo URL</label>
                  <input
                    value={config.logoUrl}
                    onChange={(e) => setConfig((p) => ({ ...p, logoUrl: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                    placeholder="https://yoursite.com/logo.png"
                  />
                </div>
              </div>
            </Section>

            {/* Form URL / Custom Domain */}
            <Section title="Form URL">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {limits.hasCustomFormDomain
                    ? "Custom domain support — configure in project settings."
                    : "Custom domains available on the Business plan."}
                </p>
              </div>
            </Section>

            {/* Redirect */}
            <Section title="After Submission">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Redirect URL (optional)</label>
                <input
                  value={config.redirectUrl}
                  onChange={(e) => setConfig((p) => ({ ...p, redirectUrl: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                  placeholder="https://yoursite.com/thanks"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  If set, the user will be redirected here instead of seeing the thank-you message.
                </p>
              </div>
            </Section>

            {/* Status */}
            <Section title="Status">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm">Form is active</span>
                <Toggle checked={isActive} onChange={setIsActive} />
              </label>
            </Section>
          </div>
        </div>

        {/* Right panel: Live Preview */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto bg-muted/30 p-8">
          <FormPreview config={config} />
        </div>
      </div>
    </div>
  );
}

/* ─── Preview ─── */

function FormPreview({ config }: { config: FormConfig }) {
  const enabledFields = config.fields.filter((f) => f.enabled);
  const [previewRating, setPreviewRating] = useState(0);

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
      {/* Logo */}
      {config.logoUrl && (
        <div className="mb-4 flex justify-center">
          <img
            src={config.logoUrl}
            alt="Logo"
            className="h-10 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* Welcome */}
      {config.welcomeMessage && (
        <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
          {config.welcomeMessage}
        </h2>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {enabledFields.map((field) => (
          <div key={field.id}>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {field.label}
              {field.required && <span className="ml-0.5" style={{ color: config.accentColor }}> *</span>}
            </label>

            {field.type === "rating" ? (
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPreviewRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className="size-7"
                      style={{
                        color: i < previewRating ? config.accentColor : undefined,
                        fill: i < previewRating ? config.accentColor : "none",
                      }}
                      strokeWidth={i < previewRating ? 0 : 1.5}
                    />
                  </button>
                ))}
              </div>
            ) : field.type === "photo" ? (
              <div className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/30">
                <Upload className="size-5 text-muted-foreground" />
              </div>
            ) : field.type === "textarea" ? (
              <textarea
                readOnly
                placeholder={field.placeholder}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            ) : (
              <input
                readOnly
                type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit button */}
      {enabledFields.length > 0 && (
        <button
          type="button"
          className="mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: config.accentColor }}
        >
          Submit
        </button>
      )}
    </div>
  );
}

/* ─── Helpers ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}
