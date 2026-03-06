import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "../route";

vi.mock("@/lib/db", () => ({ sql: vi.fn() }));
vi.mock("@/lib/request-context", () => ({ getUserId: vi.fn(() => Promise.resolve("user-123")) }));

describe("Roll Detail API Routes", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("GET /api/rolls/[id]", () => {
    it("should return roll if owned by user", async () => {
      const { sql } = await import("@/lib/db");
      (sql as any).mockResolvedValueOnce([{ roll_number: "26x01", user_id: "user-123" }]);
      const request = new Request("http://localhost/api/rolls/26x01");
      const response = await GET(request, { params: Promise.resolve({ id: "26x01" }) });
      expect(response.status).toBe(200);
    });

    it("should return 404 if roll not found", async () => {
      const { sql } = await import("@/lib/db");
      (sql as any).mockResolvedValueOnce([]);
      const request = new Request("http://localhost/api/rolls/nonexistent");
      const response = await GET(request, { params: Promise.resolve({ id: "nonexistent" }) });
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/rolls/[id]", () => {
    it("should update roll fields", async () => {
      const { sql } = await import("@/lib/db");
      (sql as any).unsafe = vi.fn().mockResolvedValueOnce([{ roll_number: "26x01", notes: "Updated" }]);
      const request = new Request("http://localhost/api/rolls/26x01", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Updated" }),
      });
      const response = await PATCH(request, { params: Promise.resolve({ id: "26x01" }) });
      expect(response.status).toBe(200);
    });

    it("should return 400 when no fields to update", async () => {
      const request = new Request("http://localhost/api/rolls/26x01", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const response = await PATCH(request, { params: Promise.resolve({ id: "26x01" }) });
      expect(response.status).toBe(400);
    });
  });
});
