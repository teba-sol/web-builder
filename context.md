# Web builder — app context

React SPA in this directory. Port **5173**. It is the product customers and salespeople use to design a site and download a ZIP.

Shared product rules (roles, paywall, CRS privacy, who may edit) live in [`../context.md`](../context.md). This file is how **this app** is built. Procedure for a change: [`skill.md`](skill.md).

## What this app owns

- Marketing pages, auth screens, template gallery, editor, preview, and the chromeless site.
- Template design manifests and the live React renderers.
- The site document (`SiteContent` + template snapshot) and `localStorage` drafts.
- Client-side ZIP generation: static HTML and a generated Laravel + Filament tree.
- Calls to the platform API for auth, projects, billing, and CRS keys. It does not decide paywall or ownership. It reads `canExport`, `canCloudSave`, and `canEdit` from the API and enforces the same flags in the UI.

The generated Laravel app is output inside the ZIP. It is not a running app in this repo.

## Run and talk to the API

`vite.config.ts` proxies `/api` to `http://localhost:8080`. Do not hard-code the API host in feature code. Use `apiFetch` from `src/api/client.ts`.

Tokens live in `localStorage` under `buildoura.accessToken` and `buildoura.refreshToken`. A 401 retries once after `POST /api/v1/auth/refresh`. Errors throw `ApiError` with `status`, `code`, and `message`.

Env used by this app:

- `VITE_ADMIN_ORIGIN` — agency portal link on the review home. Default `http://localhost:5174`.

## Routes

Declared in `src/App.tsx`.

| Path | Page | Gate |
|------|------|------|
| `/` | `HomePage` | Logged out: landing. Consumer: gallery. Salesperson: workspace. Agency or platform admin: review table |
| `/about`, `/pricing` | marketing | public |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | auth | public |
| `/handoff` | consume admin handoff code | public |
| `/account` | profile | `RequireAuth` |
| `/new-site` | client + template wizard | `RequireAuth`. Redirects away unless salesperson or agency admin |
| `/pick-template` | embeddable host picker | public. Contract in `src/data/pickTemplate.ts` |
| `/billing/sandbox` | finish sandbox checkout | public page |
| `/demo/:templateId/*` | walkthrough | public |
| `/editor/:templateId/*` | editor | `RequireAuth`. `?project=` loads a cloud draft. `?mode=view` is read-only |
| `/preview/:templateId/*` | preview chrome | `RequireAuth` |
| `/site/:templateId/*` | real multi-page render | public. `?chromeless=true` hides builder chrome |

Nested site paths (about, services, portfolio, gallery, blog, news, contact, rooms, book) are inside `src/templates/SiteApp.tsx`, not extra `App.tsx` routes.

## State

`src/context/WebsiteContext.tsx` is the editor store: template id, `SiteContent`, color scheme, layout variant, and the bound project flags.

- Editing stays in memory until explicit Save. `persistNow` PUTs the full site document and updates local storage only after success. There is no autosave timer.
- `hasUnsavedChanges` compares content, template, palette, and layout with the last initialized or saved snapshot. Save failures preserve that state; discard restores the snapshot. The editor blocks exit navigation and warns on tab close/refresh.
- `bindProject` prefers `project.document` (a site document). The top-level `layoutVariantId` column is only a fallback when the document has no content. The API currently ignores the top-level layout field on create and save and keeps the stored column. The document JSON is the copy the editor restores. Do not “fix” that API null unless the task is to persist the column again.
- `bindProject(project, true)` attaches newly created project permissions without replacing in-flight edits. A successful creation is bound before the first PUT, so retries reuse its id.

`SiteContent` is `src/types/index.ts`. It is words and media, not design. Design (which sections exist, theme, schemes, nav shell, hero) is the template manifest.

Site document shape (`src/siteDocument/types.ts`): `schemaVersion: 1`, `kind: "webbuilder-site"`, template id, color scheme, layout variant, `content`, and a template snapshot so restore works if that template is not in the local catalog.

## Templates

Manifests: `src/catalog/manifests/<id>.json`. Loaded by `import.meta.glob` in `src/catalog/catalog.ts` and checked by `src/catalog/validate.ts`. A manifest may only reference engines listed in `src/catalog/vocab.ts` (categories, features, section ids, nav shells, page layouts). Unknown tokens fail the catalog load.

`TemplateId` is a string. Do not add a union of ids.

Two features exist: `cms` and `hospitality`. `isHospitalityTemplate` in `src/data/hospitality.ts` means the manifest includes `hospitality`. The hospitality catalog is six templates: `hotel`, `guesthouse`, `alpine`, `coastal`, `jungle`, `ryokan`. The id is the stable code. The display name is an international hotel or guest-house name.

