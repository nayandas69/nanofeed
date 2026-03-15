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
  'deleted': [postId: string]
}>()
</script>

<template>
  <div class="nf-feed-item">
    <PostCard :post="post" @deleted="emit('deleted', $event)" />
  </div>
</template>

<style lang="scss" scoped>
// Inherits layout properties directly via wrapper if needed
.nf-feed-item {
  width: 100%;
  padding: 0;
  margin-bottom: $space-2;
}
</style>
