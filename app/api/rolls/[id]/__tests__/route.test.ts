import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH, PUT } from "../route";
import type { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({ sql: vi.fn() }));
vi.mock("@/lib/request-context", () => ({ getUserId: vi.fn(() => Promise.resolve("user-123")) }));

describe("Roll Detail API Routes", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const TEST_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

  describe("GET /api/rolls/[id]", () => {
    it("should return roll if owned by user", async () => {
      const { sql } = await import("@/lib/db");
      (sql as any).mockResolvedValueOnce([{ uuid: TEST_UUID, roll_number: "26x01", user_id: "user-123" }]);
      const request = new Request(`http://localhost/api/rolls/${TEST_UUID}`) as unknown as NextRequest;
      const response = await GET(request, { params: Promise.resolve({ id: TEST_UUID }) });
      expect(response.status).toBe(200);
    });

    it("should return 404 if roll not found", async () => {
      const { sql } = await import("@/lib/db");
      (sql as any).mockResolvedValueOnce([]);
      const request = new Request("http://localhost/api/rolls/nonexistent") as unknown as NextRequest;
      const response = await GET(request, { params: Promise.resolve({ id: "nonexistent" }) });
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/rolls/[id]", () => {
    it("should update roll fields", async () => {
      const { sql } = await import("@/lib/db");
      (sql as any).unsafe = vi.fn().mockResolvedValueOnce([{ uuid: TEST_UUID, roll_number: "26x01", notes: "Updated" }]);
      const request = new Request(`http://localhost/api/rolls/${TEST_UUID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Updated" }),
      }) as unknown as NextRequest;
      const response = await PATCH(request, { params: Promise.resolve({ id: TEST_UUID }) });
      expect(response.status).toBe(200);
    });

    it("should return 400 when no fields to update", async () => {
      const request = new Request(`http://localhost/api/rolls/${TEST_UUID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }) as unknown as NextRequest;
      const response = await PATCH(request, { params: Promise.resolve({ id: TEST_UUID }) });
      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/rolls/[id]", () => {
    it("should update roll_number", async () => {
      const { sql } = await import("@/lib/db");
      (sql as any).unsafe = vi.fn().mockResolvedValueOnce([{ uuid: TEST_UUID, roll_number: "26x99", notes: null }]);
      const request = new Request(`http://localhost/api/rolls/${TEST_UUID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_number: "26x99" }),
      }) as unknown as NextRequest;
      const response = await PUT(request, { params: Promise.resolve({ id: TEST_UUID }) });
      expect(response.status).toBe(200);
    });
  });
});
