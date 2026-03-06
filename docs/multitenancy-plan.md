# Multitenant Migration Plan

## Context

The app is currently single-user: one shared `API_KEY` env var, one `WEB_PASSWORD`, and all data in a global namespace. Making it multitenant means each user gets their own account (email + password), their own CLI API key, and fully isolated cameras/films/rolls data.

**Key design decisions:**
- Cameras and films are **per-user** (different users have different gear)
- Roll numbers are **per-user unique** (two users can both have `25x07`)
- Auth: **email + password** → JWT session cookie; CLI uses per-user **API keys** (Bearer token protocol unchanged)
- **Zero Go CLI changes** — Bearer auth stays identical; only the token value changes from a shared secret to a personal API key

---

## 1. Database schema

Add `users` and `api_keys` tables. Add `user_id` FK column to `cameras`, `films`, `rolls`. Use a surrogate `internal_id BIGSERIAL` PK + unique constraint to handle per-user id namespacing without cascading FK changes.

**Run as two migrations:**

**Migration 002** (safe to run before code deploy — nullable columns, no constraints yet):
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_keys (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,   -- SHA-256 of raw token
  label TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX api_keys_key_hash_idx ON api_keys (key_hash);

-- cameras: surrogate PK + user-scoped unique
ALTER TABLE cameras ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE cameras ADD COLUMN internal_id BIGSERIAL;
ALTER TABLE cameras DROP CONSTRAINT cameras_pkey;
ALTER TABLE cameras ADD CONSTRAINT cameras_user_id_id_uniq UNIQUE (user_id, id);

-- films: same pattern
ALTER TABLE films ADD COLUMN user_id TEXT REFERENCES films(id) ON DELETE CASCADE;
ALTER TABLE films ADD COLUMN internal_id BIGSERIAL;
ALTER TABLE films DROP CONSTRAINT films_pkey;
ALTER TABLE films ADD CONSTRAINT films_user_id_id_uniq UNIQUE (user_id, id);

-- rolls: same pattern, using roll_number
ALTER TABLE rolls ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE rolls ADD COLUMN internal_id BIGSERIAL;
ALTER TABLE rolls DROP CONSTRAINT rolls_pkey;
ALTER TABLE rolls ADD CONSTRAINT rolls_user_id_roll_number_uniq UNIQUE (user_id, roll_number);
```

**Migration 003** (run after existing data is seeded to first user — see §9 runbook):
```sql
ALTER TABLE cameras ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE films   ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE rolls   ALTER COLUMN user_id SET NOT NULL;
```

### `web/lib/db.ts` — add `user_id` field to Camera, Film, Roll interfaces; add new User and ApiKey interfaces

---

## 2. New `web/lib/auth.ts`

Server-only module. Dependencies: `npm install jose bcryptjs @types/bcryptjs`

- `hashPassword` / `verifyPassword` — bcrypt cost 12
- `createSessionToken` / `verifySessionToken` — HS256 JWT via `jose`, 1-year expiry
- `generateRawApiKey` — 32 random bytes prefixed `rk_`
- `hashApiKey(raw)` — SHA-256 hex (API keys have 256-bit entropy, SHA-256 is appropriate)
- `verifyApiKey(raw)` — DB lookup by hash → returns User; touches `last_used_at` async
- `makeSessionCookie` / `clearSessionCookie` — HttpOnly, SameSite=Strict, Secure in prod

New Heroku env var: `JWT_SECRET` (set via `heroku config:set JWT_SECRET=$(openssl rand -hex 32)`)

---

## 3. Rewrite `web/middleware.ts`

Replace `API_KEY` string comparison with:
1. `Authorization: Bearer {raw}` → `verifyApiKey(raw)` → DB lookup → user
2. Else session cookie → `verifySessionToken` → user
3. No user → 401 for `/api/*`, redirect to `/login?from=...` for UI

Inject `x-user-id` and `x-user-email` request headers for downstream route handlers.

Public paths (no auth): `/login`, `/register`, `/api/auth/*`

---

## 4. New `web/lib/request-context.ts`

```typescript
import { headers } from "next/headers";
export async function getUserId(): Promise<string> {
  const userId = (await headers()).get("x-user-id");
  if (!userId) throw new Error("No user in request context");
  return userId;
}
```

Used by all route handlers and server components.

---

## 5. New auth API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `api/auth/login` | POST | Verify email+password, set session cookie |
| `api/auth/register` | POST | Create user, set session cookie |
| `api/auth/logout` | POST | Clear session cookie |
| `api/auth/me` | GET | Return `{ user: { id, email } }` |
| `api/auth/api-keys` | GET/POST | List keys / create new (raw shown once) |
| `api/auth/api-keys/[id]` | DELETE | Revoke a key |

---

## 6. Update all data API routes

Every route querying `cameras`, `films`, `rolls` needs:
```typescript
const userId = await getUserId();
// ... add WHERE user_id = ${userId} to all queries
// ... add user_id = ${userId} to all INSERTs
// ... change ON CONFLICT (id) to ON CONFLICT (user_id, id)
```

Files to update:
- `api/export/route.ts`, `api/import/route.ts`
- `api/cameras/route.ts`, `api/cameras/[id]/route.ts`
- `api/films/route.ts`, `api/films/[id]/route.ts`, `api/films/merge/route.ts`
- `api/rolls/route.ts`, `api/rolls/[id]/route.ts`
- `api/rolls/home/route.ts`, `api/rolls/archive/route.ts`, `api/rolls/next/route.ts`
- `api/rolls/bulk-update/route.ts`, `api/rolls/[id]/contact-sheet/route.ts`
- `api/cache/timestamps/route.ts`
- `app/stats/page.tsx`, `app/roll/[id]/page.tsx`, `app/cameras/page.tsx`, `app/films/page.tsx`

---

## 7. R2 contact sheet path change

**Before:** `{roll_number}.webp`
**After:** `{user_id}/{roll_number}.webp`

Only `api/rolls/[id]/contact-sheet/route.ts` changes. Existing images need a one-off rename (see §9 runbook).

---

## 8. Web UI changes

- **`app/login/page.tsx`** — email + password form (replace password-only form)
- **New `app/register/page.tsx`** — registration form posting to `/api/auth/register`
- **`app/settings/page.tsx`** — add API Key section: list keys, generate new key (shown once with paste instructions for `config.yml`), delete key
- **New `components/ApiKeyManager.tsx`** — client component for key management UI
- **`app/HomeClient.tsx`, `app/new/page.tsx`** — remove `NEXT_PUBLIC_API_KEY` usage (cookie auth handles browser requests automatically)
- Remove `NEXT_PUBLIC_API_KEY` env var entirely

---

## 9. Migration runbook (preserving existing data)

1. **Deploy migration 002** while old code is still running — safe (nullable columns only)
2. **Deploy new app code** (middleware, auth, updated routes)
3. **Seed first user** via temporary `api/admin/seed-first-user` endpoint (protected: only runs when `users` table is empty):
   - Creates user from `{email, password}` request body
   - `UPDATE cameras/films/rolls SET user_id = {newUserId} WHERE user_id IS NULL`
   - Creates initial API key; returns raw `rk_...` key once
   - Update `~/.config/rolls/config.yml` `web_app_api_key` with the raw key
   - Delete endpoint and redeploy
4. **Deploy migration 003** (makes `user_id NOT NULL`)
5. **Rename R2 objects**: one-off script copies `{roll}.webp` → `{userId}/{roll}.webp`; run SQL to update `contact_sheet_url` column
6. **Update Heroku config**:
   ```sh
   heroku config:set JWT_SECRET=$(openssl rand -hex 32) --app rolls
   heroku config:unset API_KEY WEB_PASSWORD --app rolls
   ```

---

## 10. CLI — no changes

`roll/config.go`, `cli/push.go`, `cli/pull.go`, `cli/process.go` unchanged. The `web_app_api_key` config field now holds a personal `rk_...` token instead of the shared env var secret.

---

## Verification

1. `rolls push` / `rolls pull` work with the new personal API key in `config.yml`
2. Web login at `/login` with email + password
3. Settings page shows API key section; generate key, paste into config, `rolls push` succeeds
4. Two accounts cannot see each other's rolls (test via curl with two different Bearer tokens)
5. Contact sheet URLs resolve: `https://rolls-b.yannick.computer/{userId}/{roll}.webp`
