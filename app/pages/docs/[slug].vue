<script setup lang="ts">
import DocsContent from '../../components/docs/Content.vue'
import { docs } from '#build/docs-content'
definePageMeta({ layout: 'docs', key: (route) => route.path })
const route = useRoute()
const article = docs.find((item) => item.slug === route.params.slug)
if (!article) throw createError({ statusCode: 404, statusMessage: 'Guide not found' })
const index = docs.indexOf(article)
const previous = docs[index - 1]
const next = docs[index + 1]
const sourceUrl = `https://github.com/nanofeed/nanofeed/blob/main/docs/${article.filename}`
const config = useRuntimeConfig()
useSeoMeta({
  title: article.title,
  description: article.description,
  ogTitle: `${article.title} · NanoFeed`,
  ogDescription: article.description,
})
useHead({ link: [{ rel: 'canonical', href: `${config.public.appUrl}/docs/${article.slug}` }] })
</script>

<template>
  <div class="docs-article-grid">
    <article class="docs-article">
      <NuxtLink to="/docs" class="article-breadcrumb"
        >Documentation <span aria-hidden="true">/</span> {{ article.category }}</NuxtLink
      >
      <header class="article-header">
        <h1>{{ article.title }}</h1>
        <p>{{ article.description }}</p>
        <div class="article-meta">
          <span>{{ article.readingMinutes }} min read</span
          ><time v-if="article.published" :datetime="article.published">{{
            article.published
          }}</time
          ><a :href="sourceUrl">View Markdown ↗</a>
        </div>
      </header>
      <details v-if="article.headings.length" class="article-mobile-toc">
        <summary>On this page</summary>
        <nav aria-label="Article sections">
          <a v-for="heading in article.headings" :key="heading.id" :href="`#${heading.id}`">{{
            heading.text
          }}</a>
        </nav>
      </details>
      <DocsContent :html="article.html" />
      <nav class="article-pagination" aria-label="Previous and next guides">
        <NuxtLink v-if="previous" :to="`/docs/${previous.slug}`"
          ><small>← Previous</small><span>{{ previous.title }}</span></NuxtLink
        ><NuxtLink v-if="next" :to="`/docs/${next.slug}`" class="next-guide"
          ><small>Next →</small><span>{{ next.title }}</span></NuxtLink
        >
      </nav>
      <a
        :href="`https://github.com/nanofeed/nanofeed/edit/main/docs/${article.filename}`"
        class="edit-guide"
        >Improve this page on GitHub ↗</a
      >
    </article>
    <aside v-if="article.headings.length" class="article-toc">
      <h2>On this page</h2>
      <nav aria-label="Article sections">
        <a
          v-for="heading in article.headings"
          :key="heading.id"
          :href="`#${heading.id}`"
          :class="{ 'toc-subheading': heading.level === 3 }"
          >{{ heading.text }}</a
        >
      </nav>
    </aside>
  </div>
</template>

<style src="~/assets/scss/pages/docs/[slug].scss" lang="scss"></style>
