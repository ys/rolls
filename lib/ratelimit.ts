import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import Redis from "ioredis";

// Create Redis client from Heroku REDIS_URL
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn("REDIS_URL not set, rate limiting will be disabled");
}

let redis: Redis | null = null;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    enableOfflineQueue: false,
  });
}

// Wrap ioredis in Upstash-compatible interface
function createUpstashRedisAdapter(client: Redis) {
  return {
    sadd: async (key: string, ...members: string[]) => {
      const result = await client.sadd(key, ...members);
      return result;
    },
    eval: async (...args: any[]) => {
      const result = await (client.eval as any)(...args);
      return result;
    },
    evalsha: async (...args: any[]) => {
      const result = await (client.evalsha as any)(...args);
      return result;
    },
    get: async (key: string) => {
      return await client.get(key);
    },
    set: async (key: string, value: string, options?: { ex?: number; px?: number }) => {
      if (options?.ex) {
        return await client.set(key, value, "EX", options.ex);
      } else if (options?.px) {
        return await client.set(key, value, "PX", options.px);
      }
      return await client.set(key, value);
    },
  } as any;
}

// Create rate limiters for different use cases
export const usernameCheckLimiter = redis
  ? new Ratelimit({
      redis: createUpstashRedisAdapter(redis),
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

export const apiLimiter = redis
  ? new Ratelimit({
      redis: createUpstashRedisAdapter(redis),
      limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

export const emailLimiter = redis
  ? new Ratelimit({
      redis: createUpstashRedisAdapter(redis),
      limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 emails per hour
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

// Helper function to check rate limit and return appropriate response
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  if (!limiter) {
    // Rate limiting disabled (no Redis configured)
    return { success: true };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
