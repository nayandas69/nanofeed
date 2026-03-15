<!--
  app/app.vue
  NanoFeed — Root Entry Point
-->
<script setup lang="ts">
import { useHead } from '#imports'

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} / NanoFeed` : 'NanoFeed'
  },
  bodyAttrs: {
    class: 'nf-theme-dark'
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
