# E2E Testing Suite — Design Spec

## Goal

Add comprehensive Playwright E2E tests covering all user flows, public pages, API endpoints, embeds, billing, and security. Run locally against `localhost:3000` with real Supabase and Stripe test mode.

## Architecture

**Framework:** Playwright (Chromium only, add browsers later)
**Auth strategy:** Global setup creates a test user via Supabase Admin API (`email_confirm: true`), logs in via browser, saves auth state to `e2e/auth.setup.json`. Dashboard tests reuse saved state. Auth-specific tests run without saved state.
**Stripe:** Real Stripe test mode with test cards (`4242424242424242`). Requires existing test keys in `.env.local`.
**CI:** None — local only (`npx playwright test`).
**Cleanup:** Global teardown deletes test-created data via Supabase service role client.

## Test User

Created in global setup via Supabase Admin API:
- Email: from `TEST_USER_EMAIL` env var (default: `e2e-test@laudica.com`)
- Password: from `TEST_USER_PASSWORD` env var
- Name: from `TEST_USER_NAME` env var
- Email confirmation bypassed with `email_confirm: true`

If user already exists, global setup falls back to login.

Auth tests that test the signup UI use a throwaway email pattern (`e2e-signup-{timestamp}@laudica.com`) and verify the "Check your email" success state without completing verification.

## File Structure

```
e2e/
  global-setup.ts          # Create/login test user, save auth state
  global-teardown.ts       # Clean up test data via Supabase admin
  auth.setup.json          # Saved browser state (gitignored)
  helpers/
    test-utils.ts          # Shared helpers (create testimonial, create wall, etc.)
  tests/
    public-pages.spec.ts   # Landing, docs, integrations, privacy, terms
    auth.spec.ts           # Signup, login, logout, forgot-password, redirects
    dashboard.spec.ts      # Dashboard home, navigation, stats
    testimonials.spec.ts   # CRUD, filtering, tagging, status changes
    import-export.spec.ts  # CSV/Paste/URL import, export download
    walls.spec.ts          # CRUD, builder config, preview, embed code
    forms.spec.ts          # CRUD, field config, public form submission
    billing.spec.ts        # Stripe checkout, portal, plan limits
    settings.spec.ts       # Project settings, team management
    analytics.spec.ts      # Analytics page, view tracking
    embed.spec.ts          # Wall embeds + form embeds rendering
    api.spec.ts            # Public API endpoint, export endpoint
    security.spec.ts       # Headers, redirects, noindex, framing

playwright.config.ts       # Top-level config
```

### Playwright Config

- `webServer`: auto-starts `next dev` on port 3000
- `globalSetup` / `globalTeardown`: point to setup/teardown scripts
- Projects: single Chromium project using saved auth state for dashboard tests, a second "no-auth" project for auth and public page tests
- Parallel across files, serial within each file
- Retry: 1 (flaky network tolerance)
- Timeout: 30s per test, 60s for billing tests (Stripe redirect)

### Helpers (`test-utils.ts`)

Reusable actions to keep tests DRY:
- `createTestimonial(page, fields)` — fills and submits the add testimonial dialog
- `createWall(page, name, style)` — creates a wall from the walls page
- `createForm(page, name)` — creates a collection form
- `deleteTestimonial(page, name)` — deletes a testimonial by name
- `deleteWall(page, name)` — deletes a wall by name
- `deleteForm(page, name)` — deletes a form by name
- `expectToastMessage(page, text)` — asserts a toast/success message appears
- `supabaseAdmin()` — returns Supabase client with service role key for direct DB operations

## Test Coverage

### `public-pages.spec.ts` (~10 tests)
- Each public page loads without error (landing, docs, integrations x5, privacy, terms)
- Navbar links navigate correctly
- Footer links navigate correctly
- SEO meta tags present (title, description, canonical, OG)
- JSON-LD structured data renders in page source

### `auth.spec.ts` (~12 tests)
- Signup form validates inputs and shows "Check your email" on success
- Login with valid credentials redirects to dashboard
- Login with invalid credentials shows error message
- Forgot password flow shows confirmation message
- Logged-in user redirected away from `/login`
- Logged-in user redirected away from `/signup`
- Logout returns to landing page
- Unauthenticated access to `/dashboard` redirects to `/login`
- Google OAuth button visible and initiates redirect on login page
- Google OAuth button visible and initiates redirect on signup page
- `/auth/callback` without code redirects to `/login?error=auth`
- `/auth/callback` with invalid code redirects to `/login?error=auth`

