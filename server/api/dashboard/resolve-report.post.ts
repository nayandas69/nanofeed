/**
 * server/api/dashboard/resolve-report.post.ts
 * NanoFeed — POST /api/dashboard/resolve-report
 *
 * Resolves a report and optionally hides the associated post.
 * Body: { reportId: string, action: 'RESOLVE' | 'DISMISS', hidePost?: boolean }
 * Owner only (enforced by server/middleware/owner.ts)
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ reportId?: string, postId?: string, action?: 'RESOLVE' | 'DISMISS', hidePost?: boolean }>(event)
  const reportId = String(body?.reportId ?? '').trim()
  const postId = String(body?.postId ?? '').trim()
  const action = body?.action || 'RESOLVE'
  const hidePost = body?.hidePost ?? false

  if (!reportId && !postId) {
    throw createError({ statusCode: HTTP.BAD_REQUEST, data: errorResponse('reportId or postId is required') })
  }

  const targetStatus = action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED'

  try {
    if (postId) {
      // Resolve all reports for this post
      await prisma.report.updateMany({
        where: { postId, status: 'OPEN' },
        data: { status: targetStatus }
      })

      if (hidePost) {
        await prisma.post.update({
          where: { id: postId },
          data: { hidden: true }
        })
      }

      return successResponse({ success: true, postId, action })
    }

    // Individual report logic (existing)
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { post: true }
    })

    if (!report) {
      throw createError({ statusCode: HTTP.NOT_FOUND, data: errorResponse('Report not found') })
    }

    // Resolve the report
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED'
      }
    })

    // If hidePost is requested and there is a post, hide it
    if (hidePost && report.postId) {
      await prisma.post.update({
        where: { id: report.postId },
        data: { hidden: true }
      })
    }

    return successResponse({ report: updatedReport, postHidden: hidePost && !!report.postId })
  } catch (error: unknown) {
    console.error('[POST /api/dashboard/resolve-report]', error)
    throw createError({ statusCode: HTTP.SERVER_ERROR, data: errorResponse('Failed to resolve report') })
  }
})
