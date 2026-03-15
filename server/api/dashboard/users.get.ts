/**
 * server/api/dashboard/users.get.ts
 * NanoFeed — GET /api/dashboard/users
 *
 * Fetches a list of all users for admin management.
 * Owner only (enforced by server/middleware/owner.ts)
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q || '').trim()

  try {
    const whereClause = q ? {
      OR: [
        { username: { contains: q, mode: 'insensitive' as const } },
        { displayName: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
      ]
    } : {}

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        role: true,
        verified: true,
        isRestricted: true,
        restrictionNote: true,
        createdAt: true,
        _count: {
          select: { posts: true }
        }
      } as any
    })

    return successResponse({ users })
  } catch (error: unknown) {
    console.error('[GET /api/dashboard/users]', error)
    throw createError({ statusCode: HTTP.SERVER_ERROR, data: errorResponse('Failed to fetch users') })
  }
})
