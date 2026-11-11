# Ubernyx Websites

Source snapshots of four ChatGPT Sites, organized as independent projects.

| Folder | Website |
| --- | --- |
| `ubernyx/` | https://ubernyx-software.ed4mali.chatgpt.site |
| `ubernyx-gear/` | https://ubernyx-gear.ed4mali.chatgpt.site |
| `service-desk/` | https://servicedesk-hub-ed-2026.ed4mali.chatgpt.site |
| `towdesk/` | https://towdesk-ed.ed4mali.chatgpt.site |

Each folder retains its original source structure and `.openai/hosting.json` configuration. Business data and runtime secrets are not included. The static sites keep their deployable files in `dist/`; Service Desk and TowDesk contain their own server build configuration. TowDesk stores application records in D1 and attachments in R2.

This repository is a source backup. A ChatGPT scheduled task checks for source updates hourly, using `sites-sync.json` for project mappings and `source-snapshots.json` for the last synchronized source commits. Changes flow from ChatGPT Sites into GitHub. This does not deploy GitHub changes back to the live websites. Run each project independently from its own folder.

The task preserves edits made directly in GitHub: if a destination folder differs from its last synchronized source snapshot, it reports the conflict instead of overwriting it. It commits only changed sources and updates the snapshot record after a verified push. Credentials are obtained at runtime and are never stored here.

See `source-snapshots.json` for the original Sites source commits.

## TowDesk client synchronization

The hourly task now reconciles TowDesk client-edition source into [Ubernyx-LLC/Dev/towdesk-cloudflare](https://github.com/Ubernyx-LLC/Dev/tree/main/towdesk-cloudflare) through pull requests and checks. The `towdesk/` folder here is a historical hosted-site snapshot. The other three Sites continue their existing backups into this repository.
