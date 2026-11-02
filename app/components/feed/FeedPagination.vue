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
  next: []
}>()
</script>

<template>
  <div v-if="hasMore" class="nf-feed-pagination">
    <UiButton variant="ghost" :loading="loading" block class="load-more-btn" @click="emit('next')">
      Load more posts
    </UiButton>
  </div>
</template>

<style src="~/assets/scss/components/feed/FeedPagination.scss" lang="scss" scoped></style>
