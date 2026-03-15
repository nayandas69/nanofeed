/**
 * server/utils/parseHashtags.ts
 * NanoFeed — Hashtag Parser
 *
 * Extracts unique hashtag tokens from post content.
 * Hashtags are stored lowercase without the leading '#'.
 */

/**
 * Parse all hashtags from a post's content string.
 *
 * @param content - Raw post text
 * @returns Array of unique lowercase hashtag strings (without #)
 *
 * @example
 * parseHashtags("Hello #World and #opensource!")
 * // → ["world", "opensource"]
 */
export function parseHashtags(content: string): string[] {
  // Match word characters after '#', ignore case
  const matches = content.match(/#([a-zA-Z0-9_]+)/g)

  if (!matches) return []

  // Remove '#' prefix, lowercase, and deduplicate
  const tags = matches.map((tag) => tag.slice(1).toLowerCase())
  return [...new Set(tags)]
}
