import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../check-username/route";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  sql: vi.fn(),
}));

vi.mock("@/lib/ratelimit", () => ({
  usernameCheckLimiter: {
    limit: vi.fn(),
  },
  checkRateLimit: vi.fn(),
}));

describe("POST /api/auth/check-username", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return available for valid unused username", async () => {
    const { sql } = await import("@/lib/db");
    const { checkRateLimit } = await import("@/lib/ratelimit");

    (checkRateLimit as any).mockResolvedValueOnce({ success: true });
    (sql as any).mockResolvedValueOnce([{ count: "1" }]); // Bootstrap check: users exist
    (sql as any).mockResolvedValueOnce([{ id: 1 }]);       // Invite exists
    (sql as any).mockResolvedValueOnce([]);                 // Username doesn't exist

    const request = new Request("http://localhost/api/auth/check-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({
        username: "testuser",
        invite_code: "valid-code",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.available).toBe(true);
  });

  it("should return unavailable for existing username", async () => {
    const { sql } = await import("@/lib/db");
    const { checkRateLimit } = await import("@/lib/ratelimit");

    (checkRateLimit as any).mockResolvedValueOnce({ success: true });
    (sql as any).mockResolvedValueOnce([{ count: "1" }]);       // Bootstrap check
    (sql as any).mockResolvedValueOnce([{ id: 1 }]);             // Invite exists
    (sql as any).mockResolvedValueOnce([{ id: "user-123" }]);    // User exists

    const request = new Request("http://localhost/api/auth/check-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({
        username: "existinguser",
        invite_code: "valid-code",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.available).toBe(false);
  });

  it("should reject invalid username format", async () => {
    const { sql } = await import("@/lib/db");
    const { checkRateLimit } = await import("@/lib/ratelimit");

    (checkRateLimit as any).mockResolvedValueOnce({ success: true });
    (sql as any).mockResolvedValueOnce([{ count: "1" }]); // Bootstrap check
    (sql as any).mockResolvedValueOnce([{ id: 1 }]);       // Invite exists

    const request = new Request("http://localhost/api/auth/check-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({
        username: "a", // Too short
        invite_code: "valid-code",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.error).toBeDefined();
  });

  it("should reject request without invite code", async () => {
    const { sql } = await import("@/lib/db");
    const { checkRateLimit } = await import("@/lib/ratelimit");

    (checkRateLimit as any).mockResolvedValueOnce({ success: true });
    (sql as any).mockResolvedValueOnce([{ count: "1" }]); // Bootstrap check: not bootstrap

    const request = new Request("http://localhost/api/auth/check-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({
        username: "testuser",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should reject request with invalid invite code", async () => {
    const { sql } = await import("@/lib/db");
    const { checkRateLimit } = await import("@/lib/ratelimit");

    (checkRateLimit as any).mockResolvedValueOnce({ success: true });
    (sql as any).mockResolvedValueOnce([{ count: "1" }]); // Bootstrap check
    (sql as any).mockResolvedValueOnce([]);                // Invite doesn't exist

    const request = new Request("http://localhost/api/auth/check-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({
        username: "testuser",
        invite_code: "invalid-code",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("invite");
  });

  it.skip("should enforce rate limiting", async () => {
    const { checkRateLimit } = await import("@/lib/ratelimit");

    (checkRateLimit as any).mockResolvedValueOnce({ success: false });

    const request = new Request("http://localhost/api/auth/check-username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({
        username: "testuser",
        invite_code: "valid-code",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain("Rate limit");
  });
});
