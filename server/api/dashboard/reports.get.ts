/**
 * server/api/dashboard/reports.get.ts
 * NanoFeed — GET /api/dashboard/reports
 *
 * Returns paginated list of all reports for owner review.
 * Owner only (enforced by server/middleware/owner.ts)
 */

import prisma from '../../db/prisma'
import { successResponse, errorResponse, HTTP } from '../../utils/responses'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20))
  const skip = (page - 1) * pageSize
  const status = String(query.status || 'OPEN') // filter by status
  const q = String(query.q || '').trim()

  try {
    const whereClause: any = ['OPEN', 'RESOLVED', 'DISMISSED'].includes(status)
      ? { status: status as 'OPEN' | 'RESOLVED' | 'DISMISSED' }
      : {}

    if (q) {
      whereClause.OR = [
        { notes: { contains: q, mode: 'insensitive' } },
        { reporter: { username: { contains: q, mode: 'insensitive' } } },
        { reporter: { displayName: { contains: q, mode: 'insensitive' } } },
        { reportedUser: { username: { contains: q, mode: 'insensitive' } } },
        { reportedUser: { displayName: { contains: q, mode: 'insensitive' } } },
        { post: { content: { contains: q, mode: 'insensitive' } } },
      ]
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, username: true, displayName: true, avatar: true },
          },
          post: {
            include: {
              author: {
                select: { id: true, username: true, displayName: true },
              },
            },
          },
          reportedUser: {
            select: { id: true, username: true, displayName: true, avatar: true },
          },
        },
      }),
      prisma.report.count({ where: whereClause }),
    ])

    // Grouping logic
    const groupedMap = new Map<string, any>()
    const individualReports: any[] = []

    reports.forEach((report) => {
      if (report.postId) {
        if (!groupedMap.has(report.postId)) {
          groupedMap.set(report.postId, {
            id: `grouped-post-${report.postId}`,
            type: 'POST',
            postId: report.postId,
            post: report.post,
            status: report.status,
            createdAt: report.createdAt,
            reports: []
          })
        }
        const group = groupedMap.get(report.postId)
        group.reports.push({
          id: report.id,
          reporter: report.reporter,
          reason: report.reason,
          notes: report.notes,
          createdAt: report.createdAt
        })
        // Ensure the group status reflects if any are OPEN
        if (report.status === 'OPEN') group.status = 'OPEN'
        // Use the oldest creation date as the group date
        if (new Date(report.createdAt) < new Date(group.createdAt)) {
          group.createdAt = report.createdAt
        }
      } else {
        individualReports.push({
          ...report,
          type: 'USER'
        })
      }
    })

    const finalReports = [...Array.from(groupedMap.values()), ...individualReports]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return successResponse({ 
      reports: finalReports, 
      total: finalReports.length,
      originalTotal: total
    })
  } catch (error) {
    console.error('[GET /api/dashboard/reports]', error)
    throw createError({ statusCode: HTTP.SERVER_ERROR, data: errorResponse('Failed to fetch reports') })
  }
})
