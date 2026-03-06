# Multitenant Migration Plan

## Context

The app is currently single-user: one shared `API_KEY` env var, one `WEB_PASSWORD`, and all data in a global namespace. Making it multitenant means each user gets their own account (passwordless auth), their own CLI API key, and fully isolated cameras/films/rolls data.

**Key design decisions:**
- Cameras and films are **per-user** (different users have different gear)
- Roll numbers are **per-user unique** (two users can both have `25x07`)
- Auth: **WebAuthn (passkeys)** only → JWT session cookie; CLI uses per-user **API keys** (Bearer token protocol unchanged)
- **Zero Go CLI changes** — Bearer auth stays identical; only the token value changes from a shared secret to a personal API key
- **Passwordless by design** — no passwords to remember, leak, or phish (Face ID, Touch ID, security keys)

---

## 1. Database schema

Add `users` and `api_keys` tables. Add `user_id` FK column to `cameras`, `films`, `rolls`. Use a surrogate `internal_id BIGSERIAL` PK + unique constraint to handle per-user id namespacing without cascading FK changes.

**Run as two migrations:**

**Migration 002** (safe to run before code deploy — nullable columns, no constraints yet):
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT NOT NULL UNIQUE,   -- handle/slug (e.g., "yannick", "alice")
  name TEXT,                        -- display name (e.g., "Yannick Schutz")
  email TEXT NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,  -- security notifications
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webauthn_credentials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,  -- base64url encoded
  public_key TEXT NOT NULL,            -- COSE key
  counter BIGINT NOT NULL DEFAULT 0,   -- signature counter
  transports TEXT[],                    -- usb, nfc, ble, internal
  device_name TEXT,                     -- "iPhone 15", "YubiKey 5", etc.
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX webauthn_credentials_user_id_idx ON webauthn_credentials (user_id);
CREATE INDEX webauthn_credentials_credential_id_idx ON webauthn_credentials (credential_id);

CREATE TABLE api_keys (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,   -- SHA-256 of raw token
  label TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX api_keys_key_hash_idx ON api_keys (key_hash);

CREATE TABLE invites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL UNIQUE,       -- e.g., "FILM-2024-A3B9"
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  max_uses INTEGER DEFAULT 1,      -- null = unlimited
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,          -- null = never expires
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);
CREATE INDEX invites_code_idx ON invites (code);
CREATE INDEX invites_created_by_idx ON invites (created_by);

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

### `web/lib/db.ts` — add `user_id` field to Camera, Film, Roll interfaces; add new User, WebAuthnCredential, ApiKey, and Invite interfaces

---

## 2. New `web/lib/auth.ts`

Server-only module. Dependencies: `npm install jose @simplewebauthn/server @simplewebauthn/browser node-mailjet @upstash/ratelimit ioredis`

**WebAuthn functions:**
- `generateRegistrationOptions(email)` — creates challenge for new passkey
- `verifyRegistrationResponse(response, challenge)` — validates and stores credential
- `generateAuthenticationOptions(identifier)` — creates challenge for existing passkeys; accepts email or username
- `verifyAuthenticationResponse(response, challenge, credential)` — validates signature, updates counter
- `lookupUserByIdentifier(identifier)` — helper to find user by email or username

**Session & API key functions:**
- `createSessionToken` / `verifySessionToken` — HS256 JWT via `jose`, 1-year expiry
- `generateRawApiKey` — 32 random bytes prefixed `rk_`
- `hashApiKey(raw)` — SHA-256 hex (API keys have 256-bit entropy, SHA-256 is appropriate)
- `verifyApiKey(raw)` — DB lookup by hash → returns User; touches `last_used_at` async
- `makeSessionCookie` / `clearSessionCookie` — HttpOnly, SameSite=Strict, Secure in prod

**Email functions (via Mailjet):**
- `sendWelcomeEmail(user)` — sent on successful registration
- `sendInviteEmail(to, inviteCode, inviterName)` — optional, when user wants to email an invite
- `sendSecurityNotification(user, event)` — notify on API key creation, passkey changes

