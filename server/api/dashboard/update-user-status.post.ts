/**
 * server/api/dashboard/update-user-status.post.ts
 * NanoFeed — POST /api/dashboard/update-user-status
 *
 * Allows admins to toggle verification, roles, and restrictions for users.
 * Body: { userId: string, verified?: boolean, role?: 'USER' | 'OWNER', isRestricted?: boolean, restrictionNote?: string }
 * Owner only (enforced by server/middleware/owner.ts)
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ 
    userId?: string, 
    verified?: boolean, 
    role?: 'USER' | 'OWNER',
    isRestricted?: boolean,
    restrictionNote?: string
  }>(event)
  
  const userId = String(body?.userId ?? '').trim()

  if (!userId) {
    throw createError({ statusCode: HTTP.BAD_REQUEST, data: errorResponse('userId is required') })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw createError({ statusCode: HTTP.NOT_FOUND, data: errorResponse('User not found') })
    }

    // If verified is being set to false from true, set verificationRemovedAt
    const isRevoking = body.verified === false && (user as any).verified === true
    const verificationRemovedAt = isRevoking ? new Date() : (user as any).verificationRemovedAt

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        verified: body.verified !== undefined ? body.verified : (user as any).verified,
        role: body.role !== undefined ? body.role : user.role,
        isRestricted: body.isRestricted !== undefined ? body.isRestricted : (user as any).isRestricted,
        restrictionNote: body.restrictionNote !== undefined ? body.restrictionNote : (user as any).restrictionNote,
        verificationRemovedAt: verificationRemovedAt
      } as any,
      select: {
        id: true,
        username: true,
        displayName: true,
        verified: true,
        role: true,
        isRestricted: true,
        restrictionNote: true
      } as any
    })

    return successResponse(updatedUser)
  } catch (error: unknown) {
    console.error('[POST /api/dashboard/update-user-status]', error)
    throw createError({ statusCode: HTTP.SERVER_ERROR, data: errorResponse('Failed to update user status') })
  }
})
