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
    :class="[
      `variant-${variant}`,
      `size-${size}`,
      { 'is-block': block, 'is-loading': loading }
    ]"
  >
    <!-- Loading spinner completely replaces content for simplicity -->
    <div v-if="loading" class="spinner" />
    <slot v-else />
  </button>
</template>

<style lang="scss" scoped>
.nf-btn {
  @include btn-base;

  &.is-block {
    width: 100%;
  }

  // Sizes
  &.size-sm {
    padding: $space-1 $space-3;
    font-size: $font-size-xs;
  }

  &.size-md {
    padding: $space-2 $space-4;
    font-size: $font-size-sm;
  }

  &.size-lg {
    padding: $space-3 $space-6;
    font-size: $font-size-base;
  }

  // Variants
  &.variant-primary {
    background-color: $color-accent;
    color: #fff;

    &:hover:not(:disabled) {
      background-color: $color-accent-hover;
    }
  }

  &.variant-secondary {
    background-color: $color-text;
    color: $color-bg;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }

  &.variant-danger {
    background-color: $color-danger;
    color: #fff;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }

  &.variant-ghost {
    background-color: transparent;
    color: $color-text;

    &:hover:not(:disabled) {
      background-color: $color-surface-2;
    }
  }
}
</style>
