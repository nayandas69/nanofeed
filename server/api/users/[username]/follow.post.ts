// server/api/users/[username]/follow.post.ts
import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  const session = event.context.session
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const username = getRouterParam(event, 'username')
  if (!username) {
    throw createError({ statusCode: 400, message: 'Username is required' })
  }

  // Look up target user by username
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true }
  })

  if (!targetUser) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const targetUserId = targetUser.id

  if (targetUserId === session.user.id) {
    throw createError({ statusCode: 400, message: 'You cannot follow yourself' })
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId
      }
    }
  })

  if (existingFollow) {
    // Unfollow
    await prisma.follow.delete({
      where: { id: existingFollow.id }
    })
    return { data: { followed: false } }
  } else {
    // Follow
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId
      }
    })
    return { data: { followed: true } }
  }
})
