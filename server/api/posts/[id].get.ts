// server/api/posts/[id].get.ts
import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'id')

  if (!postId) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('Post ID is required'),
    })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId, hidden: false },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            verified: true,
            role: true
          }
        },
        _count: {
          select: {
            replies: true,
            reactions: true
          }
        },
        replies: {
          where: { hidden: false },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                verified: true,
                role: true
              }
            },
            _count: {
              select: {
                replies: true,
                reactions: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!post) {
      throw createError({
        statusCode: HTTP.NOT_FOUND,
        data: errorResponse('Post not found'),
      })
    }

    return successResponse(post)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error(`[GET /api/posts/${postId}]`, error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to fetch post'),
    })
  }
})
