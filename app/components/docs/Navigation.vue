<script setup lang="ts">
import { docs } from '#build/docs-content'
const groups = computed(() =>
  [...new Set(docs.map((article) => article.category))].map((category) => ({
    category,
    articles: docs.filter((article) => article.category === category),
  })),
)
</script>

<template>
  <nav aria-label="Documentation guides" class="docs-navigation">
    <NuxtLink to="/docs" class="docs-overview" exact-active-class="is-current">Overview</NuxtLink>
    <section v-for="group in groups" :key="group.category">
      <h2>{{ group.category }}</h2>
      <NuxtLink
        v-for="article in group.articles"
        :key="article.slug"
        :to="`/docs/${article.slug}`"
        exact-active-class="is-current"
        >{{ article.title }}</NuxtLink
      >
    </section>
  </nav>
</template>

<style src="~/assets/scss/components/docs/Navigation.scss" lang="scss" scoped></style>