New Heroku env vars:
```sh
JWT_SECRET=$(openssl rand -hex 32)
WEBAUTHN_RP_NAME="Rolls"
WEBAUTHN_RP_ID="rolls.yannick.computer"  # domain only, no protocol
WEBAUTHN_ORIGIN="https://rolls.yannick.computer"
MAILJET_API_KEY="..."
MAILJET_SECRET_KEY="..."
MAILJET_FROM_EMAIL="noreply@rolls.yannick.computer"
MAILJET_FROM_NAME="Rolls"
REDIS_URL="..."  # Heroku Redis add-on (auto-provisioned)
```

---

## 3. Rewrite `web/middleware.ts`

Replace `API_KEY` string comparison with:
1. `Authorization: Bearer {raw}` → `verifyApiKey(raw)` → DB lookup → user
2. Else session cookie → `verifySessionToken` → user
3. No user → 401 for `/api/*`, redirect to `/login?from=...` for UI

Inject `x-user-id` and `x-user-email` request headers for downstream route handlers.

Public paths (no auth): `/login`, `/register`, `/api/auth/*` (WebAuthn endpoints)

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

**WebAuthn endpoints:**
| Route | Method | Purpose |
|-------|--------|---------|
| `api/auth/webauthn/register-options` | POST | Generate registration challenge (input: username, email, name, invite_code) |
| `api/auth/webauthn/register-verify` | POST | Verify credential, validate invite, create user, set session cookie |
| `api/auth/webauthn/login-options` | POST | Generate authentication challenge (input: identifier - email or username) |
| `api/auth/webauthn/login-verify` | POST | Verify signature, set session cookie |

**Session & API key endpoints:**
| Route | Method | Purpose |
|-------|--------|---------|
| `api/auth/logout` | POST | Clear session cookie |
| `api/auth/me` | GET | Return `{ user: { id, username, name, email }, credentials: [...] }` |
| `api/auth/api-keys` | GET/POST | List keys / create new (raw shown once) |
| `api/auth/api-keys/[id]` | DELETE | Revoke a key |
| `api/auth/credentials/[id]` | DELETE | Remove a passkey |

**Invite management endpoints:**
| Route | Method | Purpose |
|-------|--------|---------|
| `api/auth/invites` | GET | List all invites created by current user |
| `api/auth/invites` | POST | Create new invite code (input: max_uses, expires_at) |
| `api/auth/invites/[id]` | DELETE | Revoke an invite |
| `api/auth/invites/validate` | POST | Check if invite code is valid (input: code) |
| `api/auth/invites/send` | POST | Email an invite (input: invite_id, recipient_email, optional message) |

**Utility endpoints:**
| Route | Method | Purpose |
|-------|--------|---------|
| `api/auth/check-username` | POST | Check if username is available (input: username) - **RATE LIMITED** |
| `api/auth/email-preferences` | PATCH | Update email notification settings (input: email_notifications boolean) |

---

## 6. Security considerations for `/api/auth/check-username`

This endpoint is **high-risk for username enumeration attacks**. Implement these protections:

**Rate limiting (CRITICAL):**
- **Per-IP rate limit**: 10 requests per minute (using Heroku Redis + `@upstash/ratelimit`)
- **Per-session rate limit**: 20 requests per hour (track via cookie or session ID)
- Return `429 Too Many Requests` when exceeded
- Consider exponential backoff after repeated violations

**Response timing:**
- Use constant-time responses to prevent timing attacks
- Always take ~100-200ms regardless of username existence
- Add small random jitter to prevent statistical analysis

**Input validation:**
- Minimum username length: 3 characters
- Maximum username length: 20 characters
- Allowed characters: alphanumeric, underscore, hyphen only
- Reject obviously automated patterns (sequential checks, dictionary words)

**Response design (avoid leaking info):**
```typescript
// ❌ BAD - leaks information
{ available: true }
{ available: false, reason: "username taken" }

// ✅ GOOD - minimal, consistent responses
{ available: true }
{ available: false }  // no reason given

// Even better: only return during active registration flow
// Require valid invite code in the request to use this endpoint
```

