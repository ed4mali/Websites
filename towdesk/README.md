# TowDesk — Static edition

A browser-local towing dispatch workspace. Deployment consists only of `dist/index.html` and `dist/assets/`; no server, database binding, or API endpoint is required.

## Build

```sh
npm ci
npm run build
```

Serve `dist/` as the site root using any static host, including GitHub Pages. Asset paths are relative so repository subpaths work. Deploy the `towdesk/dist` folder independently from the other sites in the Websites repository.

## Data

Practice mode uses sample records that reset on reload. Browser workspace records and activity use localStorage; attachments use IndexedDB (5 MB maximum per file). Browser workspace begins empty. Export JSON/CSV records in Settings and download attachments from each job for backups. Clearing site data, changing devices, or using a different site origin does not preserve or share local records. Existing cloud data is not imported or deleted by this conversion. No cloud synchronization, separate logins, GPS, SMS, or card processing is provided.

The dispatch, schedule, customers, drivers, fleet, impound, billing, reports, archive/restore, activity, file attachment, and invoice print/PDF screens remain available. The historical database migrations are retained for reference; they are not used by the static site.
