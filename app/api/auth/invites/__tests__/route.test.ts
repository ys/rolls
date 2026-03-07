import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  sql: vi.fn(),
}));

vi.mock("@/lib/request-context", () => ({
  getUser: vi.fn(() => Promise.resolve({ id: "user-123", email: "test@example.com", role: "admin" })),
  getUserId: vi.fn(() => Promise.resolve("user-123")),
}));

// Mock crypto
vi.mock("crypto", () => ({
  default: {
    randomBytes: vi.fn(() => ({
      toString: vi.fn(() => "abc123xyz"),
    })),
  },
}));

describe("Invite Management Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/auth/invites", () => {
    it("should return user's invites", async () => {
      const { sql } = await import("@/lib/db");
      const mockInvites = [
        {
          id: 1,
          code: "abc123",
          created_by: "user-123",
          max_uses: 5,
          used_count: 2,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          code: "xyz789",
          created_by: "user-123",
          max_uses: null,
          used_count: 0,
          expires_at: null,
          created_at: new Date().toISOString(),
        },
      ];

      (sql as any).mockResolvedValueOnce(mockInvites);

      const request = new Request("http://localhost/api/auth/invites");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invites).toHaveLength(2);
      expect(data.invites[0].isValid).toBe(true);
      expect(data.invites[1].isValid).toBe(true);
    });

    it("should mark expired invites as invalid", async () => {
      const { sql } = await import("@/lib/db");
      const mockInvites = [
        {
          id: 1,
          code: "expired",
          created_by: "user-123",
          max_uses: 5,
          used_count: 2,
          expires_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          created_at: new Date().toISOString(),
        },
      ];

      (sql as any).mockResolvedValueOnce(mockInvites);

      const request = new Request("http://localhost/api/auth/invites");
      const response = await GET(request);
      const data = await response.json();

      expect(data.invites[0].isValid).toBe(false);
    });

    it("should mark fully used invites as invalid", async () => {
      const { sql } = await import("@/lib/db");
      const mockInvites = [
        {
          id: 1,
          code: "full",
          created_by: "user-123",
          max_uses: 3,
          used_count: 3,
          expires_at: null,
          created_at: new Date().toISOString(),
        },
      ];

      (sql as any).mockResolvedValueOnce(mockInvites);

      const request = new Request("http://localhost/api/auth/invites");
      const response = await GET(request);
      const data = await response.json();

      expect(data.invites[0].isValid).toBe(false);
    });
  });

  describe("POST /api/auth/invites", () => {
    it("should create invite with max_uses", async () => {
      const { sql } = await import("@/lib/db");
      const mockInvite = {
        id: 1,
        code: "abc123xy",
        created_by: "user-123",
        max_uses: 5,
        used_count: 0,
        expires_at: null,
        created_at: new Date().toISOString(),
      };

      (sql as any).mockResolvedValueOnce([mockInvite]);

      const request = new Request("http://localhost/api/auth/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_uses: 5 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invite.code).toBe("abc123xy");
      expect(data.invite.max_uses).toBe(5);
      expect(data.invite.isValid).toBe(true);
    });

    it("should create invite with expiration", async () => {
      const { sql } = await import("@/lib/db");
      const futureDate = new Date(Date.now() + 7 * 86400000);
      const mockInvite = {
        id: 1,
        code: "abc123xy",
        created_by: "user-123",
        max_uses: null,
        used_count: 0,
        expires_at: futureDate.toISOString(),
        created_at: new Date().toISOString(),
      };

      (sql as any).mockResolvedValueOnce([mockInvite]);

      const request = new Request("http://localhost/api/auth/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expires_in_days: 7 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invite.expires_at).toBeDefined();
    });

    it("should create unlimited invite", async () => {
      const { sql } = await import("@/lib/db");
      const mockInvite = {
        id: 1,
        code: "abc123xy",
        created_by: "user-123",
        max_uses: null,
        used_count: 0,
        expires_at: null,
        created_at: new Date().toISOString(),
      };

      (sql as any).mockResolvedValueOnce([mockInvite]);

      const request = new Request("http://localhost/api/auth/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.invite.max_uses).toBeNull();
      expect(data.invite.expires_at).toBeNull();
    });
  });
});
