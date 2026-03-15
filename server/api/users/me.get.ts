/**
 * server/api/users/me.get.ts
 * NanoFeed — GET /api/users/me
 *
 * Returns the currently authenticated user's full profile.
 * Requires authentication.
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const session = event.context.session

  if (!session?.user?.email) {
    throw createError({
      statusCode: HTTP.UNAUTHORIZED,
      data: errorResponse('Authentication required'),
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        githubId: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!user) {
      throw createError({
        statusCode: HTTP.NOT_FOUND,
        data: errorResponse('User not found'),
      })
    }

    return successResponse(user)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[GET /api/users/me]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to fetch user'),
    })
  }
})
