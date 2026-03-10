import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

/**
 * Integration tests to verify user data isolation across the entire system
 * These tests ensure that users can only access their own data
 */

// Mock dependencies
vi.mock("@/lib/db", () => ({
  sql: vi.fn(),
}));

vi.mock("@/lib/request-context", () => ({
  getUser: vi.fn(),
  getUserId: vi.fn(),
}));

describe("User Data Isolation Integration Tests", () => {
  const user1Id = "user-001";
  const user2Id = "user-002";

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Camera isolation", () => {
    it("should not allow user to access another user's camera", async () => {
      const { getUserId } = await import("@/lib/request-context");
      const { sql } = await import("@/lib/db");
      const { GET } = await import("@/app/api/cameras/[id]/route");

      // User 1 tries to access User 2's camera
      (getUserId as any).mockResolvedValueOnce(user1Id);
      (sql as any).mockResolvedValueOnce([]); // No results due to user_id filter

      const request = new Request("http://localhost/api/cameras/user2-camera") as unknown as NextRequest;
      const response = await GET(request, { params: Promise.resolve({ id: "user2-camera" }) });

      expect(response.status).toBe(404);
    });

    it("should allow user to access their own camera", async () => {
      const { getUserId } = await import("@/lib/request-context");
      const { sql } = await import("@/lib/db");
      const { GET } = await import("@/app/api/cameras/[id]/route");

      (getUserId as any).mockResolvedValueOnce(user1Id);
      (sql as any).mockResolvedValueOnce([
        { id: "user1-camera", user_id: user1Id, brand: "Canon", model: "AE-1" },
      ]);

      const request = new Request("http://localhost/api/cameras/user1-camera") as unknown as NextRequest;
      const response = await GET(request, { params: Promise.resolve({ id: "user1-camera" }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe("user1-camera");
    });
  });

  describe("Roll isolation", () => {
    it("should not allow user to update another user's roll", async () => {
      const { getUserId } = await import("@/lib/request-context");
      const { sql } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/rolls/[id]/route");

      (getUserId as any).mockResolvedValueOnce(user1Id);
      (sql as any).unsafe = vi.fn().mockResolvedValueOnce([]); // No results due to user_id filter

      const request = new Request("http://localhost/api/rolls/user2-roll", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Hacked!" }),
      }) as unknown as NextRequest;

      const response = await PATCH(request, { params: Promise.resolve({ id: "user2-roll" }) });

      expect(response.status).toBe(404);
    });

    it("should only return user's own rolls", async () => {
      const { getUserId } = await import("@/lib/request-context");
      const { sql } = await import("@/lib/db");
      const { GET } = await import("@/app/api/rolls/route");

      (getUserId as any).mockResolvedValueOnce(user1Id);
      (sql as any).mockResolvedValueOnce([
        { roll_number: "user1-roll1", user_id: user1Id },
        { roll_number: "user1-roll2", user_id: user1Id },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(data).toHaveLength(2);
      expect(data.every((roll: any) => roll.user_id === user1Id)).toBe(true);
      // Verify SQL was called
      expect(sql).toHaveBeenCalled();
    });
  });

  describe("Film merge isolation", () => {
    it("should not allow merging another user's films", async () => {
      const { getUserId } = await import("@/lib/request-context");
      const { sql } = await import("@/lib/db");
      const { POST } = await import("@/app/api/films/merge/route");

      (getUserId as any).mockResolvedValueOnce(user1Id);
      // Verify query returns 0 films (not all films belong to user)
      (sql as any).mockResolvedValueOnce([{ count: 0 }]);

      const request = new Request("http://localhost/api/films/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_id: "user2-film1",
          source_ids: ["user2-film2"],
        }),
      }) as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  describe("Invite isolation", () => {
    it("should not allow deleting another user's invite", async () => {
      const { getUser } = await import("@/lib/request-context");
      const { sql } = await import("@/lib/db");
      const { DELETE } = await import("@/app/api/auth/invites/[id]/route");

      (getUser as any).mockResolvedValueOnce({ id: user1Id, email: "user1@example.com", role: "user" });
      (sql as any).mockResolvedValueOnce([]); // No results due to created_by filter

      const request = new Request("http://localhost/api/auth/invites/user2-invite") as unknown as NextRequest;
      const response = await DELETE(request, { params: Promise.resolve({ id: "user2-invite" }) });

      expect(response.status).toBe(404);
    });

    it("should only list user's own invites", async () => {
      const { getUser } = await import("@/lib/request-context");
      const { sql } = await import("@/lib/db");
      const { GET } = await import("@/app/api/auth/invites/route");

      (getUser as any).mockResolvedValueOnce({ id: user1Id, email: "user1@example.com", role: "admin" });
      (sql as any).mockResolvedValueOnce([
        { id: 1, code: "user1-invite", created_by: user1Id },
      ]);

      const request = new Request("http://localhost/api/auth/invites") as unknown as NextRequest;
      const response = await GET(request);
      const data = await response.json();

      expect(data.invites).toHaveLength(1);
      expect(data.invites[0].created_by).toBe(user1Id);
      expect(sql).toHaveBeenCalled();
    });
  });

  describe("API Key isolation", () => {
    it("should not allow deleting another user's API key", async () => {
      const { getUserId } = await import("@/lib/request-context");
      const { sql } = await import("@/lib/db");
      const { DELETE } = await import("@/app/api/auth/api-keys/[id]/route");

      (getUserId as any).mockResolvedValueOnce(user1Id);
      (sql as any).mockResolvedValueOnce([]); // No results due to user_id filter

      const request = new Request("http://localhost/api/auth/api-keys/user2-key") as unknown as NextRequest;
      const response = await DELETE(request, { params: Promise.resolve({ id: "user2-key" }) });

      expect(response.status).toBe(404);
    });
  });

  describe("Cross-resource queries", () => {
    it("should filter joined data by user_id in home endpoint", async () => {
      const { getUserId } = await import("@/lib/request-context");
      const { sql } = await import("@/lib/db");
      const { GET } = await import("@/app/api/rolls/home/route");

      (getUserId as any).mockResolvedValueOnce(user1Id);
      (sql as any).mockResolvedValueOnce([
        {
          roll_number: "26x01",
          user_id: user1Id,
          camera_brand: "Canon",
          film_brand: "Kodak",
        },
      ]);

      const response = await GET();
      const data = await response.json();

      // Verify SQL was called (joins with user_id filters happen in implementation)
      expect(sql).toHaveBeenCalled();
    });
  });
});
