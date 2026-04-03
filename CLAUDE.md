# rolls

Analog film roll tracker. Go CLI + Rails web app.

## Structure

- `cmd/` — CLI entry point (`go run ./cmd/rolls`)
- `cli/` — Cobra subcommands, one file per command, self-register via `init()`
- `cli/roll/` — Core types: Roll, Camera, Film, Config
- Rails 7.1 MVC app, Ruby 3.2, Postgres, Hotwire (Turbo + Stimulus), Sprockets

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

## Running locally

```sh
bundle exec rails server
bundle exec rails db:migrate
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

### Controllers

- `app/controllers/application_controller.rb` — `current_user`, `logged_in?`, `set_current_user`; authenticates from Bearer token (API key or JWT) or session cookie (JWT); sets session cookie via `set_session_cookie!`
- `app/controllers/web/base_controller.rb` — requires `logged_in?`, redirects to login; uses `application` layout
- `app/controllers/web/rolls_controller.rb` — `shoot` (loaded+fridge), `develop` (lab/scanned/processed/uploaded), `archive` (archived, dark layout); full CRUD
- `app/controllers/web/cameras_controller.rb` — camera CRUD
- `app/controllers/web/films_controller.rb` — film CRUD
- `app/controllers/web/sessions_controller.rb` — web login (passkey-based, sets session cookie)
- `app/controllers/web/registrations_controller.rb` — web registration
- `app/controllers/web/settings_controller.rb` — settings page
- `app/controllers/web/stats_controller.rb` — stats page
- `app/controllers/web/admin/` — admin dashboard, users, catalog films
- `app/controllers/api/base_controller.rb` — skips CSRF, enforces `require_api_auth!`
- `app/controllers/api/auth/sessions_controller.rb` — me, logout, bootstrap, check-username
- `app/controllers/api/auth/webauthn_controller.rb` — passkey register/login/autofill options + verify
- `app/controllers/api/auth/api_keys_controller.rb` — list/create/revoke/cli-token
- `app/controllers/api/auth/credentials_controller.rb` — delete passkey credential
- `app/controllers/api/auth/apple_controller.rb` — Sign in with Apple (create/link/unlink)
- `app/controllers/api/auth/invites_controller.rb` — invite management
- `app/controllers/api/auth/email_preferences_controller.rb` — email notification toggle
- `app/controllers/api/rolls_controller.rb` — full rolls CRUD + next_number, home, archive, bulk_update, contact_sheet_show/upload
- `app/controllers/api/cameras_controller.rb` — cameras CRUD + merge
- `app/controllers/api/films_controller.rb` — films CRUD + merge
- `app/controllers/api/import_export_controller.rb` — bulk upsert (import) + full dump (export); used by CLI push/pull
- `app/controllers/api/catalog_controller.rb` — global catalog films (no auth)
- `app/controllers/api/cache_controller.rb` — latest updated_at timestamps for rolls/cameras/films

### Models

- `app/models/roll.rb` — belongs_to camera/film/user; `status` method (priority: archived > uploaded > processed > scanned > lab > fridge > loaded); scopes: `active`, `archived`, `by_roll_number`; `next_number_for(user)`
- `app/models/camera.rb` — belongs_to user; slug-based uniqueness per user
- `app/models/film.rb` — belongs_to user; slug-based uniqueness per user
- `app/models/user.rb` — has_many rolls/cameras/films/api_keys/webauthn_credentials
- `app/models/api_key.rb` — SHA-256 hashed; `touch_last_used!`
- `app/models/invite.rb` — single/multi-use invite codes with expiry
- `app/models/catalog_film.rb` — global film catalog (slug primary key, no user scope)
- `app/models/webauthn_credential.rb` — stored passkey credentials

### Concerns & helpers

- `app/controllers/concerns/serializable.rb` — shared `serialize_*` and `render_*` helpers included in ApplicationController
- `app/helpers/application_helper.rb` — `nav_active_class`, `status_badge`, `format_date`, `push_pull_label`

### Views & assets

- `app/views/web/` — ERB templates for shoot/develop/archive/cameras/films/rolls/settings/stats/admin
- `app/views/layouts/` — application layout (paper design system), archive layout (dark)
- `app/assets/stylesheets/paper.css` — custom design system: paper/ink color palette (`--paper`, `--ink`, `--orange`), status colors per roll status, full component styles (cards, badges, buttons, nav)
- `app/javascript/` — Stimulus controllers (importmap-based, no bundler)

## Env vars (Heroku)

- `DATABASE_URL` — Heroku Postgres
- `JWT_SECRET` — signs session tokens and API JWT tokens
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
- `R2_PUBLIC_URL=https://rolls-b.yannick.computer`
- `APP_URL=https://rolls.yannick.computer`
- `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_ORIGIN`
- `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_FROM_EMAIL`, `MAILJET_FROM_NAME`
- `NEW_RELIC_LICENSE_KEY` — New Relic ingest license key
- `NEW_RELIC_APP_NAME` — defaults to `rolls` if unset
- `SECRET_KEY_BASE` — Rails encrypted cookies/sessions

