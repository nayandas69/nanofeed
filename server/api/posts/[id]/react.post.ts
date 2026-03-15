/**
 * server/api/posts/[id]/react.post.ts
 * NanoFeed — POST /api/posts/[id]/react
 *
 * Toggles a "love" reaction for the authenticated user on a specific post.
 * Requires authentication.
 */

import prisma from '../../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../../utils/responses'

export default defineEventHandler(async (event) => {
  const session = event.context.session
  const postId = getRouterParam(event, 'id')

  if (!session?.user?.email) {
    throw createError({
      statusCode: HTTP.UNAUTHORIZED,
      data: errorResponse('Authentication required'),
    })
  }

  if (!postId) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('Post ID is required'),
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      throw createError({
        statusCode: HTTP.NOT_FOUND,
        data: errorResponse('User not found'),
      })
    }

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    })

    if (existingReaction) {
      // Remove reaction (unlike)
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      })
      return successResponse({ reacted: false })
    } else {
      // Add reaction (like)
      await prisma.reaction.create({
        data: {
          userId: user.id,
          postId: postId,
        },
      })
      return successResponse({ reacted: true })
    }
  } catch (error: unknown) {
    console.error(`[POST /api/posts/${postId}/react]`, error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to toggle reaction'),
    })
  }
})
