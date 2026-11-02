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
  deleted: [postId: string]
}>()
</script>

<template>
  <div class="nf-feed-list">
    <div v-if="loading && posts.length === 0" class="feed-loading">
      <div class="spinner" />
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

<style src="~/assets/scss/components/feed/FeedList.scss" lang="scss" scoped></style>
