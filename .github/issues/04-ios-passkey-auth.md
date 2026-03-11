---
title: "iOS: Passkey authentication (native WebAuthn via ASAuthorization)"
labels: enhancement, ios
---

Replace the web's WebAuthn flow with a native `ASAuthorizationController` using the same server endpoints.

The existing `/api/auth/webauthn/*` endpoints are standard WebAuthn — `AuthenticationServices` on iOS speaks the same protocol.

## Tasks

- [ ] `AuthViewModel` wraps `ASAuthorizationController`
- [ ] **Registration** (first launch / add passkey):
  1. `POST /api/auth/webauthn/register-options` → challenge + user info
  2. Present `ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest`
  3. `POST /api/auth/webauthn/register-verify` with attestation response
  4. On success, create API key via `POST /api/auth/api-keys`, store in Keychain
- [ ] **Login** (subsequent launches):
  1. `POST /api/auth/webauthn/login-options`
  2. Present `ASAuthorizationController` (supports conditional UI / Face ID autofill)
  3. `POST /api/auth/webauthn/login-verify`
  4. On success, retrieve or refresh stored API key
- [ ] Handle `userCancelled` gracefully (stay on login screen, no error banner)
- [ ] Error sheet on auth failure with retry button
- [ ] `@AppStorage("isLoggedIn")` or similar gate for root navigation

## Notes

- Requires `Associated Domains` entitlement: `webcredentials:rolls.yannick.computer`
- The server's `WEBAUTHN_RP_ID` must match — already set to `rolls.yannick.computer`
- Apple requires the domain to serve `/.well-known/apple-app-site-association` — add this to the Next.js app
