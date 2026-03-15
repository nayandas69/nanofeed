<!--
  app/components/ui/Avatar.vue
  NanoFeed — User Avatar
-->
<script setup lang="ts">
interface Props {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

// Handle image loading errors gracefully
const hasError = ref(false)
const onError = () => {
  hasError.value = true
}

// Generate fallback initials
const initials = computed(() => {
  if (!props.alt) return '?'
  const parts = props.alt.trim().split(/[\s_-]+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  const first = parts[0]?.[0] || '?'
  const second = parts[1]?.[0] || ''
  return (first + second).toUpperCase()
})
</script>

<template>
  <div class="nf-avatar" :class="`size-${size}`">
    <img
      v-if="!hasError && src"
      :src="src"
      :alt="alt"
      @error="onError"
      class="avatar-img"
      loading="lazy"
    />
    <div v-else class="avatar-fallback">
      {{ initials }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nf-avatar {
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: inline-block;
  background-color: $color-surface-3;

  &.size-sm { width: 32px; height: 32px; font-size: $font-size-xs; }
  &.size-md { width: 40px; height: 40px; font-size: $font-size-sm; }
  &.size-lg { width: 48px; height: 48px; font-size: $font-size-base; }
  &.size-xl { width: 120px; height: 120px; font-size: $font-size-3xl; border: 4px solid $color-bg; }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    width: 100%;
    height: 100%;
    @include flex-center;
    color: $color-text-muted;
    font-weight: $font-weight-semibold;
  }
}
</style>
