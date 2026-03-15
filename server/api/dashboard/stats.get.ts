/**
 * server/api/dashboard/stats.get.ts
 * NanoFeed — GET /api/dashboard/stats
 *
 * Returns aggregate statistics for the owner dashboard.
 * - Total user count
 * - Total post count
 * - Recent signups (last 7 days)
 * - Open report count
 * - Pending verification request count
 *
 * Owner only (enforced by server/middleware/owner.ts)
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Fetch all stats in parallel for efficiency
    const [
      totalUsers,
      totalPosts,
      recentSignups,
      openReports,
      pendingVerifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.report.count({ where: { status: 'OPEN' } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
    ])

    return successResponse({
      totalUsers,
      totalPosts,
      recentSignups,
      openReports,
      pendingVerifications,
    })
  } catch (error) {
    console.error('[GET /api/dashboard/stats]', error)
    throw createError({
      statusCode: HTTP.SERVER_ERROR,
      data: errorResponse('Failed to fetch dashboard stats'),
    })
  }
})
