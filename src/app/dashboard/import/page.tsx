"use client";

import { useState, useCallback } from "react";
import { useProject } from "@/hooks/use-project";
import { importTestimonials } from "../actions";
import {
  Upload,
  FileText,
  Link,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Star,
  Pencil,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImportTab = "csv" | "paste" | "url";

type PendingTestimonial = {
  _key: string; // client-side only id for React keys
  author_name: string;
  author_title: string;
  author_company: string;
  text: string;
  rating: number | null;
  source: "csv" | "manual" | "url";
  source_url: string;
};

// ---------------------------------------------------------------------------
// CSV helpers (no external libraries)
// ---------------------------------------------------------------------------

/** Column-name mapping: common CSV header -> our field */
const COLUMN_MAP: Record<string, keyof PendingTestimonial> = {
  name: "author_name",
  author_name: "author_name",
  author: "author_name",
  full_name: "author_name",
  fullname: "author_name",
  customer: "author_name",

  title: "author_title",
  author_title: "author_title",
  job_title: "author_title",
  jobtitle: "author_title",
  role: "author_title",
  position: "author_title",

  company: "author_company",
  author_company: "author_company",
  organization: "author_company",
  org: "author_company",

  text: "text",
  testimonial: "text",
  review: "text",
  feedback: "text",
  comment: "text",
  body: "text",
  message: "text",
  content: "text",

  rating: "rating",
  stars: "rating",
  score: "rating",

  source_url: "source_url",
  url: "source_url",
  link: "source_url",
};

/**
 * Parse a single CSV line, handling quoted fields with commas and escaped quotes.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ""
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        }
        // End of quoted field
        inQuotes = false;
        i++;
        continue;
      }
      current += ch;
      i++;
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ",") {
        fields.push(current.trim());
        current = "";
        i++;
        continue;
      }
      current += ch;
      i++;
    }
  }

  fields.push(current.trim());
  return fields;
}

/**
 * Parse full CSV text into PendingTestimonial[].
 */
function parseCsv(raw: string): PendingTestimonial[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return []; // need header + at least 1 row

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));

  // Resolve each header to our field name
  const mapping: (keyof PendingTestimonial | null)[] = headers.map(
    (h) => COLUMN_MAP[h] ?? null
  );

  const results: PendingTestimonial[] = [];

  for (let r = 1; r < lines.length; r++) {
    const values = parseCsvLine(lines[r]);
    const row: Partial<PendingTestimonial> = {};

    for (let c = 0; c < mapping.length; c++) {
      const field = mapping[c];
      if (!field || !values[c]) continue;

      if (field === "rating") {
        const n = parseInt(values[c], 10);
        row.rating = isNaN(n) ? null : Math.max(1, Math.min(5, n));
      } else {
        (row as Record<string, string>)[field] = values[c];
      }
    }

    // Must have at least text content
    if (!row.text) continue;

    results.push({
      _key: crypto.randomUUID(),
      author_name: row.author_name || "Anonymous",
      author_title: row.author_title || "",
      author_company: row.author_company || "",
      text: row.text,
      rating: row.rating ?? null,
      source: "csv",
      source_url: row.source_url || "",
    });
  }

  return results;
}

/**
 * Parse pasted plain-text into testimonials (split by blank lines).
 */
function parsePastedText(raw: string): PendingTestimonial[] {
  const blocks = raw
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block) => ({
    _key: crypto.randomUUID(),
    author_name: "",
    author_title: "",
    author_company: "",
    text: block,
    rating: null,
    source: "manual" as const,
    source_url: "",
  }));
}

// ---------------------------------------------------------------------------
// Star rating component
// ---------------------------------------------------------------------------

function StarRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          className="text-muted-foreground transition-colors hover:text-amber-400"
        >
          <Star
            className={`size-4 ${
              value !== null && n <= value
                ? "fill-amber-400 text-amber-400"
                : ""
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab buttons
// ---------------------------------------------------------------------------

const TABS: { id: ImportTab; label: string; icon: typeof Upload }[] = [
  { id: "csv", label: "CSV", icon: Upload },
  { id: "paste", label: "Paste", icon: FileText },
  { id: "url", label: "URL", icon: Link },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ImportPage() {
  const { project } = useProject();

  // Tab state
  const [tab, setTab] = useState<ImportTab>("csv");

  // Input buffers
  const [csvText, setCsvText] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [urlName, setUrlName] = useState("");
  const [urlText, setUrlText] = useState("");
  const [urlRating, setUrlRating] = useState<number | null>(null);

  // Preview list (parsed, ready to import)
  const [pending, setPending] = useState<PendingTestimonial[]>([]);

  // Import state
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // -----------------------------------------------------------------------
  // Parsing
  // -----------------------------------------------------------------------

  const handleParseCsv = useCallback(() => {
    setResult(null);
    const parsed = parseCsv(csvText);
    if (parsed.length === 0) {
      setResult({
        type: "error",
        message:
          "No testimonials found. Make sure your CSV has a header row with recognizable columns (e.g. name, text, rating) and at least one data row.",
      });
      return;
    }
    setPending(parsed);
  }, [csvText]);

  const handleParsePaste = useCallback(() => {
    setResult(null);
    const parsed = parsePastedText(pasteText);
    if (parsed.length === 0) {
      setResult({
        type: "error",
        message: "No testimonials found. Separate testimonials with a blank line.",
      });
      return;
    }
    setPending(parsed);
  }, [pasteText]);

  const handleAddUrl = useCallback(() => {
    setResult(null);
    if (!urlValue.trim()) {
      setResult({ type: "error", message: "Please enter a URL." });
      return;
    }
    if (!urlText.trim()) {
      setResult({
        type: "error",
        message: "Please enter the testimonial text.",
      });
      return;
    }
    const entry: PendingTestimonial = {
      _key: crypto.randomUUID(),
      author_name: urlName.trim() || "Anonymous",
      author_title: "",
      author_company: "",
      text: urlText.trim(),
      rating: urlRating,
      source: "url",
      source_url: urlValue.trim(),
    };
    setPending((prev) => [...prev, entry]);
    setUrlValue("");
    setUrlName("");
    setUrlText("");
    setUrlRating(null);
  }, [urlValue, urlName, urlText, urlRating]);

  // -----------------------------------------------------------------------
  // Editing preview rows
  // -----------------------------------------------------------------------

  function updatePending(key: string, field: keyof PendingTestimonial, value: string | number | null) {
    setPending((prev) =>
      prev.map((p) => (p._key === key ? { ...p, [field]: value } : p))
    );
  }

  function removePending(key: string) {
    setPending((prev) => prev.filter((p) => p._key !== key));
  }

  // -----------------------------------------------------------------------
  // Import all
  // -----------------------------------------------------------------------

  const handleImportAll = useCallback(async () => {
    if (!project || pending.length === 0) return;
    setImporting(true);
    setResult(null);

    const rows = pending.map((p) => ({
      author_name: p.author_name || "Anonymous",
      author_title: p.author_title || "",
      author_company: p.author_company || "",
      text: p.text,
      rating: p.rating,
      source: p.source,
      source_url: p.source_url || "",
    }));

    const response = await importTestimonials(project.id, rows);

    if (response.error) {
      setResult({
        type: "error",
        message: response.error,
      });
    } else {
      setResult({
        type: "success",
        message: `Successfully imported ${response.count} testimonial${response.count === 1 ? "" : "s"}!`,
      });
      setPending([]);
      setCsvText("");
      setPasteText("");
    }

    setImporting(false);
  }, [project, pending]);

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const inputClassName =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30";

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Import Testimonials</h1>
        <p className="text-sm text-muted-foreground">
          Bring in testimonials from CSV files, pasted text, or URLs.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setResult(null);
            }}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        {/* ---- CSV Tab ---- */}
        {tab === "csv" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Paste CSV data
              </label>
              <p className="mb-2 text-xs text-muted-foreground">
                Include a header row with columns like: name, text, rating,
                company, title. Quoted fields are supported.
              </p>
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`name,text,rating,company\n"Jane Doe","Absolutely love this product!",5,"Acme Inc"\n"John Smith","Great experience overall.",4,"Globex"`}
                className={`${inputClassName} font-mono text-xs`}
              />
            </div>
            <button
              onClick={handleParseCsv}
              disabled={!csvText.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Upload className="size-4" />
              Parse CSV
            </button>
          </div>
        )}

        {/* ---- Paste Tab ---- */}
        {tab === "paste" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Paste testimonials
              </label>
              <p className="mb-2 text-xs text-muted-foreground">
                Paste one or more testimonials. Separate each testimonial with a
                blank line. You can edit names and ratings after parsing.
              </p>
              <textarea
                rows={8}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`This product changed our workflow completely. We saved 10 hours a week.\n\nIncredible support team. They responded within minutes and solved our issue right away.\n\nBest investment we made this year. ROI was obvious within the first month.`}
                className={inputClassName}
              />
            </div>
            <button
              onClick={handleParsePaste}
              disabled={!pasteText.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <FileText className="size-4" />
              Parse Text
            </button>
          </div>
        )}

        {/* ---- URL Tab ---- */}
        {tab === "url" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Paste a source URL (tweet, Google review, etc.) and fill in the
              testimonial details. The URL is saved as the source reference.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Source URL
              </label>
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://twitter.com/user/status/123456789"
                className={inputClassName}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Author name
                </label>
                <input
                  type="text"
                  value={urlName}
                  onChange={(e) => setUrlName(e.target.value)}
                  placeholder="Jane Doe"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Rating
                </label>
                <div className="flex h-[42px] items-center">
                  <StarRating value={urlRating} onChange={setUrlRating} />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Testimonial text
              </label>
              <textarea
                rows={3}
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
                placeholder="Paste or type the testimonial content here..."
                className={inputClassName}
              />
            </div>
            <button
              onClick={handleAddUrl}
              disabled={!urlValue.trim() || !urlText.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Link className="size-4" />
              Add to Import List
            </button>
          </div>
        )}
      </div>

      {/* Feedback banner */}
      {result && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-lg border p-4 ${
            result.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
          )}
          <p className="text-sm">{result.message}</p>
          <button
            onClick={() => setResult(null)}
            className="ml-auto shrink-0 text-current opacity-60 hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Preview table */}
      {pending.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">
              Preview ({pending.length} testimonial
              {pending.length === 1 ? "" : "s"})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPending([])}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Clear All
              </button>
              <button
                onClick={handleImportAll}
                disabled={importing || !project}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Import All
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="divide-y divide-border">
            {pending.map((item) => (
              <div
                key={item._key}
                className="group relative grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-[1fr_2fr_auto]"
              >
                {/* Left: author details */}
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Name
                    </label>
                    <input
                      type="text"
                      value={item.author_name}
                      onChange={(e) =>
                        updatePending(item._key, "author_name", e.target.value)
                      }
                      placeholder="Anonymous"
                      className={`${inputClassName} !py-1.5`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Title
                      </label>
                      <input
                        type="text"
                        value={item.author_title}
                        onChange={(e) =>
                          updatePending(
                            item._key,
                            "author_title",
                            e.target.value
                          )
                        }
                        placeholder="CEO"
                        className={`${inputClassName} !py-1.5`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Company
                      </label>
                      <input
                        type="text"
                        value={item.author_company}
                        onChange={(e) =>
                          updatePending(
                            item._key,
                            "author_company",
                            e.target.value
                          )
                        }
                        placeholder="Acme Inc"
                        className={`${inputClassName} !py-1.5`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Rating
                    </label>
                    <StarRating
                      value={item.rating}
                      onChange={(v) => updatePending(item._key, "rating", v)}
                    />
                  </div>
                  {item.source_url && (
                    <p className="truncate text-xs text-muted-foreground">
                      <Link className="mr-1 inline size-3" />
                      {item.source_url}
                    </p>
                  )}
                </div>

                {/* Center: testimonial text */}
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Testimonial
                  </label>
                  <textarea
                    rows={4}
                    value={item.text}
                    onChange={(e) =>
                      updatePending(item._key, "text", e.target.value)
                    }
                    className={`${inputClassName} !py-1.5`}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Source: {item.source}
                  </p>
                </div>

                {/* Right: actions */}
                <div className="flex items-start sm:pt-5">
                  <button
                    onClick={() => removePending(item._key)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                    title="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no preview items and no result */}
      {pending.length === 0 && !result && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <Pencil className="mx-auto mb-3 size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {tab === "csv"
              ? "Paste your CSV above and click Parse to preview testimonials."
              : tab === "paste"
                ? "Paste testimonials above and click Parse to preview them."
                : "Add testimonials from URLs. They will appear here for review before importing."}
          </p>
        </div>
      )}
    </div>
  );
}
