"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: {
    id: string;
    author_name: string;
    author_title: string | null;
    author_company: string | null;
    author_photo: string | null;
    text: string;
    rating: number | null;
    source: string;
  } | null;
  onSaved: () => void;
}

export function AddTestimonialDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const { project } = useProject();
  const [saving, setSaving] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [authorCompany, setAuthorCompany] = useState("");
  const [authorPhoto, setAuthorPhoto] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (editing) {
      setAuthorName(editing.author_name);
      setAuthorTitle(editing.author_title ?? "");
      setAuthorCompany(editing.author_company ?? "");
      setAuthorPhoto(editing.author_photo ?? "");
      setText(editing.text);
      setRating(editing.rating ?? 5);
    } else {
      setAuthorName("");
      setAuthorTitle("");
      setAuthorCompany("");
      setAuthorPhoto("");
      setText("");
      setRating(5);
    }
  }, [editing, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!project || !authorName.trim() || !text.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const payload = {
      author_name: authorName.trim(),
      author_title: authorTitle.trim() || null,
      author_company: authorCompany.trim() || null,
      author_photo: authorPhoto.trim() || null,
      text: text.trim(),
      rating,
      project_id: project.id,
      source: "manual" as const,
    };

    if (editing) {
      await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", editing.id);
    } else {
      await supabase.from("testimonials").insert({
        ...payload,
        status: "approved",
      });
    }

    setSaving(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Testimonial" : "Add Testimonial"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Rating */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-6 ${
                      i < (hoverRating || rating)
                        ? "fill-accent text-accent"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Testimonial text */}
          <div>
            <label htmlFor="text" className="mb-1.5 block text-sm font-medium">
              Testimonial
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did they say?"
              required
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Author info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
                Title / Role
              </label>
              <input
                id="title"
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
                placeholder="CEO"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="company" className="mb-1.5 block text-sm font-medium">
                Company
              </label>
              <input
                id="company"
                value={authorCompany}
                onChange={(e) => setAuthorCompany(e.target.value)}
                placeholder="Acme Inc"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label htmlFor="photo" className="mb-1.5 block text-sm font-medium">
                Photo URL
              </label>
              <input
                id="photo"
                value={authorPhoto}
                onChange={(e) => setAuthorPhoto(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save Changes" : "Add Testimonial"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
