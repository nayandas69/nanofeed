/**
 * shared/types/report.ts
 * NanoFeed — Report Type Definitions
 */

import type { ReportReason } from '../constants/reportReasons'
import type { PublicUser } from './user'
import type { PostWithAuthor } from './post'

/** Report status lifecycle */
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED'

/** Full report record */
export interface Report {
  id: string
  reporterId: string
  reporter: PublicUser
  postId: string | null
  post: PostWithAuthor | null
  reportedUserId: string | null
  reportedUser: PublicUser | null
  reason: ReportReason
  notes: string | null
  status: ReportStatus
  createdAt: Date
  updatedAt: Date
}

/** Input for creating a new report */
export interface CreateReportInput {
  /** ID of the post being reported (optional) */
  postId?: string
  /** ID of the user being reported (optional) */
  reportedUserId?: string
  /** Reason for the report */
  reason: ReportReason
  /** Optional additional notes */
  notes?: string
}
