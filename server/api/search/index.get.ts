/**
 * server/api/search/index.get.ts
 * NanoFeed — GET /api/search
 *
 * Global search endpoint for users, posts, and hashtags.
 * Returns results grouped by category.
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q || '').trim()

  if (!q) {
    return successResponse({
      users: [],
      posts: [],
      hashtags: [],
    })
  }

  try {
    const [users, posts, hashtags] = await Promise.all([
      // Search Users
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true,
          role: true,
        },
      }),

      // Search Posts
      prisma.post.findMany({
        where: {
          content: { contains: q, mode: 'insensitive' },
        },
        take: 10,
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
        },
      }),

      // Search Hashtags
      prisma.hashtag.findMany({
        where: {
          tag: { contains: q.replace(/^#/, ''), mode: 'insensitive' },
        },
        take: 5,
        orderBy: { posts: { _count: 'desc' } },
      }),
    ])

    return successResponse({
      users,
      posts,
      hashtags,
    })
  } catch (error) {
    console.error('[GET /api/search]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Search failed'),
    })
  }
})
