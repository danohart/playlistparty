import { Redis } from "@upstash/redis";

// REST-based Redis client — safe to call from serverless functions (no
// persistent TCP connection to manage, unlike ioredis on Vercel).
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
