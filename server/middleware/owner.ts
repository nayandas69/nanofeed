/**
 * server/middleware/owner.ts
 * NanoFeed — Owner-Only Route Guard
 *
 * Restricts access to /api/dashboard/* routes.
 * Only users with role === 'OWNER' may access these routes.
 *
 * Returns 403 Forbidden for all other authenticated users,
 * and 401 Unauthorized for unauthenticated requests.
 */

import prisma from '../db/prisma'
import { errorResponse, HTTP } from '../utils/responses'

export default defineEventHandler(async (event) => {
  const path = event.path ?? ''

  // Only guard dashboard routes
  if (!path.startsWith('/api/dashboard/')) return

  const session = event.context.session

  // Must be authenticated
  if (!session?.user?.email) {
    throw createError({
      statusCode: HTTP.UNAUTHORIZED,
      data: errorResponse('Authentication required'),
    })
  }

  // Look up user with their role from the database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  if (!user || user.role !== 'OWNER') {
    throw createError({
      statusCode: HTTP.FORBIDDEN,
      data: errorResponse('Access denied — owner only'),
    })
  }
})
