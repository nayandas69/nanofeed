<!--
  app/components/ui/Button.vue
  NanoFeed — Reusable Button Component
-->
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="nf-btn"
    :class="[`variant-${variant}`, `size-${size}`, { 'is-block': block, 'is-loading': loading }]"
  >
    <!-- Loading spinner completely replaces content for simplicity -->
    <div v-if="loading" class="spinner" />
    <slot v-else />
  </button>
</template>

<style src="~/assets/scss/components/ui/Button.scss" lang="scss" scoped></style>
