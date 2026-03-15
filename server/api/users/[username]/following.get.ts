// server/api/users/[username]/following.get.ts
import prisma from '../../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../../utils/responses'
import type { PublicUser } from '#shared/types/user'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('Username is required'),
    })
  }

  const session = event.context.session
  const currentUserId = session?.user?.id

  try {
    const follows = await prisma.follow.findMany({
      where: {
        follower: { username }
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            role: true,
            verified: true,
            createdAt: true,
            _count: {
              select: {
                followers: true,
                following: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const users = await Promise.all(follows.map(async (f) => {
      const user = f.following as any
      let isFollowing = false
      
      if (currentUserId && currentUserId !== user.id) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: user.id
            }
          }
        })
        isFollowing = !!follow
      }

      return {
        ...user,
        isFollowing
      } as PublicUser
    }))

    return successResponse(users)
  } catch (error: unknown) {
    console.error(`[GET /api/users/${username}/following]`, error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to fetch following'),
    })
  }
})
