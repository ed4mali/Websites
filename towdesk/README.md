# TowDesk

Private database-backed towing operations application.

## Features

Dispatch, scheduling, customer records, drivers, fleet maintenance, impound intake/release, itemized billing, recorded payments, reports, attachments, activity history, archive/restore, and export tools.

## Storage and access

D1 stores records and activity; R2 stores protected attachments. Records are scoped to the authenticated account. Browser data from the former static edition is not automatically imported; Settings retains a browser-record backup export when applicable.

## Development

Install dependencies with the project installer or npm, then run `npm test` and `npm run build`. The Sites hosting manifest binds `DB` and `BUCKET`; schema migrations are retained in `drizzle/` and applied during publication.

Driver messages, GPS tracking, separate driver accounts, and payment processing are not connected. Dispatch communication and payment collection use your existing tools; the application records their results.
