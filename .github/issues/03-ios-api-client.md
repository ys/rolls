---
title: "iOS: API client & Keychain token storage"
labels: enhancement, ios
---

Thin networking layer that mirrors what the web app's `/api/*` routes expect.

## Tasks

- [ ] `APIClient` actor using `URLSession` with `async/await`
- [ ] Base URL configurable (prod `https://rolls.yannick.computer`, local override via Settings)
- [ ] `Authorization: Bearer {api_key}` header injected on every request
- [ ] Store API key in Keychain (`kSecClassGenericPassword`); never in `UserDefaults`
- [ ] Typed error enum: `unauthorized`, `notFound`, `serverError(Int)`, `decodingError`
- [ ] On 401 → clear Keychain token → navigate to login screen
- [ ] `JSONDecoder` with `keyDecodingStrategy: .convertFromSnakeCase` and `dateDecodingStrategy: .iso8601`
- [ ] Unit-testable via protocol + mock implementation

## Endpoints (Phase 1)

```
GET  /api/rolls              list rolls
GET  /api/rolls/:id          roll detail
POST /api/rolls              create roll
PATCH /api/rolls/:id         update roll
POST /api/rolls/archive      archive/unarchive
GET  /api/cameras            camera list
POST /api/cameras            create camera
PATCH /api/cameras/:id       update camera
DELETE /api/cameras/:id      delete camera
GET  /api/films              film list
POST /api/films              create film
PATCH /api/films/:id         update film
DELETE /api/films/:id        delete film
GET  /api/rolls/home         dashboard data
GET  /api/auth/me            current user
GET  /api/auth/api-keys      list API keys
POST /api/auth/api-keys      create API key
DELETE /api/auth/api-keys/:id revoke API key
PUT  /api/rolls/:id/contact-sheet  upload contact sheet
```
