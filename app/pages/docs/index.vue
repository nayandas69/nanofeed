<script setup lang="ts">
import { docs } from '#build/docs-content'
definePageMeta({ layout: 'docs' })
const query = ref('')
const filtered = computed(() =>
  docs.filter((article) =>
    `${article.title} ${article.description} ${article.category}`
      .toLowerCase()
      .includes(query.value.trim().toLowerCase()),
  ),
)
useSeoMeta({
  title: 'Documentation',
  description:
    'Learn to use NanoFeed, manage your account, run it locally, and contribute to the official project.',
})
const config = useRuntimeConfig()
useHead({ link: [{ rel: 'canonical', href: `${config.public.appUrl}/docs` }] })
</script>

<template>
  <div class="docs-home">
    <div class="docs-eyebrow">The NanoFeed handbook</div>
    <h1>A small feed.<br /><span>A solid foundation.</span></h1>
    <p class="home-intro">
      Everything you need to build your developer circle. From your first sign-in to a production
      deployment.
    </p>
    <div class="start-links">
      <NuxtLink to="/docs/using-nanofeed" class="docs-start"
        >Learn to use NanoFeed <span aria-hidden="true">→</span></NuxtLink
      ><NuxtLink to="/docs/getting-started" class="developer-start">Run locally →</NuxtLink>
    </div>
    <p class="official-repo">
      Official repository:
      <a href="https://github.com/nanofeed/nanofeed">github.com/nanofeed/nanofeed ↗</a>
    </p>
    <div class="docs-stack">
      <span>Nuxt 4</span><span>Better Auth</span><span>Neon Postgres</span><span>Node 24</span>
    </div>
    <section class="guide-section" aria-labelledby="guides-title">
      <div class="guides-toolbar">
        <h2 id="guides-title">Find your next step</h2>
        <label class="guide-search"
          ><span class="sr-only">Search documentation</span
          ><input v-model="query" type="search" placeholder="Search guides…"
        /></label>
      </div>
      <p class="results-count" aria-live="polite">
        {{ filtered.length }} {{ filtered.length === 1 ? 'guide' : 'guides' }}
      </p>
      <div class="guide-grid">
        <NuxtLink
          v-for="article in filtered"
          :key="article.slug"
          :to="`/docs/${article.slug}`"
          class="guide-card"
          ><div class="card-top">
            <span>{{ article.category }}</span
            ><span aria-hidden="true">↗</span>
          </div>
          <h3>{{ article.title }}</h3>
          <p>{{ article.description }}</p>
          <span class="card-read"
            >{{ article.readingMinutes }} min read <span aria-hidden="true">→</span></span
          ></NuxtLink
        >
      </div>
      <p v-if="!filtered.length" class="no-guides">
        No guides found. Try “GitHub”, “migration”, or “Markdown”.
      </p>
    </section>
    <div class="docs-writing">
      <span aria-hidden="true">✎</span>
      <div>
        <h2>Your knowledge, versioned.</h2>
        <p>
          Write guides and articles in Markdown. Review them on GitHub. Publish with your next
          deployment.
        </p>
        <NuxtLink to="/docs/writing">Learn how to publish →</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style src="~/assets/scss/pages/docs/index.scss" lang="scss" scoped></style>