## Database migrations

- Migration files live in `db/migrate/` (standard Rails Active Record migrations)
- Tracked automatically by Rails in `schema_migrations` table
- **On Heroku**: run automatically via `Procfile` release phase (`release: bundle exec rails db:migrate`) before every deploy
- **Locally**: `bundle exec rails db:migrate`
- `db/schema.rb` — auto-generated schema snapshot; keep in version control
- All migrations should be reversible where possible; use `add_column`/`remove_column`, etc.

## Patterns

- Roll status (derived from timestamps): `archived > uploaded > processed > scanned > lab > fridge > loaded` — computed in `Roll#status`
- Three primary web views: `/shoot` (loaded + fridge rolls), `/develop` (lab/scanned/processed/uploaded), `/archive` (archived, dark layout with contact sheets)
- Scans dir structure: `{scans_path}/{year}/{roll_number}-{MMDD}-{camera}-{film}/roll.md`
- CLI auth: `Authorization: Bearer {api_key}` verified via `ApiKeyService.find_by_raw_key` (SHA-256 hash)
- Web auth: WebAuthn passkeys + JWT session cookie (1 year); `current_user` + `logged_in?` helpers in ApplicationController
- API auth: Bearer token (raw API key `rk_*` or JWT) → `authenticate_from_bearer_token`; session cookie JWT → `authenticate_from_session_cookie`
- Contact sheets: uploaded to R2, key = `{roll_number}.webp`, public URL = `https://rolls-b.yannick.computer/{roll_number}.webp`
- All DB queries scoped to `current_user` (multitenancy)
- Camera/film slugs: CLI uses YAML keys; web UI uses `babosa`-based slugify (`brand-model`)
- Push fuzzy matching: unknown camera/film IDs → try fuzzy match to cameras.yml/films.yml; no stubs created on failure (warns to stderr)
- Design system: `paper.css` — warm paper/ink palette, no external CSS framework

## API reference (for rolls-ios)

**Base URL:** `https://rolls.yannick.computer`
**Auth:** `Authorization: Bearer {api_key}` on all authenticated routes
**All responses:** JSON unless noted. All routes scoped to authenticated user.

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/auth/me` | ✓ | Current user + passkey credentials |
| `POST` | `/api/auth/logout` | ✓ | Clear session (Set-Cookie) |
| `GET` | `/api/auth/bootstrap` | — | `{ needsInvite: bool }` — true if no users exist yet |
| `POST` | `/api/auth/webauthn/register-options` | — | Begin passkey registration |
| `POST` | `/api/auth/webauthn/register-verify` | — | Complete passkey registration → `{ success, user, token }` + Set-Cookie |
| `POST` | `/api/auth/webauthn/login-options` | — | Begin passkey login (body: `{ identifier }`) |
| `POST` | `/api/auth/webauthn/login-verify` | — | Complete passkey login → `{ success, user, token }` + Set-Cookie |
| `GET` | `/.well-known/apple-app-site-association` | — | AASA for iOS passkey associated domains |
| `POST` | `/api/auth/apple` | — | Sign in with Apple (see body below) |
| `POST` | `/api/auth/apple/link` | ✓ | Link Apple ID to authenticated account (`{ identity_token }`) |
| `DELETE` | `/api/auth/apple/link` | ✓ | Unlink Apple ID from account |
| `POST` | `/api/auth/webauthn/autofill-options` | — | Discoverable credential options (no allowCredentials) |
| `POST` | `/api/auth/check-username` | — | `{ username, invite_code? }` → `{ available: bool }` |
| `GET` | `/api/auth/cli-token` | ✓ (cookie) | Create API key + redirect to `?callback=` with key |
| `GET` | `/api/auth/api-keys` | ✓ | List API keys (no raw keys) |
| `POST` | `/api/auth/api-keys` | ✓ | Create key → `{ api_key, raw_key }` (raw shown once) |
| `DELETE` | `/api/auth/api-keys/:id` | ✓ | Revoke API key |
| `DELETE` | `/api/auth/credentials/:id` | ✓ | Delete passkey |
| `PATCH` | `/api/auth/email-preferences` | ✓ | `{ email_notifications: bool }` |

**Invites:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/auth/invites` | ✓ | List own invites with `isValid` flag |
| `POST` | `/api/auth/invites` | ✓ | Create invite (admins: custom uses/expiry; users: single-use) |
| `DELETE` | `/api/auth/invites/:id` | ✓ | Delete unused invite |
| `POST` | `/api/auth/invites/send` | ✓ | Email invite (`{ invite_code, email, message? }`) |
| `GET` | `/api/auth/invites/validate?code=` | — | `{ valid: bool, error? }` |

