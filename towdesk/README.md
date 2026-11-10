# TowDesk

A private, owner-operated towing workspace built with React/Vinext, Cloudflare D1 and R2.

## Included workflows

- Overview: setup checklist, unassigned jobs, overdue balances and service reminders.
- Dispatch: customer/vehicle details, driver and truck assignments, priority, statuses, checklists, search and filters.
- Schedule: dated pickups and unscheduled active jobs.
- Customers: reusable contacts, linked job history and outstanding balances.
- Drivers and fleet: availability, default trucks, mileage, maintenance and expiry dates.
- Impound: intake, lot and bay, requesting agency, release recipient/date, explicit storage-charge calculation.
- Billing: itemized charges, discount, configurable tax, partial payments, invoice printing/PDF via browser.
- Photos/documents: authenticated JPEG, PNG, WebP and PDF attachments, 5 MB per file.
- Reports: date-filtered job metrics, payments, service mix and driver workload.
- Settings: company invoice details, default rates/terms and full JSON record export.
- Archive/restore and append-only change summaries.

Practice data is separate and resets on reload. The browser stores only the selected practice/live preference. Live records and attachments are server persisted and scoped to the authenticated owner. Site access remains owner-private.

## Boundaries

This release does not provide employee accounts, shared team dispatch, automatic communications, live GPS, payment processing, motor-club integrations, statutory impound notices or lien sales. Payments are manually recorded receipts, not card charges or refunds. Reports are operational summaries, not an accounting ledger. JSON export includes attachment metadata, not file bytes; download files individually. JSON import is not implemented.

Storage calculations count inclusive calendar days and only update charges when explicitly selected. Users must apply their actual business rates and rules. Tax defaults to zero. Changes to default rates do not change existing jobs. Schedule dates use local browser time. Report job cohorts use recorded creation dates; cash collections use payment-entry dates.

## Implementation

- `app/page.tsx`: navigation and workspace views.
- `app/components/`: job editor, generic record editor, invoices, reports, settings and accessible modal primitives.
- `lib/domain.ts`: money calculations, legacy conversion, exports and shared models.
- `lib/validation.ts`: shared Zod input validation.
- `app/api/records`: authenticated scoped records; optimistic concurrency; transactional audit summaries.
- `app/api/activity`: latest 100 scoped events, optionally filtered by job.
- `app/api/files`: authenticated R2 upload/download with MIME and file signature checks.
- `db/schema.ts` and `drizzle/`: immutable, versioned database migrations.

Existing first-release jobs are normalized on read: the original amount becomes one invoice line, and an existing paid flag becomes a legacy payment entry. Original identifiers are retained. Audit history begins with the next change; prior events are not fabricated.

## Verification

Run `node tests/verify.mjs` and `node node_modules/typescript/bin/tsc --noEmit`.
The functional suite uses an in-memory SQLite database and a D1 adapter to execute actual API logic. It covers calculations, legacy conversion, input validation, record ownership, invalid origins, stale writes, reference ownership, partial-payment limits, archive/restore and audit history.

Use the Sites build and source workflow for publication. Keep credentials out of source. Hosting identity and D1/R2 bindings are in `.openai/hosting.json`. Apply only pending migrations for local previews; production migrations are applied by Sites publication.
