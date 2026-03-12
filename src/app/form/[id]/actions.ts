"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

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

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (per-IP, resets on server restart)
// For production, use Redis or similar
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // max 5 submissions per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

// Periodic cleanup to prevent memory leak (run every 100 calls)
let callCount = 0;
function cleanupRateLimitMap() {
  callCount++;
  if (callCount % 100 !== 0) return;
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function sanitizeString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Submit testimonial
// ---------------------------------------------------------------------------

export async function submitTestimonial(data: SubmitData) {
  cleanupRateLimitMap();

  // Rate limiting
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return { error: "Too many submissions. Please try again in a minute." };
  }

  // Input validation
  const authorName = sanitizeString(data.authorName || "Anonymous", 200);
  const text = sanitizeString(data.text, 5000);

  if (!text) {
    return { error: "Testimonial text is required." };
  }

  const authorTitle = data.authorTitle
    ? sanitizeString(data.authorTitle, 200)
    : null;
  const authorCompany = data.authorCompany
    ? sanitizeString(data.authorCompany, 200)
    : null;

  // Validate rating
  let rating: number | null = null;
  if (data.rating !== undefined && data.rating !== null) {
    const r = Math.round(Number(data.rating));
    if (r >= 1 && r <= 5) {
      rating = r;
    }
  }

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
    author_name: authorName,
    author_title: authorTitle,
    author_company: authorCompany,
    author_photo: null, // Photo upload not yet implemented
    text,
    rating,
    source: "form" as const,
    status: "pending" as const,
    source_url: data.formId,
  });

  if (error) {
    return { error: "Failed to submit. Please try again." };
  }

  return { success: true };
}
