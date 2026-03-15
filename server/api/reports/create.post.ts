/**
 * server/api/reports/create.post.ts
 * NanoFeed — POST /api/reports/create
 *
 * Creates a report for a post or user.
 * Either postId or reportedUserId must be provided (not both).
 *
 * Body: { postId?, reportedUserId?, reason, notes? }
 * Requires authentication.
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'
import { REPORT_REASONS } from '#shared/constants/reportReasons'

export default defineEventHandler(async (event) => {
  const session = event.context.session

  if (!session?.user?.email) {
    throw createError({
      statusCode: HTTP.UNAUTHORIZED,
      data: errorResponse('Authentication required'),
    })
  }

  const body = await readBody<{
    postId?: string
    reportedUserId?: string
    reason?: string
    notes?: string
  }>(event)

  const { postId, reportedUserId, notes } = body
  const reason = body.reason as keyof typeof REPORT_REASONS | undefined

  // Validate: must report either a post OR a user (not both, not neither)
  if (!postId && !reportedUserId) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('Either postId or reportedUserId must be provided'),
    })
  }

  if (postId && reportedUserId) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse('Provide either postId or reportedUserId, not both'),
    })
  }

  if (!reason || !Object.values(REPORT_REASONS).includes(reason as never)) {
    throw createError({
      statusCode: HTTP.BAD_REQUEST,
      data: errorResponse(`Invalid reason. Must be one of: ${Object.values(REPORT_REASONS).join(', ')}`),
    })
  }

  try {
    const reporter = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!reporter) {
      throw createError({ statusCode: HTTP.NOT_FOUND, data: errorResponse('User not found') })
    }

    // Validate existence of the reported entity
    if (postId) {
      const post = await prisma.post.findUnique({ where: { id: postId } })
      if (!post) {
        throw createError({ statusCode: HTTP.NOT_FOUND, data: errorResponse('Post not found') })
      }
    }

    if (reportedUserId) {
      const reportedUser = await prisma.user.findUnique({ where: { id: reportedUserId } })
      if (!reportedUser) {
        throw createError({ statusCode: HTTP.NOT_FOUND, data: errorResponse('User not found') })
      }
    }

    const report = await prisma.report.create({
      data: {
        reporterId: reporter.id,
        postId: postId ?? null,
        reportedUserId: reportedUserId ?? null,
        reason: reason as 'SPAM' | 'HARASSMENT' | 'ILLEGAL_CONTENT' | 'OTHER',
        notes: notes?.trim() ?? null,
      },
    })

    setResponseStatus(event, HTTP.CREATED)
    return successResponse(report)
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    console.error('[POST /api/reports/create]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to create report'),
    })
  }
})
