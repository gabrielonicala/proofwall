"use client";

import { useState } from "react";
import { type FormField } from "@/lib/form-config";
import { Star, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { submitTestimonial } from "./actions";

interface Props {
  formId: string;
  projectId: string;
  fields: FormField[];
  welcomeMessage: string | null;
  thankYouMessage: string | null;
  accentColor: string;
  logoUrl: string | null;
  redirectUrl: string | null;
}

export function PublicForm({
  formId,
  projectId,
  fields,
  welcomeMessage,
  thankYouMessage,
  accentColor,
  logoUrl,
  redirectUrl,
}: Props) {
  const enabledFields = fields.filter((f) => f.enabled);
  const [values, setValues] = useState<Record<string, string>>({});
  const [rating, setRating] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate required fields
    for (const field of enabledFields) {
      if (!field.required) continue;
      if (field.type === "rating" && rating === 0) {
        setError(`Please provide a ${field.label.toLowerCase()}.`);
        return;
      }
      if (field.type !== "rating" && field.type !== "photo" && !values[field.id]?.trim()) {
        setError(`${field.label} is required.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const result = await submitTestimonial({
        formId,
        projectId,
        authorName: values.author_name?.trim() || "Anonymous",
        authorTitle: values.author_title?.trim(),
        authorCompany: values.author_company?.trim(),
        text: values.text?.trim() || "",
        rating: rating || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (redirectUrl) {
        // Validate redirect URL to prevent open redirect attacks
        try {
          const parsed = new URL(redirectUrl);
          if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            window.location.href = redirectUrl;
            return;
          }
        } catch {
          // Invalid URL — fall through to thank-you page
        }
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Thank-you state
  if (submitted) {
    return (
      <div className="light flex min-h-svh items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-2xl bg-card p-8 text-center shadow-lg">
          <CheckCircle2
            className="mx-auto mb-4 size-14"
            style={{ color: accentColor }}
          />
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            {thankYouMessage || "Thank you!"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Your testimonial has been submitted and is pending review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="light flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-lg sm:p-8"
      >
        {/* Logo */}
        {logoUrl && (
          <div className="mb-4 flex justify-center">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}

        {/* Welcome */}
        {welcomeMessage && (
          <h1 className="mb-6 text-center text-xl font-semibold text-foreground">
            {welcomeMessage}
          </h1>
        )}

        {/* Fields */}
        <div className="space-y-4">
          {enabledFields.map((field) => (
            <div key={field.id}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {field.label}
                {field.required && (
                  <span className="ml-0.5" style={{ color: accentColor }}> *</span>
                )}
              </label>

              {field.type === "rating" ? (
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className="size-8"
                        style={{
                          color: i < rating ? accentColor : "var(--muted)",
                          fill: i < rating ? accentColor : "none",
                        }}
                        strokeWidth={i < rating ? 0 : 1.5}
                      />
                    </button>
                  ))}
                </div>
              ) : field.type === "photo" ? (
                <label className="group flex cursor-pointer items-center gap-3">
                  <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-input bg-muted/30 transition-colors group-hover:border-muted-foreground">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="size-full object-cover" />
                    ) : (
                      <Upload className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {photoPreview ? "Change photo" : "Upload a photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="hidden"
                  />
                </label>
              ) : field.type === "textarea" ? (
                <textarea
                  value={values[field.id] ?? ""}
                  onChange={(e) => setValue(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={4}
                  maxLength={5000}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-transparent focus:ring-2"
                  style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
                />
              ) : (
                <input
                  type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setValue(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={200}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-transparent focus:ring-2"
                  style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
