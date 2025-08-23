// Simple in-memory cache for notifications per user
// Not production-grade: process-local, no TTL persistence across restarts

const cache = new Map(); // userId -> { data, cachedAt }
const DEFAULT_TTL_MS = 5000; // 5 seconds

export function getCachedNotifications(userId, ttlMs = DEFAULT_TTL_MS) {
  const entry = cache.get(String(userId));
  if (!entry) return null;
  const isFresh = Date.now() - entry.cachedAt < ttlMs;
  return isFresh ? entry.data : null;
}

export function setCachedNotifications(userId, data) {
  cache.set(String(userId), { data, cachedAt: Date.now() });
}

export function invalidateNotifications(userId) {
  cache.delete(String(userId));
}


