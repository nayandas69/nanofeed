/**
 * server/api/posts/index.get.ts
 * NanoFeed — GET /api/posts
 *
 * Returns posts for a specific user profile.
 * Requires query param: username
 *
 * Query params:
 *   username (string, required)
 *   page     (number, default: 1)
 *   pageSize (number, default: 20)
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const username = String(query.username ?? '').trim()

  if (!username) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('username query parameter is required'),
    })
  }

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20))
  const skip = (page - 1) * pageSize

  try {
    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        verified: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    })

    if (!user) {
      throw createError({
        statusCode: HTTP.NOT_FOUND,
        data: errorResponse(`User @${username} not found`),
      })
    }

    // Fetch user's posts with pagination
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: user.id, hidden: false, parentId: null }, // Only main posts on profile
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
          hashtags: { select: { tag: true } },
          _count: {
            select: {
              replies: true,
              reactions: true,
            },
          },
        },
      }),
      prisma.post.count({ where: { authorId: user.id, hidden: false, parentId: null } }),
    ])

    return successResponse({
      user,
      posts,
      total,
      page,
      pageSize,
      hasMore: skip + posts.length < total,
    })
  } catch (error: unknown) {
    // Re-throw intentional createError errors
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[GET /api/posts]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to fetch posts'),
    })
  }
})
