/**
 * server/api/users/update.patch.ts
 * NanoFeed — PATCH /api/users/update
 *
 * Updates the current user's editable profile fields:
 * - displayName
 * - username (must be unique, alphanumeric + underscores)
 * - avatar (URL)
 * - bio
 *
 * Users CANNOT change email or githubId via this endpoint.
 * Requires authentication.
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

/** Username validation regex: 3-30 chars, alphanumeric + underscores */
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/

export default defineEventHandler(async (event) => {
  const session = event.context.session

  if (!session?.user?.email) {
    throw createError({
      statusCode: HTTP.UNAUTHORIZED,
      data: errorResponse('Authentication required'),
    })
  }

  const body = await readBody<{
    displayName?: string
    username?: string
    avatar?: string
    bio?: string
  }>(event)

  // Build the update payload — only include provided fields
  const updateData: Record<string, string> = {}

  if (body.displayName !== undefined) {
    const name = String(body.displayName).trim()
    if (!name || name.length > 50) {
      throw createError({
        statusCode: HTTP.BAD_REQUEST,
        data: errorResponse('Display name must be 1–50 characters'),
      })
    }
    updateData.displayName = name
  }

  if (body.username !== undefined) {
    const username = String(body.username).trim().toLowerCase()
    if (!USERNAME_REGEX.test(username)) {
      throw createError({
        statusCode: HTTP.BAD_REQUEST,
        data: errorResponse('Username must be 3–30 characters (letters, numbers, underscores only)'),
      })
    }
    updateData.username = username
  }

  if (body.avatar !== undefined) {
    const avatar = String(body.avatar).trim()
    // Basic URL validation
    try {
      new URL(avatar)
    } catch {
      throw createError({
        statusCode: HTTP.BAD_REQUEST,
        data: errorResponse('Avatar must be a valid URL'),
      })
    }
    updateData.avatar = avatar
  }

  if (body.bio !== undefined) {
    const bio = String(body.bio).trim()
    if (bio.length > 160) {
      throw createError({
        statusCode: HTTP.BAD_REQUEST,
        data: errorResponse('Bio must be 160 characters or fewer'),
      })
    }
    updateData.bio = bio
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('No valid fields provided for update'),
    })
  }

  try {
    // Check username uniqueness if being updated
    if (updateData.username) {
      const existing = await prisma.user.findUnique({
        where: { username: updateData.username },
        select: { email: true },
      })

      if (existing && existing.email !== session.user.email) {
        throw createError({
          statusCode: HTTP.CONFLICT,
          data: errorResponse(`Username @${updateData.username} is already taken`),
        })
      }
    }

    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        verified: true,
        updatedAt: true,
      },
    })

    return successResponse(updated)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[PATCH /api/users/update]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to update profile'),
    })
  }
})
