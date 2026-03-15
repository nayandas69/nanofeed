/**
 * server/api/posts/[id].delete.ts
 * NanoFeed — DELETE /api/posts/:id
 *
 * Deletes a post by ID.
 * Users can only delete their own posts.
 * Owner can delete any post.
 *
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

  const postId = getRouterParam(event, 'id')

  if (!postId) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('Post ID is required'),
    })
  }

  try {
    // Fetch the post and the current user in parallel
    const [post, currentUser] = await Promise.all([
      prisma.post.findUnique({ where: { id: postId } }),
      prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true },
      }),
    ])

    if (!post) {
      throw createError({
        statusCode: HTTP.NOT_FOUND,
        data: errorResponse('Post not found'),
      })
    }

    if (!currentUser) {
      throw createError({
        statusCode: HTTP.NOT_FOUND,
        data: errorResponse('User not found'),
      })
    }

    // Check ownership — only the author or owner can delete
    const isAuthor = post.authorId === currentUser.id
    const isOwner = currentUser.role === 'OWNER'

    if (!isAuthor && !isOwner) {
      throw createError({
        statusCode: HTTP.FORBIDDEN,
        data: errorResponse('You can only delete your own posts'),
      })
    }

    await prisma.post.delete({ where: { id: postId } })

    return successResponse({ deleted: true, id: postId })
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[DELETE /api/posts/:id]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to delete post'),
    })
  }
})
