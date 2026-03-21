"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import { usePlan } from "@/hooks/use-plan";
import {
  type FormField,
  type FormConfig,
  defaultFormConfig,
} from "@/lib/form-config";
import { getThemeVars } from "@/lib/showcase-helpers";
import {
  ArrowLeft,
  Save,
  Loader2,
  GripVertical,
  Star,
  Upload,
  SlidersHorizontal,
  X,
  Pencil,
  Code,
  Globe,
  ExternalLink,
  Copy,
  Check,
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
  const [configOpen, setConfigOpen] = useState(false);

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
        const saved = (form.config as Record<string, unknown>) ?? {};
        setConfig({
          fields,
          welcomeMessage: form.welcome_message ?? defaultFormConfig.welcomeMessage,
          thankYouMessage: form.thank_you_message ?? defaultFormConfig.thankYouMessage,
          accentColor: form.accent_color ?? defaultFormConfig.accentColor,
          logoUrl: form.logo_url ?? defaultFormConfig.logoUrl,
          redirectUrl: form.redirect_url ?? defaultFormConfig.redirectUrl,
          theme: (form.theme as FormConfig["theme"]) ?? defaultFormConfig.theme,
          bgColor: (saved.bgColor as string) ?? defaultFormConfig.bgColor,
          bgTransparent: (saved.bgTransparent as boolean) ?? defaultFormConfig.bgTransparent,
          formColor: (saved.formColor as string) ?? defaultFormConfig.formColor,
          formBorderColor: (saved.formBorderColor as string) ?? defaultFormConfig.formBorderColor,
          formBorderThickness: (saved.formBorderThickness as number) ?? defaultFormConfig.formBorderThickness,
          inputColor: (saved.inputColor as string) ?? defaultFormConfig.inputColor,
          bgFade: (saved.bgFade as boolean) ?? defaultFormConfig.bgFade,
          embedPadding: (saved.embedPadding as number) ?? defaultFormConfig.embedPadding,
        });
      }
    }
    setLoading(false);
  }, [project, isNew, params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && configOpen) setConfigOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [configOpen]);

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
      theme: config.theme,
      is_active: isActive,
      config: {
        bgColor: config.bgColor || "",
        bgTransparent: config.bgTransparent,
        formColor: config.formColor || "",
        formBorderColor: config.formBorderColor || "",
        formBorderThickness: config.formBorderThickness,
        inputColor: config.inputColor || "",
        bgFade: config.bgFade,
        embedPadding: config.embedPadding,
      },
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

  const configContent = (
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
                      className="min-w-0 flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                      placeholder="Label"
                    />
                    <label className="flex flex-shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
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

      {/* Theme */}
      <Section title="Theme">
        <select
          value={config.theme}
          onChange={(e) => setConfig((p) => ({ ...p, theme: e.target.value as FormConfig["theme"] }))}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="custom">Custom</option>
        </select>

        {config.theme === "custom" && (
          <div className="mt-3 space-y-3">
            {/* Transparent background */}
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-xs text-muted-foreground">Transparent background</span>
              <Toggle
                checked={config.bgTransparent}
                onChange={(v) => setConfig((p) => ({ ...p, bgTransparent: v }))}
              />
            </label>

            {/* Fade edges */}
            {!config.bgTransparent && (
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-xs text-muted-foreground">Fade edges into host background</span>
                <Toggle
                  checked={config.bgFade}
                  onChange={(v) => setConfig((p) => ({ ...p, bgFade: v }))}
                />
              </label>
            )}

            {/* Embed padding */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Embed padding</span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">{config.embedPadding}rem</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={0.5}
                  value={config.embedPadding}
                  onChange={(e) => setConfig((p) => ({ ...p, embedPadding: Number(e.target.value) }))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-125"
                />
              </div>
            </div>

            {/* Background color */}
            {!config.bgTransparent && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Background color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.bgColor || "#0a0a10"}
                    onChange={(e) => setConfig((p) => ({ ...p, bgColor: e.target.value }))}
                    className="size-8 cursor-pointer rounded border border-input"
                  />
                  <input
                    value={config.bgColor}
                    onChange={(e) => setConfig((p) => ({ ...p, bgColor: e.target.value }))}
                    className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                    placeholder="#0a0a10"
                  />
                </div>
              </div>
            )}

            {/* Form card color */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Form color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.formColor || "#1a1a2e"}
                  onChange={(e) => setConfig((p) => ({ ...p, formColor: e.target.value }))}
                  className="size-8 cursor-pointer rounded border border-input"
                />
                <input
                  value={config.formColor}
                  onChange={(e) => setConfig((p) => ({ ...p, formColor: e.target.value }))}
                  className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                  placeholder="#1a1a2e"
                />
              </div>
            </div>

            {/* Input color */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Input color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.inputColor || "#12121e"}
                  onChange={(e) => setConfig((p) => ({ ...p, inputColor: e.target.value }))}
                  className="size-8 cursor-pointer rounded border border-input"
                />
                <input
                  value={config.inputColor}
                  onChange={(e) => setConfig((p) => ({ ...p, inputColor: e.target.value }))}
                  className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                  placeholder="#12121e"
                />
              </div>
            </div>

            {/* Form border color */}
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Border color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.formBorderColor || "#2a2a3e"}
                  onChange={(e) => setConfig((p) => ({ ...p, formBorderColor: e.target.value }))}
                  className="size-8 cursor-pointer rounded border border-input"
                />
                <input
                  value={config.formBorderColor}
                  onChange={(e) => setConfig((p) => ({ ...p, formBorderColor: e.target.value }))}
                  className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-ring"
                  placeholder="#2a2a3e"
                />
              </div>
            </div>

            {/* Border thickness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Border thickness</span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">{config.formBorderThickness}px</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={config.formBorderThickness}
                  onChange={(e) => setConfig((p) => ({ ...p, formBorderThickness: Number(e.target.value) }))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-125"
                />
              </div>
            </div>

          </div>
        )}
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

      {/* Embed code — only for existing forms */}
      {!isNew && (
        <Section title="Embed Code">
          <FormEmbedCodePanel formId={params.id} />
        </Section>
      )}
    </div>
  );

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
            maxLength={15}
            className="hidden min-w-0 max-w-56 rounded-lg bg-muted/50 px-3 py-1 text-lg font-semibold outline-none placeholder:text-muted-foreground focus:bg-muted sm:block"
            placeholder="Form name..."
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfigOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
            aria-label="Open settings"
          >
            <SlidersHorizontal className="size-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:px-4"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span className="hidden sm:inline">{isNew ? "Create Form" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Editor body */}
      {/* Mobile config drawer */}
      <AnimatePresence>
        {configOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm sm:hidden"
            onClick={() => setConfigOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {configOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            role="dialog"
            aria-label="Form configuration"
            className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-background p-4 sm:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setConfigOpen(false)}
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close settings"
              >
                <X className="size-4" />
              </button>
            </div>
            {configContent}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Config */}
        <div className="hidden w-80 flex-shrink-0 overflow-y-auto border-r border-border p-4 sm:block">
          {configContent}
        </div>

        {/* Right panel: Live Preview */}
        <div
          className={`flex flex-1 items-start justify-center overflow-y-auto transition-colors duration-300 ${config.theme === "light" ? "light" : ""}`}
          style={{
            ...getThemeVars(
              config.theme === "custom" ? "dark" : config.theme,
              config.theme === "custom" ? { bgColor: config.bgColor || undefined, cardColor: config.formColor || undefined } : undefined,
            ),
            padding: `${config.theme === "custom" ? config.embedPadding : 2}rem`,
            background: config.theme === "custom" && config.bgTransparent
              ? "repeating-conic-gradient(#2a2a2e 0% 25%, #1a1a1e 0% 50%) 0 0 / 16px 16px"
              : config.theme === "custom" && config.bgFade
                ? (() => {
                    const bg = config.bgColor || "oklch(0.112 0.008 280)";
                    return `linear-gradient(to bottom, transparent, ${bg} 40%, ${bg} 60%, transparent)`;
                  })()
                : config.theme === "custom" && config.bgColor
                  ? config.bgColor
                  : "var(--background)",
          }}
        >
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

  const isCustom = config.theme === "custom";
  const formCardStyle: React.CSSProperties = isCustom
    ? {
        backgroundColor: config.formColor || undefined,
        border: `${config.formBorderThickness}px solid ${config.formBorderColor || "var(--border)"}`,
      }
    : {};
  const inputStyle: React.CSSProperties | undefined = isCustom
    ? { backgroundColor: config.inputColor || "oklch(0.145 0.014 280)" }
    : undefined;

  return (
    <div
      className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
      style={formCardStyle}
    >
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
              <div className="flex w-full items-center justify-center rounded-lg border border-input bg-background px-3 py-6 transition-colors hover:border-primary/30" style={inputStyle}>
                <Upload className="size-5 text-muted-foreground" />
              </div>
            ) : field.type === "textarea" ? (
              <textarea
                readOnly
                placeholder={field.placeholder}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                style={inputStyle}
              />
            ) : (
              <input
                readOnly
                type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                style={inputStyle}
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

/* ─── Embed Code Panel ─── */

type FormEmbedTab = "iframe" | "popup" | "react" | "link";

const formEmbedTabs: { id: FormEmbedTab; label: string }[] = [
  { id: "iframe", label: "iFrame" },
  { id: "popup", label: "Popup" },
  { id: "react", label: "React" },
  { id: "link", label: "Link" },
];

function highlightHtml(code: string) {
  const parts: { text: string; cls: string }[] = [];
  const regex = /(<\/?[\w-]+)|(\s[\w-]+)(?==)|("[^"]*")|('(?:[^'\\]|\\.)*')|(\/?>)|(\{[^}]*\})|(\/\/[^\n]*)|([^<"'{/]+)/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    if (match[1]) parts.push({ text: match[1], cls: "text-[#7cacf8]" });
    else if (match[2]) parts.push({ text: match[2], cls: "text-[#d4a0f5]" });
    else if (match[3]) parts.push({ text: match[3], cls: "text-[#a8d4a2]" });
    else if (match[4]) parts.push({ text: match[4], cls: "text-[#a8d4a2]" });
    else if (match[5]) parts.push({ text: match[5], cls: "text-[#7cacf8]" });
    else if (match[6]) parts.push({ text: match[6], cls: "text-[#e8c882]" });
    else if (match[7]) parts.push({ text: match[7], cls: "text-[#6a6a7a]" });
    else if (match[8]) parts.push({ text: match[8], cls: "text-[#c8c8d0]" });
  }
  return parts;
}

function FormCodeBlock({ code, onCopy }: { code: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  const highlighted = highlightHtml(code);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: noop
    }
  }

  return (
    <div className="group relative rounded-lg border border-[#1e1e2a] bg-[#0d0d12] overflow-hidden">
      <button
        onClick={handleCopy}
        className="absolute right-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-md bg-[#1e1e2a] px-2 py-1 text-[10px] font-medium text-[#9ca3af] opacity-0 transition-all hover:bg-[#2a2a3a] hover:text-[#e0e0e8] group-hover:opacity-100"
      >
        {copied ? (
          <>
            <Check className="size-3 text-emerald-400" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="size-3" />
            Copy
          </>
        )}
      </button>
      <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed font-mono">
        <code>
          {highlighted.map((part, i) => (
            <span key={i} className={part.cls}>{part.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function FormEmbedCodePanel({ formId }: { formId: string }) {
  const [tab, setTab] = useState<FormEmbedTab>("iframe");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const formUrl = `${origin}/form/${formId}`;

  const snippets: Record<FormEmbedTab, { code: string; hint: string }> = {
    iframe: {
      code: `<iframe\n  id="laudica-form-${formId.slice(0, 8)}"\n  src="${formUrl}"\n  style="width:100%;border:none;min-height:400px"\n  scrolling="no"\n  loading="lazy"\n  title="Laudica feedback form"\n></iframe>\n<script>\nwindow.addEventListener("message", function(e) {\n  if (e.data && e.data.type === "laudica-resize") {\n    var f = document.getElementById("laudica-form-${formId.slice(0, 8)}");\n    if (f) f.style.height = e.data.height + "px";\n  }\n});\n</script>`,
      hint: "Embeds the form inline with auto-resize. Works on any website.",
    },
    popup: {
      code: `<button onclick="document.getElementById('laudica-modal-${formId.slice(0, 8)}').style.display='flex'"\n  style="padding:10px 20px;border-radius:8px;background:#4F46E5;color:#fff;border:none;cursor:pointer;font-size:14px"\n>Leave Feedback</button>\n<div id="laudica-modal-${formId.slice(0, 8)}"\n  style="display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;background:rgba(0,0,0,0.5)"\n  onclick="if(event.target===this)this.style.display='none'">\n  <iframe src="${formUrl}"\n    style="width:100%;max-width:560px;height:90vh;border:none;border-radius:12px"\n    loading="lazy"\n    title="Laudica feedback form"\n  ></iframe>\n</div>`,
      hint: "Adds a button that opens the form in a centered modal overlay.",
    },
    react: {
      code: `import { useEffect, useRef } from "react";\n\nfunction LaudicaForm() {\n  const ref = useRef<HTMLIFrameElement>(null);\n\n  useEffect(() => {\n    function onMsg(e: MessageEvent) {\n      if (e.data?.type === "laudica-resize" && ref.current) {\n        ref.current.style.height = e.data.height + "px";\n      }\n    }\n    window.addEventListener("message", onMsg);\n    return () => window.removeEventListener("message", onMsg);\n  }, []);\n\n  return (\n    <iframe\n      ref={ref}\n      src="${formUrl}"\n      style={{ width: "100%", border: "none", minHeight: 400 }}\n      scrolling="no"\n      loading="lazy"\n      title="Laudica feedback form"\n    />\n  );\n}`,
      hint: "Drop-in React component with auto-resize.",
    },
    link: {
      code: formUrl,
      hint: "Share this link directly. Anyone with the link can submit a testimonial.",
    },
  };

  const current = snippets[tab];

  return (
    <div className="space-y-2">
      <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
        {formEmbedTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-1.5 py-1.5 text-[10px] font-medium transition-all ${
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <FormCodeBlock code={current.code} onCopy={() => {}} />
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        {current.hint}
      </p>
    </div>
  );
}
