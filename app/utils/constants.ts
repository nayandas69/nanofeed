/**
 * app/utils/constants.ts
 * NanoFeed — App-wide Constants
 */

/** Maximum post length in characters */
export const POST_MAX_LENGTH = 280

/** Default page size for paginated endpoints */
export const DEFAULT_PAGE_SIZE = 20

/** GitHub avatar URL template */
export const githubAvatarUrl = (githubId: string | number): string =>
  `https://avatars.githubusercontent.com/u/${githubId}?v=4`

/** App name */
export const APP_NAME = 'NanoFeed'

/** Minimum username length */
export const USERNAME_MIN_LENGTH = 3

/** Maximum username length */
export const USERNAME_MAX_LENGTH = 30

/** Username validation regex */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/

/** Bio max length */
export const BIO_MAX_LENGTH = 160
