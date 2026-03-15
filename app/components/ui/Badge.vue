<!--
  app/components/ui/Badge.vue
  NanoFeed — Status / Verification Badge
-->
<script setup lang="ts">
interface Props {
  variant?: 'verified' | 'owner' | 'default' | 'success' | 'warning' | 'danger'
  text?: string
  iconOnly?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  text: '',
  iconOnly: false,
})
</script>

<template>
  <span
    class="nf-badge"
    :class="[`variant-${variant}`, { 'icon-only': iconOnly }]"
    :title="text"
  >
    <!-- Verified Checkmark -->
    <svg v-if="variant === 'verified'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10.5 16.5L6.5 12.5L7.9 11.1L10.5 13.7L16.6 7.6L18 9L10.5 16.5Z"/>
    </svg>

    <!-- Owner Crown -->
    <svg v-else-if="variant === 'owner'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/>
    </svg>

    <span v-if="!iconOnly && text" class="text">{{ text }}</span>
  </span>
</template>

<style lang="scss" scoped>
.nf-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  line-height: 1;
  border-radius: $radius-sm;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:not(.icon-only) {
    padding: 2px 6px;
  }

  &.variant-verified {
    color: $color-verified;
    background-color: transparent;
  }

  &.variant-owner {
    color: $color-owner;
    background-color: transparent;
  }

  &.variant-default {
    background-color: $color-surface-3;
    color: $color-text;
  }

  &.variant-success {
    background-color: rgba($color-success, 0.2);
    color: $color-success;
  }

  &.variant-warning {
    background-color: rgba($color-warning, 0.2);
    color: $color-warning;
  }

  &.variant-danger {
    background-color: rgba($color-danger, 0.2);
    color: $color-danger;
  }
}
</style>
