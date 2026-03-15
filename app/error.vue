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
        <UiButton variant="primary" size="lg" @click="handleClearError">
          Return Home
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nf-global-error {
  @include flex-center;
  min-height: 100vh;
  padding: $space-4;
  background-color: $color-bg;
  color: $color-text;
  font-family: inherit; // Picks up app font if loaded, though error.vue can be outside standard tree sometimes
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-4;
  max-width: 500px;
}

.status-code {
  font-size: 6rem;
  font-weight: 900;
  line-height: 1;
  color: $color-accent;
  text-shadow: 0 0 20px rgba($color-accent, 0.4);
}

h1 {
  font-size: $font-size-2xl;
  margin: 0;
}

.message {
  font-size: $font-size-lg;
  color: $color-text-muted;
  margin: 0;
}

.actions {
  margin-top: $space-6;
}
</style>
