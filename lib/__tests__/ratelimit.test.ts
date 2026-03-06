import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkRateLimit } from "../ratelimit";

// Mock Ratelimit
const mockLimit = vi.fn();
const mockRatelimit = {
  limit: mockLimit,
};

describe("Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkRateLimit", () => {
    it("should return success when rate limit not exceeded", async () => {
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
      });

      const result = await checkRateLimit(mockRatelimit as any, "test-identifier");

      expect(result.success).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(5);
      expect(mockLimit).toHaveBeenCalledWith("test-identifier");
    });

    it("should return failure when rate limit exceeded", async () => {
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      const result = await checkRateLimit(mockRatelimit as any, "test-identifier");

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should return success when limiter is null (disabled)", async () => {
      const result = await checkRateLimit(null, "test-identifier");

      expect(result.success).toBe(true);
      expect(result.limit).toBeUndefined();
      expect(result.remaining).toBeUndefined();
      expect(mockLimit).not.toHaveBeenCalled();
    });

    it("should handle different identifiers independently", async () => {
      mockLimit
        .mockResolvedValueOnce({
          success: true,
          limit: 10,
          remaining: 9,
          reset: Date.now() + 60000,
        })
        .mockResolvedValueOnce({
          success: true,
          limit: 10,
          remaining: 8,
          reset: Date.now() + 60000,
        });

      const result1 = await checkRateLimit(mockRatelimit as any, "identifier-1");
      const result2 = await checkRateLimit(mockRatelimit as any, "identifier-2");

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(mockLimit).toHaveBeenCalledTimes(2);
      expect(mockLimit).toHaveBeenNthCalledWith(1, "identifier-1");
      expect(mockLimit).toHaveBeenNthCalledWith(2, "identifier-2");
    });
  });
});