### `dashboard.spec.ts` (~5 tests)
- Dashboard loads with stats cards visible
- Sidebar navigation links to all dashboard sections
- Each sidebar link loads correct page
- Pending testimonials widget renders
- Quick approve/reject buttons on pending items work

### `testimonials.spec.ts` (~12 tests)
- Create testimonial via dialog with all fields
- Created testimonial appears in list
- Edit testimonial (change text, author)
- Delete testimonial with confirmation dialog
- Filter by status: pending, approved, featured, archived
- Search by author name
- Search by company
- Toggle grid/list view
- Create a tag
- Assign tag to testimonial
- Change status: approve, feature, archive
- Plan limit enforcement (shows upgrade prompt when at limit)

### `import-export.spec.ts` (~8 tests)
- Import page loads with CSV/Paste/URL tabs visible
- CSV paste creates testimonials
- Paste-to-import creates testimonials
- URL import creates testimonial with source URL
- Invalid data shows validation errors
- Export returns 403 on Free plan
- Export CSV triggers file download (requires Business plan — elevated via Supabase admin `beforeAll`)
- Export JSON triggers file download (requires Business plan — elevated via Supabase admin `beforeAll`)

### `walls.spec.ts` (~11 tests)
- Create new wall with name and style selection
- Wall builder page loads with configuration panel
- Change showcase style
- Change theme (light/dark)
- Change sort order
- Set max testimonials limit
- Apply tag filter
- Preview panel updates with config changes
- Embed code tab shows iframe, script, and React snippets
- Activate/deactivate wall toggle
- Delete wall with confirmation

### `forms.spec.ts` (~8 tests)
- Create new collection form
- Configure form fields (toggle required, reorder)
- Add custom field
- Set welcome message, thank-you message, accent color
- Public form page loads at `/form/[id]`
- Submit testimonial through public form with all fields
- Submitted testimonial appears in dashboard with "pending" status
- Deactivated form shows inactive message

### `billing.spec.ts` (~6 tests)
- Billing page shows current plan
- Upgrade to Pro triggers Stripe checkout
- Complete Stripe checkout with test card `4242424242424242`
- After checkout, billing page reflects new plan
- Manage subscription button opens Stripe portal
- Plan limit enforcement: wall/form/testimonial creation blocked at free limits with upgrade prompt

### `settings.spec.ts` (~5 tests)
- Update project name
- Update project website URL
- Team members list shows current user as owner
- Invite team member (enter email + select role)
- Delete project requires typing project name to confirm

### `analytics.spec.ts` (~3 tests)
- Analytics page loads
- Stats display (wall views, testimonial count)
- View count increments after visiting an embed page

### `embed.spec.ts` (~8 tests)
Wall embeds:
- Embed page renders selected showcase style with testimonials
- Respects theme setting (light/dark)
- "Powered by Laudica" branding shown on free plan
- Inactive wall embed shows nothing / error state
- Resize postMessage sent to parent frame

Form embeds:
- Public form loads and renders configured fields
- Form submission works and creates pending testimonial
- Deactivated form shows inactive state

### `api.spec.ts` (~4 tests)
- `GET /api/v1/testimonials` returns testimonial data with valid auth
- Returns 401 without auth header
- Returns 403 when project is not on Business plan
- `GET /api/export` returns CSV/JSON file download with valid auth (Business plan required — elevated via admin)

Note: Stripe webhook endpoint (`POST /api/stripe/webhook`) requires Stripe CLI forwarding for signature verification and is out of scope for this suite. The checkout flow in `billing.spec.ts` covers the user-facing Stripe integration.

### `security.spec.ts` (~7 tests)
- Response includes `Content-Security-Policy` header
- Response includes `X-Content-Type-Options: nosniff`
- Response includes `Referrer-Policy: strict-origin-when-cross-origin`
- Dashboard routes redirect to `/login` when unauthenticated
- Auth pages have `noindex` robots meta tag
- Wall embed pages (`/embed/[id]`) do NOT have `X-Frame-Options` (allow framing)
- Public form pages (`/form/[id]`) do NOT have `X-Frame-Options` (allow framing — if middleware needs fixing, flag it)

## Total: ~100 tests

## Dependencies

- `@playwright/test` (dev dependency)
- `@supabase/supabase-js` (already installed — used in global setup/teardown for admin operations)

## Environment Variables (added to `.env.local`)

```
TEST_USER_EMAIL=e2e-test@laudica.com
TEST_USER_PASSWORD=TestPass123!
TEST_USER_NAME=E2E Test User
```

Existing Stripe test keys and Supabase keys are reused as-is.

## Gitignore Additions

```
e2e/auth.setup.json
test-results/
playwright-report/
```
