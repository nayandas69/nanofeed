---
title: Writing with Markdown
description: Publish guides and blog-style articles from GitHub Markdown without a CMS, database, or seed data.
category: Contribute
order: 80
---

# Writing with Markdown

Every guide on this site is an ordinary `.md` file in the repository's `docs/` directory. You can write from the GitHub editor or your local editor, review the change in a pull request, and publish it with the next application deployment. Publishing requires repository access; platform users cannot edit these files through posts.

## Create an article on GitHub

1. Open [the docs directory](https://github.com/nanofeed/nanofeed/tree/main/docs).
2. Choose **Add file → Create new file**.
3. Name it `YOUR-GUIDE.md` using letters, numbers, and hyphens. File names are case-insensitive for routing; duplicate lower-case names fail the build.
4. Add frontmatter and Markdown as shown below. Use one leading `#` title and `##` or `###` section headings.
5. Preview the Markdown on GitHub. Commit through a branch and pull request so CI validates it before release.
6. After merge and deployment, the article appears in the docs navigation, search, and guide cards automatically. `YOUR-GUIDE.md` becomes `/docs/your-guide`.

## Article template

```markdown
---
title: My first guide
description: A short summary that appears in search results and guide cards.
category: Contribute
order: 90
published: '2026-10-29'
---

# My first guide

Introduce the problem and the reader's goal.

## Before you begin

List the tools or configuration the reader needs.

## Follow the steps

1. Describe a concrete action.
2. Show a working example.
3. Explain how to verify the result.

## Next steps

Link to a related guide.
```

`title`, `description`, `category`, and integer `order` are required. `published` is optional and uses a quoted `YYYY-MM-DD` date for blog-style entries. Lower `order` values appear first. Reuse an existing category to keep navigation focused. Metadata is public; never put secrets in it.

## Supported Markdown

Use headings, paragraphs, emphasis, lists, blockquotes, images, tables, links, inline code, and fenced code blocks with a language label. Tables and strikethrough work with the renderer. Roadmap tasks can use Markdown `- [ ]` syntax; the docs renderer displays the text and does not make the boxes interactive. Raw HTML, MDX, Vue components, scripts, and arbitrary embeds are not executed.

```bash
npm run dev
```

Fenced code blocks display a language header and a **Copy** button on the docs website. Include a language after the opening fence, such as `bash`, `typescript`, `json`, or `text`. Copying includes only the code, preserving newlines. Unlabelled blocks display `text`. If clipboard access is unavailable, select and copy the code manually.

Long code blocks and tables scroll within the article on small screens. Images should have descriptive alt text. For screenshots that work on GitHub and the docs website, put files in `public/docs/screenshots/` and use a relative Markdown path, for example `![Description](../public/docs/screenshots/home.png)`. The docs compiler serves that path from `/docs/screenshots/`. Use synthetic data, and do not publish real database URLs, credentials, tokens, or user data.

## Link to other guides

Use the repository filename so links work when reading on GitHub:

```markdown
Read [GitHub sign-in](GITHUB-AUTH.md).
See [the production release steps](DEPLOYMENT.md#6-build-and-deploy-to-vercel).
```

During the build, local Markdown links become `/docs/...` links. Section IDs are generated from heading text, lowercased with spaces replaced by hyphens; punctuation is removed. Duplicate headings receive a numeric suffix. The build rejects links to missing guides or sections. Keep incoming links in mind before renaming files or headings.

## Preview locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/docs` and navigate to your new article. Markdown edits refresh generated content during development. Changes to the live website require another deployment; editing GitHub alone does not update a running release.

## Validate and publish

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

The build reads Markdown and validates metadata and internal links. Rendering tests check that raw HTML and unsafe link schemes remain disabled. GitHub Actions runs these checks with the application tests and both production build targets.

Merge the reviewed changes, then follow [Build and deploy](DEPLOYMENT.md). Documentation is bundled into the app at build time. It needs no CMS, content database, migration, or seed command. Authentication and the social platform still use the configured PostgreSQL database.
