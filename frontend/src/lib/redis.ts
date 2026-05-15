import { Redis } from '@upstash/redis';

/**
 * HIGH-PERFORMANCE REDIS CACHING LAYER
 * 
 * Optimized for:
 * 1. Safe Initialization (Prevents crashes if env vars are missing)
 * 2. Cache-Aside Pattern (Standardizes how data is cached)
 * 3. Graceful Fallback (Doesn't break the app if Redis is down)
 */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = (redisUrl && redisToken) 
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

/**
 * CACHE-ASIDE UTILITY
 * 
 * Automatically checks Redis first, falls back to DB on miss, 
 * and populates the cache for future requests.
 */
export async function getCachedData<T>(
  key: string, 
  fetcher: () => Promise<T>, 
  ttl = 3600
): Promise<T> {
  if (!redis) return fetcher();

  try {
    const cached = await redis.get<T>(key);
    if (cached) return cached;

    const freshData = await fetcher();
    if (freshData) {
      await redis.set(key, freshData, { ex: ttl });
    }
    return freshData;
  } catch (error) {
    console.warn(`Redis Error for key ${key}:`, error);
    return fetcher();
  }
}

/**
 * CACHE INVALIDATION UTILITY
 */
export async function invalidateCache(key: string) {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Cache Invalidation Error for ${key}:`, error);
  }
}
