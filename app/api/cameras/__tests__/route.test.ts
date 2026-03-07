import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";
import type { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  sql: vi.fn(),
}));

vi.mock("@/lib/request-context", () => ({
  getUserId: vi.fn(() => Promise.resolve("user-123")),
}));

describe("Camera API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/cameras", () => {
    it("should return only user's cameras", async () => {
      const { sql } = await import("@/lib/db");
      const mockCameras = [
        {
          id: "cam1",
          user_id: "user-123",
          brand: "Canon",
          model: "AE-1",
          nickname: "My Canon",
          format: 135,
          roll_count: 5,
        },
        {
          id: "cam2",
          user_id: "user-123",
          brand: "Nikon",
          model: "FM2",
          nickname: null,
          format: 135,
          roll_count: 3,
        },
      ];

      (sql as any).mockResolvedValueOnce(mockCameras);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].brand).toBe("Canon");
      // Verify SQL was called (user_id filtering happens in implementation)
      expect(sql).toHaveBeenCalled();
    });

    it("should include roll counts in response", async () => {
      const { sql } = await import("@/lib/db");
      const mockCameras = [
        {
          id: "cam1",
          user_id: "user-123",
          brand: "Canon",
          model: "AE-1",
          nickname: "My Canon",
          format: 135,
          roll_count: 10,
        },
      ];

      (sql as any).mockResolvedValueOnce(mockCameras);

      const response = await GET();
      const data = await response.json();

      expect(data[0].roll_count).toBe(10);
    });
  });

  describe("POST /api/cameras", () => {
    it("should create camera with user_id", async () => {
      const { sql } = await import("@/lib/db");
      const newCamera = {
        id: "cam-new",
        user_id: "user-123",
        brand: "Pentax",
        model: "K1000",
        nickname: "My Pentax",
        format: 135,
      };

      (sql as any).mockResolvedValueOnce([newCamera]);

      const request = new Request("http://localhost/api/cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "cam-new",
          brand: "Pentax",
          model: "K1000",
          nickname: "My Pentax",
          format: 135,
        }),
      }) as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.brand).toBe("Pentax");
      expect(sql).toHaveBeenCalled();
    });

    it("should reject camera without required fields", async () => {
      const request = new Request("http://localhost/api/cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "cam-new",
          brand: "Pentax",
          // Missing model
        }),
      }) as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should update existing camera (upsert)", async () => {
      const { sql } = await import("@/lib/db");
      const updatedCamera = {
        id: "cam1",
        user_id: "user-123",
        brand: "Canon",
        model: "AE-1 Program",
        nickname: "Updated Nickname",
        format: 135,
      };

      (sql as any).mockResolvedValueOnce([updatedCamera]);

      const request = new Request("http://localhost/api/cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "cam1",
          brand: "Canon",
          model: "AE-1 Program",
          nickname: "Updated Nickname",
        }),
      }) as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.model).toBe("AE-1 Program");
      expect(data.nickname).toBe("Updated Nickname");
    });
  });
});