**Additional hardening (RECOMMENDED):**
- **Require invite code**: Best defense - only allow username checks when user has entered valid invite code
  - Prevents bulk enumeration (attacker needs valid invites)
  - Ties checks to registration flow
  - Implementation: `POST /api/auth/check-username` requires `invite_code` in request body
- **CAPTCHA/challenge**: After 5 checks from same IP, require CAPTCHA (Cloudflare Turnstile or hCaptcha)
- **Logging**: Log excessive checks for abuse monitoring (alert on >50 checks/hour from single IP)
- **Honeypot**: Add fake delay (5-10s) for known attacker IPs in blocklist

**Implementation:**
```typescript
// Example rate limit with Heroku Redis
import { Ratelimit } from "@upstash/ratelimit";
import Redis from "ioredis";

// Create Redis client from Heroku REDIS_URL
const redis = new Redis(process.env.REDIS_URL!);

// Wrap in Upstash-compatible interface
const ratelimit = new Ratelimit({
  redis: {
    sadd: async (key, ...members) => redis.sadd(key, ...members),
    eval: async (...args) => redis.eval(...args),
  },
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success } = await ratelimit.limit(`username-check:${ip}`);

  if (!success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Add artificial delay to prevent timing attacks
  const startTime = Date.now();

  // Check username availability
  const username = await request.json().username;
  const exists = await db.query("SELECT 1 FROM users WHERE username = $1", [username]);

  // Ensure consistent response time (~150ms)
  const elapsed = Date.now() - startTime;
  if (elapsed < 150) {
    await new Promise(resolve => setTimeout(resolve, 150 - elapsed));
  }

  return Response.json({ available: !exists });
}
```

---

## 7. Update all data API routes

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

## 8. Email system (Mailjet)

**Transactional emails sent:**

1. **Welcome email** (`templates/welcome.tsx`)
   - Sent immediately after successful registration
   - Contains: username, getting started tips, link to generate API key for CLI
   - Triggered by: `api/auth/webauthn/register-verify` after user creation

2. **Invite email** (`templates/invite.tsx`) - **optional**
   - Sent when user clicks "Email invite" button in Settings
   - Contains: personalized message from inviter, registration link with embedded invite code
   - Triggered by: new `api/auth/invites/send` endpoint (input: email, invite_id)

3. **Security notification email** (`templates/security.tsx`)
   - Sent for important account changes:
     - New API key generated
     - New passkey added
     - Existing passkey deleted
   - Contains: event type, timestamp, device info (if available)
   - Optional: can be disabled in user preferences

**Mailjet setup:**
- Use Mailjet transactional API v3.1 (not marketing/contact lists)
- HTML emails with plain text fallback
- Email templates: create in `web/lib/email-templates/` directory
  - Option 1: React Email (recommended) - type-safe, component-based templates
  - Option 2: Plain HTML template strings
- Rate limiting: respect Mailjet's sending limits (default: 200 emails/second for transactional)
- Error handling: log failed emails, retry with exponential backoff for transient errors

**Email opt-out:**
- Welcome email: always sent
- Invite emails: controlled by inviter
- Security notifications: user can disable in Settings

---

## 9. Web UI changes

**Login/Registration flow:**
- **`app/login/page.tsx`** — **flexible login (email or username)**
  - Email or username input + "Continue" button → triggers WebAuthn authentication
  - Backend determines if input is email (contains @) or username, looks up user accordingly
  - Uses `@simplewebauthn/browser` for WebAuthn ceremony
- **New `app/register/page.tsx`** — **invite-only registration**
  - Invite code input (read from URL param `?invite=...` or manual entry)
  - Username input (unique handle, validates availability in real-time via debounced check)
    - **IMPORTANT**: Pass invite code to `/api/auth/check-username` to prevent abuse
    - Show availability indicator (✓ available, ✗ taken, ⏳ checking)
  - Name input (optional display name)
  - Email input + "Create passkey" button (triggers WebAuthn registration)
  - On success, user can optionally add device name for the credential ("iPhone 15", "MacBook Pro", etc.)
  - Invalid/expired/used invite shows error message

