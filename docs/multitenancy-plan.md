# Multitenant — Bootstrap & Role System

## Context

The branch already has a full WebAuthn/passkey + invite-code implementation. Two things need to change:

1. **Bootstrap without seed endpoint**: the current approach requires a manual `POST /api/admin/seed-first-user` before anyone can register. Instead, registration should work invite-free when `users` is empty — the first registrant auto-becomes admin. The seed endpoint is removed.

2. **Role system**: a `role` column (`'admin'` | `'user'`, default `'user'`) on the `users` table. Admins can manage invites. Role flows through middleware → `x-user-role` header → `getUserRole()` helper.

---

## 1. Schema migration — add `role` to `users`

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
```

Run via a new migration file or directly via `heroku pg:psql`. No backfill needed — existing rows get `'user'`; the first-user registration flow will set `'admin'` at insert time.

---

## 2. `lib/db.ts` — update `User` interface

Add `role: string` to the `User` interface (alongside `id`, `username`, `email`, etc.).

---

## 3. `app/api/auth/webauthn/register-options/route.ts`

Currently requires `invite_code` unconditionally. Change: before validating the invite, check if the `users` table is empty. If empty, skip invite validation entirely.

```typescript
// Check if this is the first user (bootstrap mode)
const [{ count }] = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM users`;
const isBootstrap = parseInt(count) === 0;

if (!isBootstrap) {
  // existing invite validation logic...
  if (!invite_code) return 400 "invite_code required"
  // validate invite...
}
// proceed to generate WebAuthn options
```

Also relax the required-fields check: `invite_code` is optional when bootstrap.

---

## 4. `app/api/auth/webauthn/register-verify/route.ts`

Same bootstrap check at verification time. If bootstrap:
- Skip invite validation
- Insert user with `role = 'admin'`
- Skip `UPDATE invites SET used_count...`

If not bootstrap:
- Validate invite (existing logic)
- Insert user with `role = 'user'` (default)

```typescript
const [{ count }] = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM users`;
const isBootstrap = parseInt(count) === 0;

// Insert user
const [user] = await sql<User[]>`
  INSERT INTO users (username, email, name, role)
  VALUES (${username}, ${email}, ${name || null}, ${isBootstrap ? 'admin' : 'user'})
  RETURNING *
`;

if (!isBootstrap) {
  // update invite used_count (existing code)
}
```

---

## 5. `app/register/page.tsx`

On mount, call a new lightweight endpoint `GET /api/auth/bootstrap` that returns `{ needsInvite: boolean }` (false when `users` is empty). If `needsInvite` is false, skip the invite step and go straight to the details step.

```typescript
useEffect(() => {
  fetch("/api/auth/bootstrap")
    .then(r => r.json())
    .then(({ needsInvite }) => {
      if (!needsInvite) setStep("details"); // skip invite step
    });
}, []);
```

Also remove the "Don't have an invite? Contact the admin." hint when in bootstrap mode.

---

## 6. New `app/api/auth/bootstrap/route.ts`

Public endpoint (add to `PUBLIC_PATHS` in `proxy.ts`):

```typescript
export async function GET() {
  const [{ count }] = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM users`;
  return NextResponse.json({ needsInvite: parseInt(count) > 0 });
}
```

---

## 7. `proxy.ts` — inject `x-user-role` header

`getUserById` already fetches the full `User` row. After auth succeeds, add:

```typescript
requestHeaders.set("x-user-role", user.role);
```

Also add admin-route enforcement: if path starts with `/api/admin/` and `user.role !== 'admin'`, return 403.

---

## 8. `lib/request-context.ts` — add `getUserRole()`

```typescript
export async function getUserRole(): Promise<string> {
  return (await headers()).get("x-user-role") ?? "user";
}

export async function requireAdmin(): Promise<void> {
  const role = await getUserRole();
  if (role !== "admin") throw new Error("Admin required");
}
```

---

## 9. Invite management — admin-only

`app/api/auth/invites/route.ts` (POST to create invite) should check that the caller is an admin:

```typescript
const role = await getUserRole();
if (role !== "admin") return NextResponse.json({ error: "Admin required" }, { status: 403 });
```

The GET (list own invites) can stay open to all users or admin-only — recommend admin-only for now since regular users can't create invites anyway.

---

## 10. Delete `app/api/admin/seed-first-user/route.ts`

Remove entirely. The bootstrap flow replaces it.

---

## Files changed

| File | Change |
|------|--------|
| `lib/schema.sql` | Add `role TEXT NOT NULL DEFAULT 'user'` to users table |
| `lib/db.ts` | Add `role: string` to `User` interface |
| `proxy.ts` | Inject `x-user-role` header; enforce admin on `/api/admin/*` |
| `lib/request-context.ts` | Add `getUserRole()` and `requireAdmin()` |
| `app/api/auth/webauthn/register-options/route.ts` | Skip invite check if no users exist |
| `app/api/auth/webauthn/register-verify/route.ts` | Skip invite, set `role='admin'` if no users |
| `app/register/page.tsx` | Check `/api/auth/bootstrap` on mount; skip invite step if `needsInvite=false` |
| `app/api/auth/invites/route.ts` | Require `role === 'admin'` for POST |
| `app/api/admin/seed-first-user/route.ts` | **Delete** |
| New: `app/api/auth/bootstrap/route.ts` | `GET` → `{ needsInvite: boolean }` |

---

## Verification

1. Fresh DB (no users): visit `/register` — invite step is skipped, goes straight to details
2. Complete registration — user is created with `role = 'admin'`
3. Admin generates invite code from Settings → shares link `/register?invite=xxx`
4. Second user registers with invite → gets `role = 'user'`
5. `POST /api/auth/invites` with second user's session → 403
6. `POST /api/auth/invites` with admin session → 201
7. `POST /api/admin/seed-first-user` → 404 (deleted)
