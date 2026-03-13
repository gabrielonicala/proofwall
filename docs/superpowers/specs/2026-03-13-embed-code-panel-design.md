# Embed Code Panel + View Tracking

## Summary

Expand the wall builder's `EmbedCodePanel` from a single HTML/JS textarea into a tabbed panel with 4 embed methods and syntax-highlighted code blocks. Wire up server-side view tracking in the embed route.

## Scope

### 1. Tabbed Embed Code Panel

Replace `EmbedCodePanel` in `src/app/dashboard/walls/[id]/page.tsx`.

**4 tabs:**

| Tab | Snippet | Notes |
|-----|---------|-------|
| HTML/JS | `<div data-proofwall="ID">` + `<script src="/embed.js">` | Current behavior, default tab |
| iFrame | `<iframe src="/embed/ID" ...>` | Self-contained, no JS needed |
| React | Functional component wrapping the iframe | For React/Next.js users |
| Preview Link | Plain URL: `https://domain/embed/ID` | Labeled as preview, note about domain restrictions |

**Code display:**
- Custom syntax highlighting via regex (no external library) — color HTML tags, attributes, strings, comments
- Dark background (`bg-[#0d0d12]`), monospace font (JetBrains Mono)
- Copy button per tab with "Copied!" feedback
- Brief usage hint below each snippet

**Fits within:** The existing `Section` component in the left config panel. No new pages or modals.

### 2. View Tracking

**Location:** `/src/app/embed/[id]/page.tsx`

**Mechanism:**
- After successful wall fetch + domain check, insert a row into `wall_views`
- Fields: `wall_id`, `viewed_at` (default now()), `referrer` (from headers)
- Fire-and-forget — don't block render, don't await the insert
- One view per page load (simple, privacy-friendly)

**Existing infrastructure:** The `wall_views` table already exists in the database schema. The analytics page already reads from it.

## Files Changed

| File | Change |
|------|--------|
| `src/app/dashboard/walls/[id]/page.tsx` | Replace `EmbedCodePanel` with tabbed version |
| `src/app/embed/[id]/page.tsx` | Add `wall_views` insert after domain check |

## Security

- Domain locking applies equally to all embed methods (browser sends parent page referer regardless of snippet format)
- Preview Link tab includes note that domain restrictions apply when embedded
- `isDomainAllowed` allows no-referer access (direct browser visits) by design
- View tracking uses server-side Supabase client, no new public endpoints
