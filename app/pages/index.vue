<!--
  app/pages/index.vue
  NanoFeed — Home Feed Page
-->
<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue'
import PostComposer from '../components/post/PostComposer.vue'
import FeedList from '../components/feed/FeedList.vue'
import FeedPagination from '../components/feed/FeedPagination.vue'

definePageMeta({
  title: 'Home',
  middleware: 'auth' // Ensure users are logged in
})

const { user } = useNanoAuth()
const { posts, hasMore, isLoading, refresh, nextPage } = useFeed()

// Soft refresh feed without full page reload
const refreshing = ref(false)
const onRefresh = async () => {
  refreshing.value = true
  await refresh()
  refreshing.value = false
}

const onPostDeleted = async () => {
  await refresh()
}
</script>

<template>
  <div class="page-home">
    <Navbar title="Home">
      <template #actions>
        <button 
          class="refresh-btn" 
          :class="{ 'is-spinning': refreshing }" 
          @click="onRefresh"
          title="Refresh Feed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 21v-5h5"/>
          </svg>
        </button>
      </template>
    </Navbar>

    <div class="feed-container">
      <div class="feed-header">
        <div class="welcome-box">
          <h2>Hello, {{ user?.displayName?.split(' ')[0] }}!</h2>
          <p>What's happening in your digital world today?</p>
        </div>
      </div>

      <PostComposer />

      <div class="feed-content">
        <FeedList 
          :posts="posts" 
          :loading="isLoading" 
          emptyMessage="No posts yet. Be the first to share something!"
          @deleted="onPostDeleted"
        />

        <FeedPagination 
          :hasMore="hasMore" 
          :loading="isLoading" 
          @next="nextPage" 
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-home {
  max-width: $content-max-width;
  margin: 0 auto;
  border-left: 1px solid $color-border-soft;
  border-right: 1px solid $color-border-soft;
  min-height: 100vh;
}

.feed-container {
  display: flex;
  flex-direction: column;
  gap: $space-6;
  padding-bottom: $space-16;
}

.feed-header {
  padding: $space-6 $space-4 $space-2;
  
  .welcome-box {
    h2 {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      margin-bottom: $space-1;
      background: linear-gradient(to right, $color-text, $color-accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p {
      color: $color-text-muted;
      font-size: $font-size-sm;
    }
  }
}

.feed-content {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.refresh-btn {
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: $color-text-muted;
  @include hover-transition(all);

  &:hover {
    color: $color-text;
    background-color: $color-surface-2;
  }

  &.is-spinning svg {
    animation: spin 1s linear infinite;
  }
}

// Glassmorphism effect for post composer and feed items would be better handled 
// in their respective components, but let's add some global tweaks here if needed.
:deep(.post-composer) {
  background: rgba($color-surface, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba($color-border, 0.5);
  border-radius: $radius-xl;
  margin: 0 $space-4;
}

:deep(.feed-list) {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: 0 $space-4;
}
</style>
