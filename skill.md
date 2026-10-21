# Web builder — connections and implementation

This file is the implementation guide for the `web-builder-exp` repo. Stay inside this repo. Wire new work through the modules below.

## How the repo connects

```text
App.tsx routes
  → pages/ and components/
    → WebsiteContext          editor state, localStorage, cloud save
    → catalog/manifests       template design
    → templates/              live site render
    → export/                 ZIP (static HTML + generated Laravel)
    → api/*                   platform HTTP
      → api/client.ts         apiFetch, bearer token, one refresh retry
```

- Browser calls are relative (`/api/v1/...`). `vite.config.ts` proxies `/api` to the platform API. Do not hard-code a host in feature code.
- Tokens: `localStorage` keys `buildoura.accessToken` and `buildoura.refreshToken`.
- Failures throw `ApiError` (`status`, `code`, `message`). Show `error.message`.
- Editor state lives only in `src/context/WebsiteContext.tsx`. Content fields use `updateContent` or the list helpers in `src/data/listDefaults.ts`.
- Every edit is stored by `src/utils/storage.ts`. When `projectId` and `canCloudSave` are set, `WebsiteContext` PUTs the site document from `src/siteDocument/io.ts` after 2.5 seconds.
- `bindProject` restores from `project.document` when that document has `content`. Layout variant is inside that document.
- `canExport`, `canCloudSave`, and `canEdit` come from the project response. The UI reads them. It does not decide them.
- `VITE_ADMIN_ORIGIN` is only the link from the review home back to the agency portal. Default `http://localhost:5174`.

API modules:

| File | Use |
|------|-----|
| `src/api/client.ts` | `apiFetch` |
| `src/api/auth.ts` | register, login, refresh, logout, password reset, handoff |
| `src/api/projects.ts` | list, create, get, save draft, export event, CRS credentials |
| `src/api/billing.ts` | pricing, website billing, checkout, sandbox complete |
| `src/api/clients.ts` | list and create agency clients |
| `src/api/types.ts` | response types |

Routes are `src/App.tsx`. Nested site pages (about, services, rooms, book, and the rest) are `src/templates/SiteApp.tsx`, not extra routes.

Role homes are `src/pages/HomePage.tsx`: logged out → `LandingPage`; salesperson → `SalespersonHome`; agency admin or platform admin → `AgencyReviewHome`; consumer → gallery. Editor behavior is `src/pages/EditorPage.tsx`.

## Implement a content field

A field the customer edits is `SiteContent` in `src/types/index.ts`. Design (section order, theme, nav, hero) stays on the template manifest, not on `SiteContent`.

1. Add the property next to similar fields. Prices and counts that the form edits are strings, matching `RoomTypeItem`.
2. Default it in the manifest `defaults` and in `src/data/defaults.ts` or `src/data/richDefaults.ts` when those still build the empty site.
3. Teach `src/utils/migrateContent.ts` so an older saved draft still opens.
4. Add the control in `src/components/ContentForm.tsx` or a sibling picker. Reuse `ImagePicker`, `ColorSchemePicker`, `PageVisibilityPicker`, and `SectionVisibilityPicker`.
5. Render it in the template section that already draws that block (`src/templates/`).
6. Emit it from static export (`src/export/sectionExport.ts` and the page builder it feeds). If the generated Laravel admin stores it, add it in `src/export/backend/generateBackend.ts` (model, migration, Filament) and the Blade partial.

List blocks (`services`, `team`, `roomTypes`, and the rest) go through `src/data/listDefaults.ts`. Keep `LIST_MIN_COUNT` and `LIST_MAX_COUNT`.

The field is done when this path works: form → `WebsiteContext` → `localStorage` → site document → live preview → static HTML → Laravel seed when the backend stores it.

## Implement a template

Templates are JSON files, not a TypeScript union. `TemplateId` is a string.

1. Add `src/catalog/manifests/<id>.json` with `schemaVersion: 1`. Tokens must already be allowed by `src/catalog/validate.ts` and `src/catalog/vocab.ts`.
2. Put default copy in `defaults`, including `pageVisibility` and `sectionVisibility`.
3. Add `src/assets/hero-sections/<id>.png` when the gallery thumbnail is expected. Resolution is `src/catalog/thumbnails.ts`.
4. Reuse an existing nav shell, hero, and page layout. A new shell needs a renderer in `src/templates/`, an export branch, and a vocab entry. A manifest token the preview cannot draw is invalid. `src/catalog/catalog.ts` throws on invalid manifests.
5. Room templates include the feature `hospitality` and room defaults in `src/data/hospitality.ts`. `isHospitalityTemplate` checks that feature, not the category string.

