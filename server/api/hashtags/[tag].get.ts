/**
 * server/api/hashtags/[tag].get.ts
 * NanoFeed — GET /api/hashtags/:tag
 *
 * Returns posts associated with a specific hashtag.
 * Publicly accessible — no authentication required.
 *
 * Route param: tag (without the leading #)
 * Query params: page, pageSize
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const tag = getRouterParam(event, 'tag')?.toLowerCase().replace(/^#/, '')

  if (!tag) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('Hashtag is required'),
    })
  }

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20))
  const skip = (page - 1) * pageSize

  try {
    // Verify hashtag exists
    const hashtag = await prisma.hashtag.findUnique({ where: { tag } })

    if (!hashtag) {
      throw createError({
        statusCode: HTTP.NOT_FOUND,
        data: errorResponse(`No posts found for #${tag}`),
      })
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          hashtags: { some: { tag } },
        },
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
        },
      }),
      prisma.post.count({
        where: { hashtags: { some: { tag } } },
      }),
    ])

    return successResponse({
      tag,
      posts,
      total,
      page,
      pageSize,
      hasMore: skip + posts.length < total,
    })
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[GET /api/hashtags/:tag]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to fetch hashtag posts'),
    })
  }
})
