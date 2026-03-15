/**
 * server/api/verification/request.post.ts
 * NanoFeed — POST /api/verification/request
 *
 * Submits a verification request for the current authenticated user.
 * Users can only have one pending request at a time.
 *
 * Body: { realName, email, reason }
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

  const body = await readBody<{
    realName?: string
    email?: string
    reason?: string
  }>(event)

  // Validate all fields are provided
  const realName = String(body?.realName ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const reason = String(body?.reason ?? '').trim()

  if (!realName || !email || !reason) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('realName, email, and reason are all required'),
    })
  }

  if (reason.length < 20) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('Reason must be at least 20 characters'),
    })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('Invalid email address'),
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      throw createError({ statusCode: HTTP.NOT_FOUND, data: errorResponse('User not found') })
    }

    if (user.verified) {
      throw createError({
        statusCode: HTTP.CONFLICT,
        data: errorResponse('You are already verified'),
      })
    }

    // 7-day cooldown check
    if (user.verificationRemovedAt) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      if (user.verificationRemovedAt > sevenDaysAgo) {
        const remainingDays = Math.ceil((user.verificationRemovedAt.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24))
        throw createError({
          statusCode: HTTP.FORBIDDEN,
          data: errorResponse(`Verification was recently removed. You can re-apply in ${remainingDays} days.`),
        })
      }
    }

    // Check for an existing PENDING request
    const existing = await prisma.verificationRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' },
    })

    if (existing) {
      throw createError({
        statusCode: HTTP.CONFLICT,
        data: errorResponse('You already have a pending verification request'),
      })
    }

    const request = await prisma.verificationRequest.create({
      data: {
        userId: user.id,
        realName,
        email,
        reason,
      },
    })

    setResponseStatus(event, HTTP.CREATED)
    return successResponse(request)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[POST /api/verification/request]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to submit verification request'),
    })
  }
})
