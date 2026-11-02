<script setup lang="ts">
import DocsNavigation from '../components/docs/Navigation.vue'
const menu = ref<HTMLDetailsElement | null>(null)
const route = useRoute()
watch(
  () => route.path,
  () => {
    if (menu.value) menu.value.open = false
  },
)
</script>

<template>
  <div class="docs-shell">
    <a class="skip-link" href="#docs-main">Skip to content</a>
    <header class="docs-header">
      <NuxtLink to="/docs" class="docs-brand"
        ><span class="brand-mark">n<span>f</span></span
        ><strong>NanoFeed</strong><span class="brand-divider">/</span><span>Docs</span></NuxtLink
      >
      <nav aria-label="Site navigation">
        <a href="https://github.com/nanofeed/nanofeed">GitHub ↗</a
        ><NuxtLink to="/" class="back-to-feed"
          >Open feed <span aria-hidden="true">→</span></NuxtLink
        >
      </nav>
    </header>
    <div class="docs-frame">
      <aside class="docs-sidebar">
        <DocsNavigation />
        <div class="sidebar-note">
          Built for the developer circle.<br /><span>Read. Build. Share.</span>
        </div>
      </aside>
      <div class="docs-content-wrap">
        <details ref="menu" class="docs-mobile-menu">
          <summary>Browse guides</summary>
          <DocsNavigation />
        </details>
        <main id="docs-main" tabindex="-1"><slot /></main>
        <footer class="docs-footer">
          <span>NanoFeed documentation</span
          ><a href="https://github.com/nanofeed/nanofeed/tree/main/docs">Written in Markdown ↗</a>
        </footer>
      </div>
    </div>
  </div>
</template>

<style src="~/assets/scss/layouts/docs.scss" lang="scss"></style>
