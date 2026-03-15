/**
 * shared/constants/reportReasons.ts
 * NanoFeed — Report Reason Constants
 */

/** Available reasons for reporting content or users */
export const REPORT_REASONS = {
  SPAM: 'SPAM',
  HARASSMENT: 'HARASSMENT',
  ILLEGAL_CONTENT: 'ILLEGAL_CONTENT',
  OTHER: 'OTHER',
} as const

/** TypeScript type derived from the reason constants */
export type ReportReason = (typeof REPORT_REASONS)[keyof typeof REPORT_REASONS]

/** Human-readable labels for display in the UI */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Harassment',
  ILLEGAL_CONTENT: 'Illegal Content',
  OTHER: 'Other',
}
