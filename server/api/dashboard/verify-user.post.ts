/**
 * server/api/dashboard/verify-user.post.ts
 * NanoFeed — POST /api/dashboard/verify-user
 *
 * Accepts a verification request and marks the user as verified.
 * Body: { requestId: string }
 * Owner only (enforced by server/middleware/owner.ts)
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ requestId?: string }>(event)
  const requestId = String(body?.requestId ?? '').trim()

  if (!requestId) {
    throw createError({ statusCode: HTTP.BAD_REQUEST, data: errorResponse('requestId is required') })
  }

  try {
    // Find the pending request
    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: { user: { select: { id: true } } },
    })

    if (!request) {
      throw createError({ statusCode: HTTP.NOT_FOUND, data: errorResponse('Verification request not found') })
    }

    if (request.status !== 'PENDING') {
      throw createError({
        statusCode: HTTP.CONFLICT,
        data: errorResponse(`Request is already ${request.status.toLowerCase()}`),
      })
    }

    // Accept the request and verify the user in a transaction
    const [updatedRequest] = await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
      prisma.user.update({
        where: { id: request.user.id },
        data: { verified: true },
      }),
    ])

    return successResponse(updatedRequest)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[POST /api/dashboard/verify-user]', error)
    throw createError({ statusCode: HTTP.SERVER_ERROR, data: errorResponse('Failed to verify user') })
  }
})