Imported templates stored under `webbuilder-imported-templates` must keep loading. The bundled glob is not the only catalog.

`site.json` is `buildSiteDocument` in `src/siteDocument/io.ts` (`kind: "webbuilder-site"`, `schemaVersion` from `src/siteDocument/types.ts`). Bump `SITE_DOCUMENT_SCHEMA_VERSION` only when old documents cannot be read, and accept the previous shape in `src/siteDocument/validate.ts` or `migrateContent`.

## Implement preview and export together

Visitor-visible work updates both renders.

- Live: `src/templates/TemplateRenderer.tsx`, `SiteApp.tsx`, `sectionLayouts.tsx`, `PageLayoutSections.tsx`.
- Static ZIP: `src/export/buildSitePages.ts`, `sectionExport.ts`, `navExport.ts`, `seoExport.ts`, `homePageExport.ts`.
- Laravel ZIP: `src/export/backend/generateBackend.ts`, `generateBlade.ts`, `generateFilament.ts`.

`src/export/downloadZip.ts` writes `frontend/`, `backend/`, `site.json`, and `README.txt`.

Booking files:

- `usesBuildauraCrs` is true only for `hotel` and `guesthouse`. Those files come from `generateCrsBooking.ts` and use `BUILDAURA_API_URL`, `BUILDAURA_HOTEL_ID`, `BUILDAURA_API_KEY`.
- Every other template uses `generateBooking.ts` when the rooms page is on and at least one room type has a name. Those files use `CRS_API_URL`, `CRS_API_KEY`, `CRS_HOTEL_ID`.
- Do not add a third booking generator. Extend one of those two.
- Guest name, email, phone, and payment stay in the generated Laravel app. Credential and occupancy calls send room, dates, and confirmation code only.

Hospitality download order in `src/components/DownloadButton.tsx`: cloud-save the site document, `POST /api/v1/projects/{id}/crs-credentials`, build the ZIP, then `POST /api/v1/projects/{id}/export-event`. A failed export-event call does not undo the download. The ZIP text for hotel and guest house still says reservations run on Laravel, not in `frontend/`.

## Implement a screen

1. Add `src/pages/<Name>Page.tsx`.
2. Register it in `src/App.tsx`. Wrap with `RequireAuth` when the API route needs a user. Marketing pages stay public.
3. Use `AppHeader` or `PageShell` from `src/components/workspace.tsx`.
4. Call the platform through a function in `src/api/`. Do not `fetch` from the page. Add the response type in `src/api/types.ts`.
5. Toasts use `sonner`.

Role-specific flow stays in the page that already branches:

- Consumer opening `/editor/:templateId` with no `?project=` creates the project and replaces the URL with `?project=`.
- Salesperson or agency admin without `?project=` goes to `/new-site?template=`.
- `/new-site` collects client, business type, and template. A new client needs a name and an Ethiopian phone.
- `?mode=view` or `canEdit === false` hides the form and save.
- `canExport === false` opens `PaywallModal` instead of downloading. Salesperson label: “Contact us — export locked”. Consumer label: “Unpaid — export locked”.
- `markProjectPaid` is the only client write of `canExport`, and only after billing says the invoice is paid.

`/pick-template` is the host contract in `src/data/pickTemplate.ts`. The posted JSON and the `webbuilder:template-picked` message are stable. Add optional fields. Do not rename existing ones.

## Leave these wires as they are

- Do not add a second editor store.
- Do not unlock cloud save or export in the client for an unpaid consumer.
- Do not show hotel or hospitality templates to a consumer. `canUseHospitalityTemplates` is salesperson, agency admin, and platform admin only.
- Do not put guest or payment fields on a CRS credentials request.
- Do not put layout choices on `SiteContent`. The site document carries `layoutVariantId`.
- Public auth, marketing, demo, pick-template, and `/site/:templateId` stay outside `RequireAuth`. Editor and preview stay inside it.
