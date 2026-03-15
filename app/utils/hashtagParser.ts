/**
 * app/utils/hashtagParser.ts
 * NanoFeed — Client-side Hashtag Parser & Renderer
 *
 * Parses post content and wraps hashtags in clickable NuxtLink elements.
 * Used in PostCard and FeedItem to render clickable hashtags.
 */

/**
 * Extract hashtag strings from content (without #)
 */
export function extractHashtags(content: string): string[] {
  const matches = content.match(/#([a-zA-Z0-9_]+)/g)
  if (!matches) return []
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))]
}

/**
 * Convert raw post content into HTML with clickable hashtag links.
 * Hashtags become anchor tags linking to /hashtags/:tag.
 *
 * ⚠️ Use v-html with this output only after sanitizing content
 * (posts are text-only, so XSS is minimal, but avoid trusting arbitrary HTML)
 */
export function renderContentWithHashtags(content: string): string {
  // Escape HTML to prevent XSS
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  // Replace hashtags with links
  return escaped.replace(
    /#([a-zA-Z0-9_]+)/g,
    '<a href="/hashtags/$1" class="hashtag">#$1</a>'
  )
}
