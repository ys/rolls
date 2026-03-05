# rolls

Analog film roll tracker. Go CLI + Next.js web app.

## Structure

- `cmd/` — CLI entry point (`go run ./cmd/rolls`)
- `cli/` — Cobra subcommands, one file per command, self-register via `init()`
- `roll/` — Core types: Roll, Camera, Film, Config
- `web/` — Next.js 15 App Router, TypeScript, Tailwind, Postgres

## Web app

**Hosting:** Heroku, app name `rolls`
**URL:** https://rolls.yannick.computer
**DB:** Heroku Postgres (DATABASE_URL)
**Storage:** Cloudflare R2, public domain https://rolls-b.yannick.computer

```sh
heroku logs --tail --app rolls
heroku config --app rolls
heroku pg:psql --app rolls
```

## CLI config (`~/.config/rolls/config.yml`)

- `web_app_url` — https://rolls.yannick.computer
- `web_app_api_key` — must match `API_KEY` env var on Heroku
- `scans_path` — local scans dir (`{year}/{roll_number}-{MMDD}-{camera}-{film}/`)
- `contact_sheet_path` — Obsidian vault path containing `images/*.webp`

## Key commands

```sh
rolls pull [--dry-run]          # fetch web app data → local roll.md files
rolls push [--dry-run] [--year] # push local roll.md → web app
rolls push --sheets             # re-upload all contact sheets to R2
rolls process <roll_number>     # mark processed, upload contact sheet
rolls lr albums / upload / check / link / login
```

## Key files

- `roll/config.go` — Config struct
- `roll/roll.go` — Roll/Metadata, GetRolls(), FromMarkdown(), UpdateMetadata()
- `cli/push.go` — push + contact sheet upload logic
- `cli/pull.go` — pull + lineDiff for dry-run
- `cli/lr.go` — `lr` subcommand parent
- `web/lib/db.ts` — postgres client, Camera/Film/Roll types
- `web/lib/r2.ts` — R2 client
- `web/app/api/export/route.ts` — full dump (used by `rolls pull`)
- `web/app/api/import/route.ts` — bulk upsert (used by `rolls push`)
- `web/app/api/rolls/[id]/contact-sheet/route.ts` — R2 upload + URL storage

## Env vars (Heroku)

- `DATABASE_URL` — Heroku Postgres
- `API_KEY` — CLI auth (Bearer token)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
- `R2_PUBLIC_URL=https://rolls-b.yannick.computer`
- `APP_URL=https://rolls.yannick.computer`
- `WEB_PASSWORD` — optional web UI password

## Patterns

- Roll status (derived from timestamps): `archived > uploaded > processed > scanned > lab > fridge > loaded`
- Scans dir structure: `{scans_path}/{year}/{roll_number}-{MMDD}-{camera}-{film}/roll.md`
- CLI auth: `Authorization: Bearer {API_KEY}` on all `/api/*` routes
- Contact sheets: uploaded to R2, stored as `https://rolls-b.yannick.computer/{roll_number}.webp`