**Settings page:**
- **`app/settings/page.tsx`** — add four sections:
  1. **Passkeys**: list registered credentials with device names, "Add passkey" button, delete button for each
  2. **API Keys**: list keys with labels, generate new key (shown once with paste instructions for `config.yml`), delete key
  3. **Invites**: list created invites with usage stats, "Generate invite" button (optionally set max uses & expiration), copy invite link, "Email invite" button (opens modal), revoke button
  4. **Email Preferences**: toggle security notifications on/off
- **New `components/PasskeyManager.tsx`** — client component for passkey management UI
- **New `components/ApiKeyManager.tsx`** — client component for API key management UI
- **New `components/InviteManager.tsx`** — client component for invite management UI (includes email invite modal)

**Remove password dependencies:**
- **`app/HomeClient.tsx`, `app/new/page.tsx`** — remove `NEXT_PUBLIC_API_KEY` usage (cookie auth handles browser requests automatically)
- Remove `NEXT_PUBLIC_API_KEY` env var entirely
- Remove old `WEB_PASSWORD` login form

---

## 9. Invite-only registration system

**How it works:**
- New users **must** have a valid invite code to register
- Existing users can generate invite codes from Settings page
- Invite codes are shareable URLs: `https://rolls.yannick.computer/register?invite=FILM-2024-A3B9`
- Invites can be:
  - **Single-use** (default): consumed after one registration
  - **Multi-use**: set `max_uses` (e.g., 5 people)
  - **Unlimited**: `max_uses = null`
  - **Time-limited**: set `expires_at` timestamp
- Validation happens during registration:
  - Check if code exists and hasn't been revoked
  - Check if not expired (`expires_at > NOW()`)
  - Check if under usage limit (`used_count < max_uses`)
  - Increment `used_count` on successful registration

**Invite code format:**
- Human-readable: `FILM-YYYY-XXXX` (e.g., `FILM-2024-B7C3`)
- Or simple random: `crypto.randomBytes(8).toString('hex').toUpperCase()` → `A3F9B2C8E1D4F7A2`

**Admin override (first user only):**
- During migration, the `api/admin/seed-first-user` endpoint creates the first user **without an invite**
- After that, all registration requires valid invites

---

## 10. Migration runbook (preserving existing data)

1. **Deploy migration 002** while old code is still running — safe (nullable columns only)
2. **Deploy new app code** (middleware, auth, updated routes, invite system)
3. **Seed first user** via temporary `api/admin/seed-first-user` endpoint (protected: only runs when `users` table is empty):
   - Creates user from `{email}` request body (bypasses invite requirement)
   - `UPDATE cameras/films/rolls SET user_id = {newUserId} WHERE user_id IS NULL`
   - Creates initial API key; returns raw `rk_...` key once
   - Update `~/.config/rolls/config.yml` `web_app_api_key` with the raw key
   - Delete endpoint and redeploy
4. **Register first passkey**: Visit `/register?admin=true` (bypasses invite check for first user), enter email used in step 3, create passkey (Face ID/Touch ID)
5. **Generate first invite**: Login, go to Settings → Invites → "Generate invite", copy link to invite future users
6. **Deploy migration 003** (makes `user_id NOT NULL`)
7. **Rename R2 objects**: one-off script copies `{roll}.webp` → `{userId}/{roll}.webp`; run SQL to update `contact_sheet_url` column
8. **Configure Mailjet**:
   - Create Mailjet account and verify sending domain `rolls.yannick.computer`
   - Generate API key and secret from Mailjet dashboard
   - Test transactional email sending in development
9. **Provision Heroku Redis**:
   ```sh
   heroku addons:create heroku-redis:mini --app rolls
   # This auto-sets REDIS_URL env var
   ```
   - Test rate limiting in development (use local Redis or Redis Cloud free tier)
