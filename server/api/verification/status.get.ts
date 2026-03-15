/**
 * server/api/verification/status.get.ts
 * NanoFeed — GET /api/verification/status
 *
 * Returns the current user's most recent verification request status.
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

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, verified: true, verificationRemovedAt: true } as any,
    })

    if (!user) {
      throw createError({ statusCode: HTTP.NOT_FOUND, data: errorResponse('User not found') })
    }

    // Get most recent request
    const request = await prisma.verificationRequest.findFirst({
      where: { userId: (user as any).id },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({
      verified: user.verified,
      verificationRemovedAt: (user as any).verificationRemovedAt,
      request: request ?? null,
    })
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[GET /api/verification/status]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to fetch verification status'),
    })
  }
})
