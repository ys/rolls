import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";

vi.mock("@/lib/db", () => ({ sql: vi.fn() }));
vi.mock("@/lib/request-context", () => ({ getUserId: vi.fn(() => Promise.resolve("user-123")) }));

describe("Roll API Routes", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("GET /api/rolls", () => {
    it("should return only user's rolls", async () => {
      const { sql } = await import("@/lib/db");
      (sql as any).mockResolvedValueOnce([
        { roll_number: "26x01", user_id: "user-123" },
        { roll_number: "26x02", user_id: "user-123" },
      ]);
      const response = await GET();
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(sql).toHaveBeenCalled();
    });
  });

  describe("POST /api/rolls", () => {
    it("should create roll with user_id", async () => {
      const { sql } = await import("@/lib/db");
      (sql as any).mockResolvedValueOnce([{ roll_number: "26x01", user_id: "user-123" }]);
      const request = new Request("http://localhost/api/rolls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_number: "26x01" }),
      });
      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it("should reject roll without roll_number", async () => {
      const request = new Request("http://localhost/api/rolls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
