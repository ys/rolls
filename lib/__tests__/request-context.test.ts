import { describe, it, expect, vi } from "vitest";
import { getUser, getUserId, getOptionalUserId } from "../request-context";
import { headers } from "next/headers";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

describe("Request Context", () => {
  describe("getUser", () => {
    it("should return user from headers", async () => {
      const mockHeaders = new Map([
        ["x-user-id", "user-123"],
        ["x-user-email", "test@example.com"],
        ["x-user-role", "admin"],
      ]);
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key) ?? null,
      });

      const user = await getUser();
      expect(user.id).toBe("user-123");
      expect(user.email).toBe("test@example.com");
      expect(user.role).toBe("admin");
    });

    it("should default role to 'user' when missing", async () => {
      const mockHeaders = new Map([
        ["x-user-id", "user-123"],
        ["x-user-email", "test@example.com"],
      ]);
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key) ?? null,
      });

      const user = await getUser();
      expect(user.role).toBe("user");
    });

    it("should throw error when user is missing", async () => {
      const mockHeaders = new Map();
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key) ?? null,
      });

      await expect(getUser()).rejects.toThrow("Authentication required");
    });
  });

  describe("getUserId", () => {
    it("should return user ID from headers", async () => {
      const mockHeaders = new Map([
        ["x-user-id", "user-123"],
        ["x-user-email", "test@example.com"],
      ]);
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key) ?? null,
      });

      const userId = await getUserId();
      expect(userId).toBe("user-123");
    });

    it("should throw error when user ID is missing", async () => {
      const mockHeaders = new Map();
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key) ?? null,
      });

      await expect(getUserId()).rejects.toThrow("Authentication required");
    });
  });

  describe("getOptionalUserId", () => {
    it("should return user ID when present", async () => {
      const mockHeaders = new Map([["x-user-id", "user-123"]]);
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key) ?? null,
      });

      const userId = await getOptionalUserId();
      expect(userId).toBe("user-123");
    });

    it("should return null when user ID is missing", async () => {
      const mockHeaders = new Map();
      (headers as any).mockReturnValue({
        get: (key: string) => mockHeaders.get(key) ?? null,
      });

      const userId = await getOptionalUserId();
      expect(userId).toBeNull();
    });
  });
});
