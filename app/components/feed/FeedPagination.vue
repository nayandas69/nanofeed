<!--
  app/components/feed/FeedPagination.vue
  NanoFeed — Load More Button Pagination
-->
<script setup lang="ts">
import UiButton from '../ui/Button.vue'

defineProps<{
  hasMore: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  'next': []
}>()
</script>

<template>
  <div v-if="hasMore" class="nf-feed-pagination">
    <UiButton
      variant="ghost"
      :loading="loading"
      @click="emit('next')"
      block
      class="load-more-btn"
    >
      Load more posts
    </UiButton>
  </div>
</template>

<style lang="scss" scoped>
.nf-feed-pagination {
  padding: $space-4;
  @include flex-center;
  
  .load-more-btn {
    max-width: 300px;
    color: $color-accent;
    border: 1px solid $color-border-soft;
    
    &:hover {
      background-color: rgba($color-accent, 0.1);
      border-color: $color-accent;
    }
  }
}
</style>
