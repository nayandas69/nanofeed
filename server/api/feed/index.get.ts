/**
 * server/api/feed/index.get.ts
 * NanoFeed — GET /api/feed
 *
 * Returns a paginated list of posts in reverse chronological order.
 * Publicly accessible — no authentication required.
 *
 * Query params:
 *   page     (number, default: 1)
 *   pageSize (number, default: 20, max: 50)
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Parse and validate pagination params
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20))
  const skip = (page - 1) * pageSize

  try {
    // Get current user if authenticated to check reactions
    let currentUserId: string | null = null
    const session = event.context.session
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      currentUserId = user?.id ?? null
    }

    // Fetch posts and total count in parallel for efficiency
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { hidden: false },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              role: true,
              verified: true,
            },
          },
          hashtags: {
            select: { tag: true },
          },
          reactions: currentUserId ? {
            where: { userId: currentUserId },
            select: { userId: true }
          } : false,
          _count: {
            select: {
              replies: true,
              reactions: true,
            },
          },
        },
      }),
      prisma.post.count({ where: { hidden: false } }),
    ])

    // Map hasReacted status
    const postsWithReactionStatus = posts.map(post => ({
      ...post,
      hasReacted: currentUserId ? (post as any).reactions.length > 0 : false,
      reactions: undefined // Remove reactions array from response
    }))

    return successResponse({
      posts: postsWithReactionStatus,
      total,
      page,
      pageSize,
      hasMore: skip + posts.length < total,
    })
  } catch (error) {
    console.error('[GET /api/feed]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to fetch feed'),
    })
  }
})
