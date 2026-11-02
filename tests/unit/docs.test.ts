import { expect, it } from 'vitest'
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { compileArticle, loadDocs } from '../../build/docs'

const header =
  '---\ntitle: Test guide\ndescription: A test guide.\ncategory: Tests\norder: 1\n---\n\n# Test guide\n\n'
it('renders Markdown without executing raw HTML or unsafe link schemes', () => {
  const article = compileArticle(
    'TEST.md',
    `${header}<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n![x](data:text/html,bad)\n\n\`\`\`html\n<img src=x onerror=alert(1)>\n\`\`\`\n\n| Name | Value |\n| --- | --- |\n| Safe | Yes |`,
  )
  expect(article.html).not.toContain('<script>')
  expect(article.html).not.toContain('<img')
  expect(article.html).not.toContain('href="javascript:')
  expect(article.html).not.toContain('src="data:')
  expect(article.html).toContain('&lt;script&gt;')
  expect(article.html).toContain('<table>')
  expect(article.html).toContain('language-html')
})
it('builds stable section anchors and rewrites GitHub Markdown links', () => {
  const article = compileArticle(
    'TEST.md',
    `${header}## A section\n\n[Setup](NEON.md#a-section)\n\n## A section\n\n### Details`,
  )
  expect(article.slug).toBe('test')
  expect(article.headings.map((item) => item.id)).toEqual(['a-section', 'a-section-1', 'details'])
  expect(article.html).toContain('href="/docs/neon#a-section"')
  expect(article.html).not.toContain('<h1>')
  expect(article.readingMinutes).toBeGreaterThan(0)
})
it('rejects malformed article metadata and filenames at build time', () => {
  expect(() => compileArticle('../BAD.md', header)).toThrow('filename')
  expect(() => compileArticle('BAD.md', '# No metadata')).toThrow('title')
  expect(() => compileArticle('BAD.md', header.replace('order: 1', 'order: first'))).toThrow(
    'order',
  )
  expect(() =>
    compileArticle('BAD.md', header.replace('order: 1', 'order: 1\npublished: tomorrow')),
  ).toThrow('date')
  expect(() =>
    compileArticle('BAD.md', header.replace('order: 1', 'order: 1\npublished: "2026-02-31"')),
  ).toThrow('date')
  expect(() => compileArticle('BAD.md', header + '# Another H1')).toThrow('H1')
})
it('compiles every published guide and resolves internal guide and section links', async () => {
  const docs = await loadDocs('docs')
  expect(docs.map((item) => item.slug)).toEqual([
    'using-nanofeed',
    'account',
    'badges',
    'connecting',
    'conversations',
    'getting-started',
    'neon',
    'github-auth',
    'migration',
    'deployment',
    'recommendations',
    'upgrades',
    'writing',
    'contributing',
    'troubleshooting',
    'roadmap',
  ])
  expect(docs.find((item) => item.slug === 'github-auth')?.html).toContain(
    'https://nanofeed.vercel.app/api/auth/callback/github',
  )
  for (const article of docs) {
    for (const [, image] of article.html.matchAll(/src="(\/docs\/screenshots\/[^"?#]+)"/g)) {
      await expect(access(join('public', image!))).resolves.toBeUndefined()
    }
  }
})

it('serves public screenshot paths while leaving external image URLs alone', () => {
  const article = compileArticle(
    'TEST.md',
    `${header}![Example](../public/docs/screenshots/home.png)\n\n![Remote](https://example.com/image.png)`,
  )
  expect(article.html).toContain('src="/docs/screenshots/home.png"')
  expect(article.html).toContain('src="https://example.com/image.png"')
})

it('accepts links to H4–H6 anchors while keeping only H2–H3 in the table of contents', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nanofeed-docs-'))
  try {
    await writeFile(
      join(directory, 'TARGET.md'),
      `${header}## Overview\n\n### Details\n\n#### Deep\n\n##### Deeper\n\n###### Deepest`,
    )
    const links = `${header}[H4](TARGET.md#deep) [H5](TARGET.md#deeper) [H6](TARGET.md#deepest)`
    await writeFile(join(directory, 'SOURCE.md'), links)
    const articles = await loadDocs(directory)
    const target = articles.find((article) => article.slug === 'target')!
    expect(target.headings.map((heading) => heading.id)).toEqual(['overview', 'details'])
    expect(target.headingIds).toEqual(['overview', 'details', 'deep', 'deeper', 'deepest'])
    await writeFile(join(directory, 'SOURCE.md'), `${links}\n\n[Missing](TARGET.md#missing)`)
    await expect(loadDocs(directory)).rejects.toThrow('Broken docs link')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

it('adds accessible language headers while escaping code and fence metadata', () => {
  const article = compileArticle(
    'TEST.md',
    `${header}\n\`\`\`bash\nnpm run format\n\`\`\`\n\n\`\`\`\n<example>\n\`\`\`\n\n\`\`\`<img>\nunsafe\n\`\`\``,
  )
  expect(article.html).toContain('aria-label="Copy bash code"')
  expect(article.html).toContain('<span>bash</span>')
  expect(article.html).toContain('<pre><code class="language-bash">npm run format\n</code></pre>')
  expect(article.html).toContain('<span>text</span>')
  expect(article.html).toContain('&lt;example&gt;')
  expect(article.html).toContain('<span>&lt;img&gt;</span>')
  expect(article.html).not.toContain('<img>')
})

it('hides generated provenance markers without enabling raw HTML', () => {
  const article = compileArticle(
    'TEST.md',
    `${header}<!-- coderabbit-ai-generated:v1 -->\n\nText\n\n<!-- /coderabbit-ai-generated:v1 -->\n\n<!-- ordinary -->`,
  )
  expect(article.html).not.toContain('coderabbit-ai-generated')
  expect(article.html).toContain('&lt;!-- ordinary --&gt;')
})