### Rolls

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/rolls` | ✓ | All rolls with `camera_name`/`film_name`, paginated (`?limit=200&offset=0`) |
| `POST` | `/api/rolls` | ✓ | Create roll (see body below); returns roll with `camera_name`/`film_name` |
| `GET` | `/api/rolls/next` | ✓ | `{ roll_number }` — next auto-generated roll number (YYx format) |
| `GET` | `/api/rolls/home` | ✓ | Active rolls with camera/film details joined |
| `GET` | `/api/rolls/archive` | ✓ | Archived rolls with camera/film details joined |
| `GET` | `/api/rolls/:id` | ✓ | Single roll by UUID with `camera_name`/`film_name` |
| `PATCH` | `/api/rolls/:id` | ✓ | Partial update (see fields below); returns roll with `camera_name`/`film_name` |
| `DELETE` | `/api/rolls/:id` | ✓ | Delete roll → 204 |
| `POST` | `/api/rolls/bulk-update` | ✓ | Set one timestamp field for multiple rolls |
| `GET` | `/api/rolls/:id/contact-sheet` | ✓ | Proxy contact sheet image (`image/webp`) from R2 |
| `PUT` | `/api/rolls/:id/contact-sheet` | ✓ | Upload contact sheet (body: raw `image/webp` bytes) |

**POST /api/rolls body:**
```json
{
  "roll_number": "26a",
  "camera_uuid": "uuid",
  "film_uuid": "uuid",
  "notes": "..."
}
```

**PATCH /api/rolls/:id fields** (all optional):
`roll_number`, `camera_uuid` (UUID), `film_uuid` (UUID), `camera_id` (slug→UUID), `film_id` (slug→UUID), `notes`, `push_pull`, `lab_name`, `album_name`, `tags`,
`shot_at`, `fridge_at`, `lab_at`, `scanned_at`, `processed_at`, `uploaded_at`, `archived_at`

**POST /api/auth/apple body:**
```json
{ "identity_token": "eyJ...", "full_name": "Jane Doe", "username": "jane", "invite_code": "..." }
```
- `identity_token` — required; JWT from `ASAuthorizationAppleIDCredential.identityToken`
- `full_name` — optional; only sent by Apple on first sign-in
- `username` + `invite_code` — only required when creating a new account
- Returns `{ success, user, token }` + Set-Cookie; if user not found and email unavailable: `{ error: "new_account_required", email }` (404)

**POST /api/rolls/bulk-update body:**
```json
{
  "roll_numbers": ["26a", "26b"],
  "field": "archived_at",
  "value": "2026-03-27T00:00:00Z"
}
```
→ `{ updated: 2 }`

### Cameras

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/cameras` | ✓ | All cameras |
| `POST` | `/api/cameras` | ✓ | Upsert camera by slug (see body below) |
| `GET` | `/api/cameras/:slug` | ✓ | Camera + `roll_count` |
| `PATCH` | `/api/cameras/:slug` | ✓ | Update camera |
| `DELETE` | `/api/cameras/:slug` | ✓ | Delete (409 if rolls exist) |
| `POST` | `/api/cameras/merge` | ✓ | `{ target_id, source_ids[] }` → reassign rolls + delete sources |

**POST /api/cameras body:**
```json
{ "brand": "Nikon", "model": "F3", "nickname": "F3", "format": 35 }
```
Slug auto-generated: `slugify("nikon-f3")`. Upserts on `(user_id, slug)`.

### Films

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/films` | ✓ | All films |
| `POST` | `/api/films` | ✓ | Upsert film by slug (see body below) |
| `GET` | `/api/films/:slug` | ✓ | Film + `roll_count` |
| `PATCH` | `/api/films/:slug` | ✓ | Update film |
| `DELETE` | `/api/films/:slug` | ✓ | Delete (409 if rolls exist) |
| `POST` | `/api/films/merge` | ✓ | `{ target_id, source_ids[] }` → reassign rolls + delete sources |

**POST /api/films body:**
```json
{ "brand": "Kodak", "name": "Portra 400", "iso": 400, "color": true, "show_iso": false }
```
Optional: `nickname`, `slide`. Slug: `slugify("kodak-portra-400")`.

### Catalog films (global, no auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/catalog/films` | — | Global film catalog with `gradient_from`/`gradient_to` colors |

### Bulk sync (CLI-compatible)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/import` | ✓ | Bulk upsert cameras + films + rolls → `{ cameras, films, rolls }` counts |
| `GET` | `/api/export` | ✓ | Full dump: `{ cameras[], films[], rolls[] }` (IDs as slugs) |

**POST /api/import body:**
```json
{
  "cameras": [{ "id": "nikon-f3", "brand": "Nikon", "model": "F3", "format": 35 }],
  "films":   [{ "id": "kodak-portra-400", "brand": "Kodak", "name": "Portra 400", "iso": 400 }],
  "rolls":   [{ "roll_number": "26a", "camera_id": "nikon-f3", "film_id": "kodak-portra-400" }]
}
```

### Cache timestamps (for conditional refresh)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/cache/timestamps` | ✓ | `{ rolls, cameras, films }` latest `updated_at` timestamps |

Use to skip full re-fetch when nothing has changed.
