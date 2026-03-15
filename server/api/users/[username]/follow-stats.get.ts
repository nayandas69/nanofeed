// server/api/users/[username]/follow-stats.get.ts
import { getServerSession } from '#auth'
import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({ statusCode: 400, message: 'Username is required' })
  }

  const session = event.context.session
  const currentUserId = session?.user?.id

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      _count: {
        select: {
          followers: true,
          following: true
        }
      }
    }
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  let isFollowing = false
  if (currentUserId) {
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
    data: {
      followerCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing
    }
  }
})
