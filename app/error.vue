<!--
  app/error.vue
  NanoFeed — Global Error Catch-all
-->
<script setup lang="ts">
import UiButton from './components/ui/Button.vue'
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

const handleClearError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="nf-global-error">
    <div class="error-container">
      <div class="status-code">{{ error.statusCode }}</div>

      <h1>{{ error.statusCode === 404 ? 'Page Not Found' : 'Something went wrong' }}</h1>

      <p class="message">{{ error.message || 'An unexpected error occurred.' }}</p>

      <div class="actions">
        <UiButton variant="primary" size="lg" @click="handleClearError"> Return Home </UiButton>
      </div>
    </div>
  </div>
</template>

<style src="~/assets/scss/error.scss" lang="scss" scoped></style>
