/**
 * shared/constants/roles.ts
 * NanoFeed — User Role Constants
 */

/** Enum-style role constants to avoid magic strings */
export const ROLES = {
  USER: 'USER',
  OWNER: 'OWNER',
} as const

/** TypeScript type derived from the role constants */
export type Role = (typeof ROLES)[keyof typeof ROLES]
