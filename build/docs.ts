import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import MarkdownIt from 'markdown-it'
import { parseDocument } from 'yaml'
import type { DocsArticle } from '../shared/types/docs'

export function compileArticle(filename: string, source: string): DocsArticle {
  const slug = filename.replace(/\.md$/i, '').toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error(`Invalid docs filename: ${filename}`)
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)
  const parsed = frontmatter ? parseDocument(frontmatter[1]!) : null
  if (parsed?.errors.length)
    throw new Error(`Invalid frontmatter in ${filename}: ${parsed.errors[0]!.message}`)
  const metadata = (parsed?.toJS() ?? {}) as Record<string, unknown>
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata))
    throw new Error(`Invalid metadata in ${filename}`)
  for (const key of ['title', 'description', 'category']) {
    if (typeof metadata[key] !== 'string' || !metadata[key].trim())
      throw new Error(`Missing ${key} in ${filename}`)
  }
  if (!Number.isFinite(metadata.order) || !Number.isInteger(metadata.order))
    throw new Error(`Invalid order in ${filename}`)
  if (
    metadata.published !== undefined &&
    (typeof metadata.published !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(metadata.published) ||
      !Number.isFinite(Date.parse(metadata.published)) ||
      new Date(metadata.published).toISOString().slice(0, 10) !== metadata.published)
  ) {
    throw new Error(`Invalid published date in ${filename}`)
  }
  // Provenance markers remain in source but are not article content.
  const body = source
    .slice(frontmatter?.[0].length ?? 0)
    .replace(
      /^<!-- (?:coderabbit-ai-generated:v1|\/coderabbit-ai-generated:v1|coderabbit-ai-generated-section:v1:[a-f0-9]{64}) -->\s*$/gm,
      '',
    )
  // Repository Markdown is rendered as text; HTML and unsafe link schemes stay disabled.
  const markdown = new MarkdownIt({ html: false, typographer: false })
  const renderFence = markdown.renderer.rules.fence!
  markdown.renderer.rules.fence = (tokens, index, options, env, renderer) => {
    const language = tokens[index]!.info.trim().split(/\s+/)[0] || 'text'
    const label = markdown.utils.escapeHtml(language)
    return `<div class="docs-code-block"><div class="code-toolbar"><span>${label}</span><button type="button" class="copy-code" aria-label="Copy ${label} code">Copy</button></div>${renderFence(tokens, index, options, env, renderer)}</div>`
  }
  const tokens = markdown.parse(body, {})
  const headings: DocsArticle['headings'] = []
  const usedIds = new Set<string>()
  let topHeading = false
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!
    if (token.type === 'heading_open') {
      const level = Number(token.tag.slice(1))
      if (level === 1) {
        if (topHeading || i !== 0) throw new Error(`Use one leading H1 in ${filename}`)
        topHeading = true
        // The page header renders the article title, avoiding two H1 elements.
        tokens.splice(i, 3)
        i--
        continue
      }
      const inline = tokens[i + 1]!
      const text = (inline.children ?? []).map((child) => child.content).join('') || inline.content
      const base =
        text
          .toLowerCase()
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-') || 'section'
      let id = base
      for (let suffix = 1; usedIds.has(id); suffix++) id = `${base}-${suffix}`
      usedIds.add(id)
      token.attrSet('id', id)
      if (level <= 3) headings.push({ id, text, level })
    }
    if (token.type === 'inline') {
      for (const child of token.children ?? []) {
        if (child.type === 'image') {
          const src = child.attrGet('src')
          // Keep image paths usable on GitHub while serving the same files from Nuxt public/.
          if (typeof src === 'string' && src.startsWith('../public/docs/screenshots/'))
            child.attrSet('src', src.replace('../public/', '/'))
        }
        if (child.type !== 'link_open') continue
        const href = child.attrGet('href')
        const local =
          typeof href === 'string' && /^(?:\.\/)?([a-z0-9-]+)\.md(#[^\s]*)?$/i.exec(href)
        if (local) child.attrSet('href', `/docs/${local[1]!.toLowerCase()}${local[2] || ''}`)
      }
    }
  }
  return {
    slug,
    filename,
    title: metadata.title as string,
    description: metadata.description as string,
    category: metadata.category as string,
    order: metadata.order as number,
    ...(metadata.published ? { published: metadata.published as string } : {}),
    readingMinutes: Math.max(1, Math.ceil(body.split(/\s+/).length / 220)),
    html: markdown.renderer.render(tokens, markdown.options, {}),
    headings,
    headingIds: [...usedIds],
  }
}

export async function loadDocs(directory: string): Promise<DocsArticle[]> {
  const files = (await readdir(directory)).filter((file) => /\.md$/i.test(file)).sort()
  const articles = await Promise.all(
    files.map(async (file) => compileArticle(file, await readFile(join(directory, file), 'utf8'))),
  )
  if (new Set(articles.map((article) => article.slug)).size !== articles.length)
    throw new Error('Duplicate documentation slugs')
  for (const article of articles) {
    for (const [, slug, anchor] of article.html.matchAll(
      /href="\/docs\/([a-z0-9-]+)(?:#([^"]+))?"/g,
    )) {
      const target = articles.find((item) => item.slug === slug)
      if (!target || (anchor && !target.headingIds.includes(anchor)))
        throw new Error(
          `Broken docs link in ${article.filename}: ${slug}${anchor ? `#${anchor}` : ''}`,
        )
    }
  }
  return articles.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
}
