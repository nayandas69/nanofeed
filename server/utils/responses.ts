/**
 * server/utils/responses.ts
 * NanoFeed — HTTP Response Helpers
 *
 * Provides consistent JSON response shapes across all API endpoints.
 */

/** Standard success response shape */
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
}

/** Standard error response shape */
export interface ApiError {
  success: false
  error: string
  code?: string
}

/**
 * Wrap data in a standard success envelope.
 */
export function successResponse<T>(data: T): ApiSuccess<T> {
  return { success: true, data }
}

/**
 * Create a standard error envelope with optional code.
 */
export function errorResponse(message: string, code?: string): ApiError {
  return { success: false, error: message, ...(code ? { code } : {}) }
}

/**
 * HTTP Status codes used across the API.
 */
export const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
} as const
