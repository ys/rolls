import { beforeEach, vi } from "vitest";

// Mock server-only to prevent import errors
vi.mock("server-only", () => ({}));

// Mock environment variables for tests
process.env.JWT_SECRET = "test-secret-key-for-jwt-tokens-in-tests";
process.env.WEBAUTHN_RP_NAME = "Rolls Test";
process.env.WEBAUTHN_RP_ID = "localhost";
process.env.WEBAUTHN_ORIGIN = "http://localhost:3000";
process.env.MAILJET_API_KEY = "test-api-key";
process.env.MAILJET_SECRET_KEY = "test-secret-key";
process.env.MAILJET_FROM_EMAIL = "test@example.com";
process.env.MAILJET_FROM_NAME = "Rolls Test";

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
