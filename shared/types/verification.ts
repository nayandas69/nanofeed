/**
 * shared/types/verification.ts
 * NanoFeed — Verification Type Definitions
 */

import type { PublicUser } from './user'

/** Verification request status */
export type VerificationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

/** Full verification request record */
export interface VerificationRequest {
  id: string
  userId: string
  user: PublicUser
  realName: string
  email: string
  reason: string
  status: VerificationStatus
  createdAt: Date
  updatedAt: Date
}

/** Input for submitting a verification request */
export interface CreateVerificationInput {
  realName: string
  email: string
  reason: string
}