`footerBlurb` and `footerNote` are site content. Preview, static HTML, and the Laravel footer render them, along with hours and contact details. The exported Filament Site Settings form edits the footer, page visibility, section visibility, and the section titles the public site already reads.

Thumbnails: `src/assets/hero-sections/<id>.png`, resolved by `src/catalog/thumbnails.ts`.

Live render path: `TemplateRenderer` → per-template shells in `src/templates/` → `SiteApp` for inner pages. Section layout components live in `src/templates/sectionLayouts.tsx` and `PageLayoutSections.tsx`.

## Editor UX by role

`src/pages/EditorPage.tsx`:

- No `?project=` and the user is a consumer: resume the latest owned project for the template, or initialize an unsaved template. Only explicit Save (or an unlock/export action) creates a new project. Hospitality templates are not offered. `useHospitalityTemplateGuard` sends the browser home.
- The personal gallery uses `templatesForPersonalAccount`. Salesperson and agency `/new-site` still lists hospitality templates.
- No `?project=` and the user is a salesperson or agency admin: redirect to `/new-site?template=`.
- `?mode=view` or `canEdit === false`: read-only. Hide the form.
- `canExport === false`: show the lock badge and open `PaywallModal` instead of downloading. Salesperson copy is “Contact us — export locked”. Consumer copy is “Unpaid — export locked”.
- Cloud save button calls `persistNow`, which throws if `canCloudSave` is false.

`/new-site` (`src/pages/NewSitePage.tsx`) collects a client (existing or new, with an Ethiopian phone), a business type, and a template, then creates the project.

## Export

Entry: `src/components/DownloadButton.tsx` → `src/export/downloadZip.ts`.

Order:

1. If the template is hospitality and a project id exists, cloud-save, then `POST /api/v1/projects/{id}/crs-credentials`.
2. `buildAllSitePages` → `frontend/` HTML and assets.
3. `generateBackend` → `backend/` Laravel 11 + Filament 3.
4. `site.json` at the ZIP root.
5. On success, `POST /api/v1/projects/{id}/export-event` (failure of this call does not undo the download).

Booking split inside `src/export/backend/generateBackend.ts`:

- `hotel` and `guesthouse` use `generateCrsBooking.ts`. Env keys `BUILDAURA_API_URL`, `BUILDAURA_HOTEL_ID`, `BUILDAURA_API_KEY`.
- Any other template uses `generateBooking.ts`, and only when the rooms page is visible and at least one room type has a name. Env keys `CRS_API_URL`, `CRS_API_KEY`, `CRS_HOTEL_ID`.
- Both clients talk to this platform API. Guest name, email, phone, and payment stay in the generated Laravel database. The static `frontend/` folder does not take bookings.

A content or section change that is visible in the editor must be applied in the React preview **and** in `src/export/` (static HTML and, when the field is stored in Laravel, the backend generator). Missing one of those is a broken feature.

## API modules in this app

| File | Calls |
|------|--------|
| `src/api/client.ts` | `apiFetch`, token storage |
| `src/api/auth.ts` | register, login, refresh, logout, password reset, handoff |
| `src/api/projects.ts` | list, create, get, save, export event, CRS credentials |
| `src/api/billing.ts` | pricing, website billing, checkout, sandbox complete |
| `src/api/clients.ts` | agency client list and create |
| `src/api/types.ts` | response types. Keep them aligned with the OpenAPI spec in the API repo |

## Where a change usually starts

| Goal | Start |
|------|--------|
| New editor field | `src/types/index.ts` `SiteContent`, manifest defaults, `ContentForm.tsx`, preview section, `src/export/sectionExport.ts` and the Laravel field if Filament should edit it |
| New list block | `src/data/listDefaults.ts`, `ContentForm`, preview, export |
| Turn a page or section on or off | `PageVisibility` / `SectionVisibility`, `PageVisibilityPicker`, `SectionVisibilityPicker`, `SiteApp` routes, export nav |
| New template | `src/catalog/manifests/<id>.json` using existing vocab, thumbnail, hospitality room defaults only if the feature is `hospitality` |
| New color or layout | manifest `colorSchemes` / layout presets in `src/data/layoutVariants.ts`. Both preview (`getTheme`) and export must read them |
| New marketing section | `src/components/landing/` and `LandingPage.tsx` only. Do not touch editor state |
| New API-backed screen | route in `App.tsx`, page under `src/pages/`, function in `src/api/` |
| Paywall copy or checkout UX | `PaywallModal.tsx`, `SandboxBillingPage.tsx`. Do not unlock export in the client without `canExport` from the API |
