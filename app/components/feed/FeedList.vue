<!--
  app/components/feed/FeedList.vue
  NanoFeed — List renderer for feeds with transitions
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
      <TransitionGroup name="list" tag="div" class="feed-items-container">
        <FeedItem
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @deleted="emit('deleted', $event)"
        />
      </TransitionGroup>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.nf-feed-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.feed-items-container {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  position: relative; // Contains absolute children during list-leave transitions
}

.feed-loading, .feed-empty {
  @include flex-center;
  padding: $space-10 $space-4;
  color: $color-text-muted;
  text-align: center;
}

// Vue Transition Group Styles for smooth entry/exit
.list-enter-active,
.list-leave-active,
.list-move {
  transition: all $transition-base;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-20px); // Slide down when new posts appear at top
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px); // Slide out right when deleted
}

.list-leave-active {
  position: absolute; // Ensure smooth layout recalculation
  width: 100%; // Prevent shrinking during leave transition
}
</style>
