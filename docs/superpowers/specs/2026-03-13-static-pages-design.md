# Static Pages: Privacy Policy, Terms of Service, Documentation

## Summary

Three static content pages to fill out the footer links and provide real value for users and SEO.

## Pages

### 1. Privacy Policy (`/privacy`)
- Standard SaaS privacy policy with ProofWall-specific details
- Covers: data collected (account info, testimonial content, analytics view counts), Supabase hosting, cookies (auth only), third-party services, data retention, user rights (deletion, export), contact info
- Clean typography, centered max-w-3xl layout

### 2. Terms of Service (`/terms`)
- Standard SaaS terms with ProofWall-specific details
- Covers: account responsibilities, acceptable use, testimonial content ownership, embed usage rights, free vs paid plan terms, limitation of liability, termination
- Same layout as privacy page

### 3. Documentation (`/docs`)
- Real content organized in sections with sidebar navigation:
  - Getting Started — signup, create project, first testimonial
  - Collecting Testimonials — forms, manual entry, paste-to-import, CSV
  - Managing Testimonials — tags, status workflow, filtering
  - Creating Walls — showcase styles, wall builder, config options
  - Embedding Walls — HTML/JS, iFrame, React, domain restrictions
  - Analytics — view tracking, interpreting data
- Single-page layout with anchor links (better SEO than fragmented pages)
- Sidebar nav on left, content on right

### Shared
- All pages use marketing navbar + footer
- Update footer links from "#" to real routes
- Dark theme, consistent with existing marketing pages

## Files to Create
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/docs/page.tsx`

## Files to Modify
- `src/components/landing/footer.tsx` — update link hrefs
