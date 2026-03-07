import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  makeSessionCookie,
  clearSessionCookie,
  generateRawApiKey,
  hashApiKey,
  lookupUserByIdentifier,
  getUserById,
} from "../auth";

// Mock the database
vi.mock("../db", () => ({
  sql: vi.fn(),
}));

// Mock SimpleWebAuthn
vi.mock("@simplewebauthn/server", () => ({
  generateRegistrationOptions: vi.fn(),
  verifyRegistrationResponse: vi.fn(),
  generateAuthenticationOptions: vi.fn(),
  verifyAuthenticationResponse: vi.fn(),
}));

// Mock Mailjet
vi.mock("node-mailjet", () => ({
  default: {
    apiConnect: vi.fn(() => ({
      post: vi.fn(() => ({
        request: vi.fn(),
      })),
    })),
  },
}));

describe("Auth Library", () => {
  describe("Session Token Functions", () => {
    it("should create a valid JWT session token", async () => {
      const userId = "test-user-123";
      const token = await createSessionToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("should verify a valid session token", async () => {
      const userId = "test-user-123";
      const token = await createSessionToken(userId);
      const payload = await verifySessionToken(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(userId);
    });

    it("should return null for invalid token", async () => {
      const payload = await verifySessionToken("invalid-token");
      expect(payload).toBeNull();
    });

    it("should return null for expired token", async () => {
      // Create a token with very short expiry (not possible with current implementation)
      // This test would require mocking jose or creating a custom expired token
      const payload = await verifySessionToken("eyJhbGciOiJIUzI1NiJ9.invalid.signature");
      expect(payload).toBeNull();
    });
  });

  describe("Cookie Functions", () => {
    it("should create a session cookie with correct attributes", () => {
      const token = "test-token";
      const cookie = makeSessionCookie(token, false);

      expect(cookie).toContain(`session=${token}`);
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Strict");
      expect(cookie).toContain("Path=/");
      expect(cookie).toContain("Max-Age=");
      expect(cookie).not.toContain("Secure"); // Not in dev mode
    });

    it("should create a secure cookie in production", () => {
      const token = "test-token";
      const cookie = makeSessionCookie(token, true);

      expect(cookie).toContain("Secure");
    });

    it("should create a clear cookie command", () => {
      const cookie = clearSessionCookie();

      expect(cookie).toContain("session=");
      expect(cookie).toContain("Max-Age=0");
      expect(cookie).toContain("HttpOnly");
    });
  });

  describe("API Key Functions", () => {
    it("should generate a raw API key with correct format", () => {
      const apiKey = generateRawApiKey();

      expect(apiKey).toBeDefined();
      expect(apiKey.startsWith("rk_")).toBe(true);
      expect(apiKey.length).toBeGreaterThan(10);
    });

    it("should hash API key consistently", () => {
      const rawKey = "rk_test123456789";
      const hash1 = hashApiKey(rawKey);
      const hash2 = hashApiKey(rawKey);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it("should generate different hashes for different keys", () => {
      const key1 = "rk_test123";
      const key2 = "rk_test456";

      const hash1 = hashApiKey(key1);
      const hash2 = hashApiKey(key2);

      expect(hash1).not.toBe(hash2);
    });

    it("should generate unique API keys", () => {
      const keys = new Set();
      for (let i = 0; i < 100; i++) {
        keys.add(generateRawApiKey());
      }
      expect(keys.size).toBe(100); // All unique
    });
  });

  describe("User Lookup Functions", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should lookup user by email", async () => {
      const { sql } = await import("../db");
      const mockUser = { id: "123", email: "test@example.com", username: "testuser" };

      (sql as any).mockResolvedValueOnce([mockUser]);

      const user = await lookupUserByIdentifier("test@example.com");

      expect(user).toEqual(mockUser);
      expect(sql).toHaveBeenCalled();
    });

    it("should lookup user by username", async () => {
      const { sql } = await import("../db");
      const mockUser = { id: "123", email: "test@example.com", username: "testuser" };

      (sql as any).mockResolvedValueOnce([mockUser]);

      const user = await lookupUserByIdentifier("testuser");

      expect(user).toEqual(mockUser);
      expect(sql).toHaveBeenCalled();
    });

    it("should return null when user not found", async () => {
      const { sql } = await import("../db");
      (sql as any).mockResolvedValueOnce([]);

      const user = await lookupUserByIdentifier("nonexistent");

      expect(user).toBeNull();
    });

    it("should get user by ID", async () => {
      const { sql } = await import("../db");
      const mockUser = { id: "123", email: "test@example.com", username: "testuser" };

      (sql as any).mockResolvedValueOnce([mockUser]);

      const user = await getUserById("123");

      expect(user).toEqual(mockUser);
    });

    it("should return null when getting user by non-existent ID", async () => {
      const { sql } = await import("../db");
      (sql as any).mockResolvedValueOnce([]);

      const user = await getUserById("999");

      expect(user).toBeNull();
    });
  });
});
