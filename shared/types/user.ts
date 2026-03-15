/**
 * shared/types/user.ts
 * NanoFeed — User Type Definitions
 */

import type { Role } from '../constants/roles'

/** Full user record (server-side only — includes sensitive fields) */
export interface User {
  id: string
  githubId: string
  username: string
  displayName: string
  email: string
  avatar: string
  bio: string | null
  role: Role
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

/** Public user profile (safe to expose to clients) */
export interface PublicUser {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string | null
  role: Role
  verified: boolean
  createdAt: Date
  _count?: {
    followers: number
    following: number
  }
  isFollowing?: boolean
  isRestricted?: boolean
  restrictionNote?: string | null
}

/** Payload for updating user profile via PATCH /api/users/update */
export interface UpdateUserInput {
  displayName?: string
  username?: string
  avatar?: string
  bio?: string
}

/** Session user data returned by Auth.js */
export interface SessionUser {
  id: string
  username: string
  displayName: string
  avatar: string
  role: Role
  verified: boolean
  isRestricted: boolean
  restrictionNote: string | null
}
