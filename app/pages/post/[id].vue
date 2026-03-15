<!--
  app/pages/post/[id].vue
  NanoFeed — Post Detail & Threading View
-->
<script setup lang="ts">
import Navbar from '../../components/layout/Navbar.vue'
import PostCard from '../../components/post/PostCard.vue'
import PostComposer from '../../components/post/PostComposer.vue'
import FeedList from '../../components/feed/FeedList.vue'

const route = useRoute()
const postId = route.params.id as string

const { data, status, refresh } = useFetch(`/api/posts/${postId}`)

const post = computed(() => (data.value as { data: any })?.data || null)
const replies = computed(() => post.value?.replies || [])
const isLoading = computed(() => status.value === 'pending')

const onPosted = () => {
  refresh()
}
</script>

<template>
  <div class="page-post-detail">
    <Navbar title="Post" showBack />

    <div v-if="isLoading && !post" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!post" class="error-state">
      <p>Post not found or has been removed.</p>
    </div>

    <template v-else>
      <!-- The main post -->
      <div class="main-post-section">
        <PostCard :post="post" isDetailView />
      </div>

      <!-- Reply composer -->
      <div class="reply-composer-section">
        <PostComposer 
          :parentId="post.id" 
          placeholder="Post your reply"
          @posted="onPosted"
        />
      </div>

      <!-- Thread / Replies -->
      <div class="replies-section">
        <div class="replies-header" v-if="replies.length > 0">
          <h3>Replies</h3>
        </div>
        <FeedList 
          :posts="replies" 
          :loading="isLoading" 
          emptyMessage="" 
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.page-post-detail {
  max-width: $content-max-width;
  margin: 0 auto;
  min-height: 100vh;
}

.loading-state, .error-state {
  @include flex-center;
  padding: $space-10;
  color: $color-text-muted;
}

.main-post-section {
  border-bottom: 1px solid $color-border-soft;
}

.reply-composer-section {
  padding: $space-2 0;
  border-bottom: 1px solid $color-border-soft;
}

.replies-header {
  padding: $space-4;
  border-bottom: 1px solid $color-border-soft;
  h3 {
    margin: 0;
    font-size: $font-size-md;
    color: $color-text-muted;
  }
}
</style>
