/**
 * server/middleware/rateLimit.ts
 * NanoFeed — In-Memory Rate Limiter
 *
 * Limits post creation to 5 posts per minute per user.
 * This uses in-memory storage — suitable for single-instance
 * deployments. For multi-instance (e.g., multiple Vercel regions),
 * use a Redis-backed solution like Upstash Rate Limit.
 *
 * Protected route: POST /api/posts/create
 */

import { errorResponse, HTTP } from '../utils/responses'

/** Rate limit configuration */
const RATE_LIMIT_CONFIG = {
  maxRequests: 5,     // Maximum posts allowed
  windowMs: 60_000,  // Per 60 seconds (1 minute)
}

/** In-memory store: userId → { count, resetAt } */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Clean up expired entries to prevent memory leaks.
 * Called periodically before each rate-limit check.
 */
function pruneExpiredEntries(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

export default defineEventHandler(async (event) => {
  const path = event.path ?? ''

  // Only apply to the post creation endpoint
  if (path !== '/api/posts/create' || event.method !== 'POST') return

  const session = event.context.session

  // Rate limit is tied to authenticated users — skip if no session
  if (!session?.user?.email) return

  const userId = session.user.email // Use email as a stable key
  const now = Date.now()

  // Prune expired entries periodically
  if (Math.random() < 0.1) pruneExpiredEntries()

  const record = rateLimitStore.get(userId)

  if (!record || now > record.resetAt) {
    // First request or window expired — start a new window
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_CONFIG.windowMs,
    })
    return
  }

  if (record.count >= RATE_LIMIT_CONFIG.maxRequests) {
    // Over the limit — calculate reset time
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000)

    setHeader(event, 'Retry-After', String(retryAfterSec))
    setHeader(event, 'X-RateLimit-Limit', String(RATE_LIMIT_CONFIG.maxRequests))
    setHeader(event, 'X-RateLimit-Remaining', '0')
    setHeader(event, 'X-RateLimit-Reset', String(Math.ceil(record.resetAt / 1000)))

    throw createError({
      statusCode: HTTP.RATE_LIMITED,
      data: errorResponse(
        `Too many posts. Try again in ${retryAfterSec} seconds.`,
        'RATE_LIMITED'
      ),
    })
  }

  // Increment the count within the current window
  record.count++
})
