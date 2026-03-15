/**
 * app/utils/validation.ts
 * NanoFeed — Client-side Validation Utilities
 */

import { POST_MAX_LENGTH, USERNAME_REGEX, BIO_MAX_LENGTH } from './constants'

/** Validate post content */
export function validatePostContent(content: string): string | null {
  const trimmed = content.trim()
  if (!trimmed) return 'Post cannot be empty'
  if (trimmed.length > POST_MAX_LENGTH) return `Post is too long (max ${POST_MAX_LENGTH} characters)`
  return null // valid
}

/** Validate username */
export function validateUsername(username: string): string | null {
  const trimmed = username.trim()
  if (!trimmed) return 'Username is required'
  if (!USERNAME_REGEX.test(trimmed)) {
    return 'Username must be 3–30 characters (letters, numbers, underscores only)'
  }
  return null
}

/** Validate display name */
export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Display name is required'
  if (trimmed.length > 50) return 'Display name must be 50 characters or fewer'
  return null
}

/** Validate bio */
export function validateBio(bio: string): string | null {
  if (bio.length > BIO_MAX_LENGTH) return `Bio must be ${BIO_MAX_LENGTH} characters or fewer`
  return null
}

/** Validate email */
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Invalid email address'
  return null
}
