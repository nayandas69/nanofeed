/**
 * server/api/dashboard/reject-user.post.ts
 * NanoFeed — POST /api/dashboard/reject-user
 *
 * Rejects a verification request.
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
    const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } })

    if (!request) {
      throw createError({ statusCode: HTTP.NOT_FOUND, data: errorResponse('Verification request not found') })
    }

    if (request.status !== 'PENDING') {
      throw createError({
        statusCode: HTTP.CONFLICT,
        data: errorResponse(`Request is already ${request.status.toLowerCase()}`),
      })
    }

    const updated = await prisma.verificationRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    })

    return successResponse(updated)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[POST /api/dashboard/reject-user]', error)
    throw createError({ statusCode: HTTP.SERVER_ERROR, data: errorResponse('Failed to reject verification') })
  }
})
