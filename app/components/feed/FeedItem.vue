<!--
  app/components/feed/FeedItem.vue
  NanoFeed — Wrapper for PostCard in lists
-->
<script setup lang="ts">
import PostCard from '../post/PostCard.vue'
import type { PostWithAuthor } from '#shared/types/post'

defineProps<{
  post: PostWithAuthor
}>()

const emit = defineEmits<{
  deleted: [postId: string]
}>()
</script>

<template>
  <div class="nf-feed-item">
    <p v-if="post.recommendationReason" class="recommendation-reason">
      {{ post.recommendationReason }}
    </p>
    <PostCard :post="post" @deleted="emit('deleted', $event)" />
  </div>
</template>

<style src="~/assets/scss/components/feed/FeedItem.scss" lang="scss" scoped></style>
