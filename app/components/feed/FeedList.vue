<!--
  app/components/feed/FeedList.vue
  NanoFeed — List renderer for feeds
-->
<script setup lang="ts">
import FeedItem from './FeedItem.vue'
import type { PostWithAuthor } from '#shared/types/post'

defineProps<{
  posts: PostWithAuthor[]
  loading?: boolean
  emptyMessage?: string
}>()

const emit = defineEmits<{
  'deleted': [postId: string]
}>()
</script>

<template>
  <div class="nf-feed-list">
    <div v-if="loading && posts.length === 0" class="feed-loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="posts.length === 0" class="feed-empty">
      <p>{{ emptyMessage || 'No posts to show.' }}</p>
    </div>

    <template v-else>
      <!-- Plain div replaces TransitionGroup to avoid position:absolute escaping container on refresh -->
      <div class="feed-items-container">
        <FeedItem
          v-for="post in posts"
          :key="post.id"
          :post="post"
          class="feed-item-animate"
          @deleted="emit('deleted', $event)"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.nf-feed-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden; // Safety net: prevent any child from escaping this column
}

.feed-items-container {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.feed-loading, .feed-empty {
  @include flex-center;
  padding: $space-10 $space-4;
  color: $color-text-muted;
  text-align: center;
}

// Simple fade-in animation for posts as they arrive — no position changes
.feed-item-animate {
  animation: post-fade-in 0.25s ease-out both;
}

@keyframes post-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
