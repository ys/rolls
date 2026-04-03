---
title: "iOS: Settings & API key management"
labels: enhancement, ios
---

Settings tab: account info, API keys, server URL, sign-out.

## Sections

### Account
- Username and email (read-only from `GET /api/auth/me`)

### API Keys
- List keys: label + last used date
- "New key" → create via `POST /api/auth/api-keys` → show one-time secret in alert
- Swipe-to-delete → `DELETE /api/auth/api-keys/:id` with confirmation

### Server
- Base URL text field (default `https://rolls.yannick.computer`)
- Stored in `UserDefaults`, read by `APIClient` at init
- Useful for pointing at a local dev server

### Sign Out
- Clears Keychain token + UserDefaults URL override
- Navigates to login screen

## Tasks

- [ ] `SettingsView` with `Form` and `Section`s
- [ ] `GET /api/auth/me` for account section
- [ ] API key list + create + revoke flows
- [ ] One-time key display alert (copy-to-clipboard button)
- [ ] Server URL field with live validation (must start with `https://`)
- [ ] Sign-out button (destructive style)