10. **Update Heroku config**:
   ```sh
   heroku config:set JWT_SECRET=$(openssl rand -hex 32) \
     WEBAUTHN_RP_NAME="Rolls" \
     WEBAUTHN_RP_ID="rolls.yannick.computer" \
     WEBAUTHN_ORIGIN="https://rolls.yannick.computer" \
     MAILJET_API_KEY="..." \
     MAILJET_SECRET_KEY="..." \
     MAILJET_FROM_EMAIL="noreply@rolls.yannick.computer" \
     MAILJET_FROM_NAME="Rolls" \
     --app rolls
   heroku config:unset API_KEY WEB_PASSWORD --app rolls
   ```

---

## 11. CLI — no changes

`roll/config.go`, `cli/push.go`, `cli/pull.go`, `cli/process.go` unchanged. The `web_app_api_key` config field now holds a personal `rk_...` token instead of the shared env var secret.

---

## Verification

1. **Invite system**: Settings → Invites → Generate invite, copy link, open in incognito window
2. **Invite validation**: Try registering without invite code (should fail), with expired invite (should fail), with valid invite (should succeed)
3. **WebAuthn registration**: Visit `/register?invite=...`, enter username/name/email, Face ID/Touch ID prompt creates account
4. **Welcome email**: Check inbox for welcome email with username and API key generation instructions
5. **WebAuthn login**: Visit `/login`, enter email OR username, Face ID/Touch ID unlocks session
6. **CLI auth**: Settings page shows API key section; generate key, paste into `config.yml`, `rolls push` succeeds
7. **Security notification**: Check inbox for API key generation notification email
8. **Email invite**: Settings → Invites → Select invite → "Email invite", enter recipient, check they receive invite email
9. **Multi-device passkeys**: Register passkey on iPhone, seamlessly login on MacBook (iCloud Keychain sync)
10. **Data isolation**: Two accounts cannot see each other's rolls (test via curl with two different Bearer tokens)
11. **Contact sheets**: URLs resolve correctly at `https://rolls-b.yannick.computer/{userId}/{roll}.webp`
12. **Passkey management**: Settings page lists all registered passkeys with device names, can delete individual credentials
13. **Invite usage tracking**: Create single-use invite, register new user, verify invite shows "used 1/1" and can't be reused
14. **Email preferences**: Settings → Email Preferences → Disable notifications, generate API key, verify no email sent
15. **Rate limiting**: Make 15+ username check requests in <1 minute, verify 429 response after limit
16. **Username enumeration protection**: Verify response time is consistent (~150ms) regardless of username existence

---

## Why WebAuthn Only (No Passwords)

**Security advantages:**
- **Phishing-resistant**: Public key cryptography ensures credentials work only on the registered domain
- **No password database**: Nothing to leak, breach, or crack
- **Replay-proof**: Each authentication uses a unique signature with an incrementing counter
- **No credential stuffing**: Users can't reuse passwords across sites

**UX advantages:**
- **Faster**: Face ID/Touch ID is quicker than typing passwords
- **No forgot password flow**: No reset emails, security questions, or password managers needed
- **Multi-device sync**: Passkeys sync via iCloud Keychain, 1Password, etc.
- **Works offline**: Biometric unlock works without network (session creation needs network)
- **Username or email login**: Flexible authentication - use whichever you remember

**CLI unchanged:**
- API keys remain the auth mechanism for headless/automation use cases
- Personal `rk_...` tokens are cryptographically secure (256-bit entropy)
- No awkward OAuth device flows needed for terminal usage

**Invite-only registration benefits:**
- **Controlled growth**: Manage who can create accounts during beta/early access
- **Spam prevention**: No open registration = no bot accounts
- **Community building**: Existing users can invite trusted friends
- **Usage tracking**: Know who invited whom, monitor growth patterns
- **Flexible policies**: Single-use for exclusivity, multi-use for families/teams, unlimited for open beta
