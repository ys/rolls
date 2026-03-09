# rolls

Analog film roll tracker. Go CLI + Next.js web app.

## Structure

- `cmd/` — CLI entry point (`go run ./cmd/rolls`)
- `cli/` — Cobra subcommands, one file per command, self-register via `init()`
- `cli/roll/` — Core types: Roll, Camera, Film, Config
- Next.js 15 App Router, TypeScript, Tailwind, Postgres (files at repo root, not in `web/`)

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
- `web_app_api_key` — API key from /settings/api-keys (hashed in `api_keys` table)
- `scans_path` — local scans dir (`{year}/{roll_number}-{MMDD}-{camera}-{film}/`)
- `contact_sheet_path` — Obsidian vault path containing `images/*.webp`
- `environments` — named envs (e.g. local, staging); `active_env` selects default
- `~/.config/rolls/cameras.yml` — camera definitions (slug → brand/model/nickname/format)
- `~/.config/rolls/films.yml` — film definitions (slug → brand/name/iso/color/showiso)

## Key commands

```sh
rolls login [--url URL] [--key KEY]      # save credentials (env-aware)
rolls push [--dry-run] [--year N]        # push local roll.md → web app
rolls push --sheets                      # re-upload all contact sheets to R2
rolls push --skip-contact-sheets         # push metadata only, skip sheets
rolls pull [--dry-run]                   # fetch web app data → local roll.md files
rolls process <roll_number>              # mark processed, upload contact sheet
rolls env list / use / add / remove      # manage named environments
rolls --env local push                   # use a specific environment for one command
rolls lr albums / upload / check / link / login
```

## Key files — CLI

- `cli/roll/config.go` — Config struct; URL()/APIKey() env-aware accessors; SetEnv()
- `cli/roll/roll.go` — Roll/Metadata, GetRolls(), FromMarkdown(), UpdateMetadata()
- `cli/roll/camera.go` — Camera type, GetCameras() (reads cameras.yml via viper)
- `cli/roll/film.go` — Film type, GetFilms() (reads films.yml via viper)
- `cli/root.go` — rootCmd, cfg var, --env flag, initConfig()
- `cli/push.go` — push + contact sheet upload; fuzzy camera/film matching (no stubs)
- `cli/pull.go` — pull + lineDiff for dry-run
- `cli/env.go` — `rolls env` subcommands (list/use/add/remove)
- `cli/web_login.go` — `rolls login` command
- `cli/process.go` — `rolls process` → archive + upload contact sheet + set processed_at
- `cli/lr.go` — `lr` subcommand parent for Lightroom commands

## Key files — Web app

- `lib/db.ts` — postgres client, Camera/Film/Roll/ApiKey types
- `lib/r2.ts` — R2 client
- `lib/auth.ts` — WebAuthn, JWT sessions, API key hash/verify, email (Mailjet)
- `lib/request-context.ts` — getUser()/getUserId() reads x-user-* headers set by middleware
- `lib/queries.ts` — shared DB query helpers (getCameraCount, getFilmCount, etc.)
- `lib/schema.sql` — CREATE TABLE cameras/films/rolls/users/api_keys/webauthn_credentials
- `proxy.ts` — middleware: Bearer token → api_keys table; session cookie → JWT; injects x-user-* headers
- `app/api/import/route.ts` — bulk upsert cameras/films/rolls (used by `rolls push`)
  - camera_uuid/film_uuid use COALESCE to preserve existing values when slug not found
- `app/api/export/route.ts` — full dump (used by `rolls pull`)
- `app/api/rolls/[id]/contact-sheet/route.ts` — R2 upload + URL storage
- `app/api/cameras/route.ts` — GET/POST cameras; slug = slugify(brand+"-"+model)
- `app/api/films/route.ts` — GET/POST films; slug = slugify(brand+"-"+name)
- `app/api/admin/cleanup-stubs/route.ts` — one-time POST to delete stub cameras/films
- `app/settings/api-keys/` — API key management UI (create/revoke, one-time display)
- `app/roll/[id]/page.tsx` — roll detail server component (user_id scoped)
- `components/FormField.tsx` — shared label+input component
- `components/FormButton.tsx` — primary/secondary button variants
- `components/Sheet.tsx` — bottom sheet modal (uses createPortal)
- `components/BackButton.tsx` — back navigation

## Env vars (Heroku)

- `DATABASE_URL` — Heroku Postgres
- `JWT_SECRET` — signs session tokens
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
- `R2_PUBLIC_URL=https://rolls-b.yannick.computer`
- `APP_URL=https://rolls.yannick.computer`
- `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_ORIGIN`
- `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_FROM_EMAIL`, `MAILJET_FROM_NAME`

## Database migrations

- Migration files live in `lib/migrations/NNN_description.sql` (alphabetical order)
- Tracked in `schema_migrations` table — runner skips already-applied files
- **On Heroku**: run automatically via `Procfile` release phase (`release: npm run migrate`) before every deploy
- **Locally**: `npm run migrate` (reads `DATABASE_URL` from `.env.local`)
- Runner: `scripts/migrate.js` — creates `schema_migrations` table if missing, then runs pending `.sql` files in order
- All migrations must be idempotent: use `IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `ON CONFLICT DO UPDATE`, etc.
- To add a migration: create `lib/migrations/NNN_description.sql`, commit, push — it runs on next deploy
- `lib/schema.sql` is a human-readable reference snapshot of the full schema; keep it in sync when adding tables/columns

## Patterns

- Roll status (derived from timestamps): `archived > uploaded > processed > scanned > lab > fridge > loaded`
- Scans dir structure: `{scans_path}/{year}/{roll_number}-{MMDD}-{camera}-{film}/roll.md`
- CLI auth: `Authorization: Bearer {api_key}` verified against `api_keys` table (SHA-256 hash)
- Web auth: WebAuthn passkeys + JWT session cookie (1 year); middleware = `proxy.ts`
- Contact sheets: uploaded to R2, key = `{roll_number}.webp`, public URL = `https://rolls-b.yannick.computer/{roll_number}.webp`
- All DB queries scoped to `user_id` (multitenancy)
- Camera/film slugs: CLI uses YAML keys; web UI uses `slugify(brand+"-"+model/name)`
- Push fuzzy matching: unknown camera/film IDs → try fuzzy match to cameras.yml/films.yml; no stubs created on failure (warns to stderr)
