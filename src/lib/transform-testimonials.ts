import { type Testimonial } from "@/data/sample-testimonials";

/** DB testimonial row (from Supabase) */
export interface DbTestimonial {
  id: string;
  author_name: string;
  author_title: string | null;
  author_company: string | null;
  author_photo: string | null;
  text: string;
  rating: number | null;
  status: string;
  source: string;
  created_at: string;
  tags: { id: string; name: string; color: string }[];
}

/** Transform a DB testimonial into the Testimonial shape used by showcase components */
export function toShowcaseTestimonial(t: DbTestimonial): Testimonial {
  return {
    id: t.id,
    authorName: t.author_name,
    authorTitle: t.author_title ?? "",
    authorCompany: t.author_company ?? "",
    authorPhoto: t.author_photo ?? "",
    text: t.text,
    rating: t.rating ?? 5,
    tags: (t.tags ?? []).map((tag) => tag.name),
    createdAt: t.created_at,
  };
}
