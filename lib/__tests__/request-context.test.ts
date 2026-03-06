import { describe, it, expect, vi } from "vitest";
import { getUserId, getUserEmail, getOptionalUserId } from "../request-context";
import { headers } from "next/headers";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

describe("Request Context", () => {
  describe("getUserId", () => {
    it("should return user ID from headers", async () => {
      const mockHeaders = new Map([["x-user-id", "user-123"]]);
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key),
      });

      const userId = await getUserId();
      expect(userId).toBe("user-123");
    });

    it("should throw error when user ID is missing", async () => {
      const mockHeaders = new Map();
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key),
      });

      await expect(getUserId()).rejects.toThrow("Authentication required");
    });
  });

  describe("getUserEmail", () => {
    it("should return user email from headers", async () => {
      const mockHeaders = new Map([["x-user-email", "test@example.com"]]);
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key),
      });

      const email = await getUserEmail();
      expect(email).toBe("test@example.com");
    });

    it("should throw error when user email is missing", async () => {
      const mockHeaders = new Map();
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key),
      });

      await expect(getUserEmail()).rejects.toThrow("Authentication required");
    });
  });

  describe("getOptionalUserId", () => {
    it("should return user ID when present", async () => {
      const mockHeaders = new Map([["x-user-id", "user-123"]]);
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key),
      });

      const userId = await getOptionalUserId();
      expect(userId).toBe("user-123");
    });

    it("should return null when user ID is missing", async () => {
      const mockHeaders = new Map();
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key),
      });

      const userId = await getOptionalUserId();
      expect(userId).toBeUndefined();
    });
  });
});
