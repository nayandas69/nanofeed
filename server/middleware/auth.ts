/**
 * server/middleware/auth.ts
 * NanoFeed — Server Auth Middleware
 *
 * Protects all /api/* routes (except /api/auth/*) by verifying
 * that a valid Auth.js session exists.
 *
 * NOTE: This runs on every request. Routes that don't require
 * auth (e.g., public feed) still pass through — they just won't
 * have a session user attached. Individual handlers decide what
 * to restrict.
 */

import { getServerSession } from '#auth'
import { authOptions } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const path = event.path ?? ''

  // Skip middleware for Auth.js internal routes to avoid circular calls
  if (path.startsWith('/api/auth/')) return

  // Attach the session to the event context so handlers can access it
  const session = await getServerSession(event, authOptions)

  // Make session available downstream via event.context
  event.context.session = session
})
