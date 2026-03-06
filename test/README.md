# Rolls Test Suite

Comprehensive test suite for the Rolls multitenancy authentication and API system.

## Overview

This test suite validates:
- **Authentication**: WebAuthn passkey registration/login, session management, API keys
- **Authorization**: User data isolation across all API endpoints
- **Rate Limiting**: Protection against abuse
- **Security**: Invite-only registration, username enumeration prevention
- **Data Integrity**: Proper user_id filtering on all queries

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests matching a pattern
npm test -- user-isolation
```

## Test Structure

```
test/
├── setup.ts                          # Test environment configuration
├── README.md                         # This file
└── integration/
    └── user-isolation.test.ts       # Cross-module isolation tests

lib/__tests__/
├── auth.test.ts                     # Authentication library tests
├── request-context.test.ts          # Request context utilities
└── ratelimit.test.ts                # Rate limiting tests

app/api/auth/__tests__/
├── check-username.test.ts           # Username availability endpoint
└── invites/__tests__/
    └── route.test.ts                # Invite management

app/api/cameras/__tests__/
└── route.test.ts                    # Camera CRUD with user isolation

app/api/rolls/__tests__/
├── route.test.ts                    # Roll list and creation
└── [id]/__tests__/
    └── route.test.ts                # Roll detail and updates
```

## Test Categories

### Unit Tests

Test individual functions and modules in isolation:
- `lib/__tests__/auth.test.ts` - JWT tokens, API keys, user lookup
- `lib/__tests__/request-context.test.ts` - Header extraction
- `lib/__tests__/ratelimit.test.ts` - Rate limiting logic

### API Route Tests

Test HTTP endpoints with mocked dependencies:
- Authentication routes (WebAuthn, sessions, API keys, invites)
- Data routes (cameras, films, rolls)
- Utility routes (username check, email preferences)

### Integration Tests

Test cross-module interactions and security properties:
- `test/integration/user-isolation.test.ts` - Validates users cannot access other users' data

## Key Test Scenarios

### User Isolation
Every test verifies that:
1. Queries include `user_id = ${userId}` filters
2. Users cannot access other users' resources (404 responses)
3. Joined queries filter all related tables by user_id

Example:
```typescript
it("should not allow user to access another user's camera", async () => {
  (getUserId as any).mockResolvedValueOnce("user-1");
  (sql as any).mockResolvedValueOnce([]); // Empty due to user_id filter

  const response = await GET(request, { params: { id: "other-user-camera" }});
  expect(response.status).toBe(404);
});
```

### Security
- Rate limiting on sensitive endpoints (username checks, emails)
- Constant-time responses to prevent timing attacks
- Invite code validation before username availability checks
- No data leakage in error messages

### Data Integrity
- Required fields validation
- Proper handling of optional/nullable fields
- Upsert operations (ON CONFLICT)
- Cascade operations respect user_id (e.g., film merges)

## Writing New Tests

When adding new features:

1. **Create a test file** next to the implementation:
   ```
   app/api/your-feature/route.ts
   app/api/your-feature/__tests__/route.test.ts
   ```

2. **Test user isolation** for all data operations:
   ```typescript
   it("should filter by user_id", async () => {
     expect(sql).toHaveBeenCalledWith(
       expect.arrayContaining([
         expect.stringContaining("user_id")
       ])
     );
   });
   ```

3. **Test error cases**:
   - Missing required fields
   - Invalid IDs
   - Unauthorized access
   - Rate limiting

4. **Mock external dependencies**:
   ```typescript
   vi.mock("@/lib/db", () => ({ sql: vi.fn() }));
   vi.mock("@/lib/request-context", () => ({
     getUserId: vi.fn(() => Promise.resolve("test-user-123")),
   }));
   ```

## Coverage Goals

Current coverage targets:
- **Auth library**: >90% (core security code)
- **API routes**: >80% (happy path + error cases)
- **Utilities**: >85% (rate limiting, request context)

View coverage report:
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests (GitHub Actions)
- Before deployments

## Debugging Tests

```bash
# Run with debug output
npm test -- --reporter=verbose

# Debug specific test in VS Code
# Add breakpoint and use "Debug Test" in Test Explorer

# Check why test is slow
npm test -- --reporter=verbose --test-timeout=10000
```

## Environment Variables

Tests use mock environment variables defined in `test/setup.ts`:
- `JWT_SECRET` - Test JWT signing key
- `WEBAUTHN_*` - WebAuthn configuration
- `MAILJET_*` - Email service credentials (mocked)

Real environment variables are NOT used in tests.

## Troubleshooting

**"Module not found" errors**
- Check path aliases in `vitest.config.ts`
- Ensure imports use `@/` prefix

**"Mock not working"**
- Mocks must be defined BEFORE imports
- Use `vi.clearAllMocks()` in `beforeEach()`

**"Test timeout"**
- Increase timeout: `test(..., { timeout: 10000 })`
- Check for unresolved promises

**"Cannot find module 'server-only'"**
- Server-only modules should be mocked or tested in node environment

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing/vitest)
