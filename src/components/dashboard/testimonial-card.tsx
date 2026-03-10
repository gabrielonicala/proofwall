"use client";

import {
  Star,
  MoreVertical,
  CheckCircle,
  Clock,
  Award,
  Archive,
  Pencil,
  Trash2,
  Tag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type TagData = { id: string; name: string; color: string };

interface Props {
  testimonial: {
    id: string;
    author_name: string;
    author_title: string | null;
    author_company: string | null;
    author_photo: string | null;
    text: string;
    rating: number | null;
    status: "pending" | "approved" | "featured" | "archived";
    source: string;
    created_at: string;
    tags: TagData[];
  };
  tags: TagData[];
  viewMode: "grid" | "list";
  onStatusChange: (id: string, status: "pending" | "approved" | "featured" | "archived") => void;
  onDelete: (id: string) => void;
  onTagToggle: (testimonialId: string, tagId: string) => void;
  onEdit: () => void;
}

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-500 bg-amber-500/10" },
  approved: { label: "Approved", icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
  featured: { label: "Featured", icon: Award, color: "text-primary bg-primary/10" },
  archived: { label: "Archived", icon: Archive, color: "text-muted-foreground bg-muted" },
};

export function TestimonialCard({
  testimonial: t,
  tags,
  viewMode,
  onStatusChange,
  onDelete,
  onTagToggle,
  onEdit,
}: Props) {
  const status = statusConfig[t.status];
  const StatusIcon = status.icon;

  const statusBadge = (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
      <StatusIcon className="size-3" />
      {status.label}
    </span>
  );

  const stars = t.rating ? (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < t.rating! ? "fill-accent text-accent" : "text-muted"}`}
        />
      ))}
    </div>
  ) : null;

  const tagPills = t.tags.length > 0 && (
    <div className="flex flex-wrap gap-1">
      {t.tags.map((tag) => (
        <span
          key={tag.id}
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: tag.color + "20", color: tag.color }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );

  const actionMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 size-3.5" /> Edit
        </DropdownMenuItem>
        {t.status !== "approved" && (
          <DropdownMenuItem onClick={() => onStatusChange(t.id, "approved")}>
            <CheckCircle className="mr-2 size-3.5" /> Approve
          </DropdownMenuItem>
        )}
        {t.status !== "featured" && (
          <DropdownMenuItem onClick={() => onStatusChange(t.id, "featured")}>
            <Award className="mr-2 size-3.5" /> Feature
          </DropdownMenuItem>
        )}
        {t.status !== "archived" && (
          <DropdownMenuItem onClick={() => onStatusChange(t.id, "archived")}>
            <Archive className="mr-2 size-3.5" /> Archive
          </DropdownMenuItem>
        )}
        {t.status !== "pending" && (
          <DropdownMenuItem onClick={() => onStatusChange(t.id, "pending")}>
            <Clock className="mr-2 size-3.5" /> Set Pending
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(t.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 size-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const tagButton = (
    <Popover>
      <PopoverTrigger className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        <Tag className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-2">
        <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">Tags</p>
        {tags.map((tag) => {
          const active = t.tags.some((tt) => tt.id === tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => onTagToggle(t.id, tag.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                active ? "bg-muted font-medium" : "hover:bg-muted/50"
              }`}
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
              {active && <CheckCircle className="ml-auto size-3 text-success" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );

  if (viewMode === "list") {
    return (
      <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
        {t.author_photo && (
          <img
            src={t.author_photo}
            alt={t.author_name}
            className="size-10 flex-shrink-0 rounded-full bg-muted"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium">{t.author_name}</span>
            {t.author_title && (
              <span className="text-xs text-muted-foreground">
                {t.author_title}
                {t.author_company && `, ${t.author_company}`}
              </span>
            )}
            {statusBadge}
          </div>
          {stars}
          <p className="mt-1 text-sm leading-relaxed text-foreground/80 line-clamp-2">
            {t.text}
          </p>
          {tagPills && <div className="mt-2">{tagPills}</div>}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          {tagButton}
          {actionMenu}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {statusBadge}
          {stars}
        </div>
        <div className="flex items-center gap-1">
          {tagButton}
          {actionMenu}
        </div>
      </div>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/80 line-clamp-6">
        {t.text}
      </p>
      {tagPills && <div className="mb-3">{tagPills}</div>}
      <div className="mt-auto flex items-center gap-3 border-t border-border pt-3">
        {t.author_photo && (
          <img
            src={t.author_photo}
            alt={t.author_name}
            className="size-8 rounded-full bg-muted"
          />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{t.author_name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[t.author_title, t.author_company].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
