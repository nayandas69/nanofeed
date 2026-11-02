<!--
  app/pages/index.vue
  NanoFeed — Home Feed Page
-->
<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue'
import PostComposer from '../components/post/PostComposer.vue'
import FeedList from '../components/feed/FeedList.vue'
import FeedPagination from '../components/feed/FeedPagination.vue'
import HomeTabs from '../components/feed/HomeTabs.vue'

definePageMeta({
  title: 'Home',
  middleware: 'auth',
})

const { posts, hasMore, isLoading, refresh, nextPage, filter, error } = useFeed()

// Soft refresh feed without full page reload
const refreshing = ref(false)
const onRefresh = async () => {
  refreshing.value = true
  try {
    await refresh()
  } finally {
    refreshing.value = false
  }
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
          title="Refresh Feed"
          @click="onRefresh"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21v-5h5" />
          </svg>
        </button>
      </template>
    </Navbar>

    <HomeTabs v-model:active-tab="filter" />

    <div class="feed-container">
      <div class="feed-header">
        <div class="welcome-box">
          <h2>Your developer circle.</h2>
          <p>Share what you’re building. Discover what’s next.</p>
        </div>
      </div>

      <PostComposer />

      <div class="feed-content">
        <details v-if="filter === 'recommended'" class="feed-explainer">
          <summary>How your feed is picked</summary>
          <p>
            Fresh posts, people you follow, and topics you write about or love. We mix authors to
            help you discover new voices. Choose Latest for chronological posts.
          </p>
        </details>
        <div v-if="error" role="alert" class="feed-explainer">
          <p>{{ error }}</p>
          <button @click="onRefresh">Refresh feed</button>
        </div>
        <FeedList
          v-if="!error || posts.length"
          :posts="posts"
          :loading="isLoading"
          :empty-message="
            filter !== 'following'
              ? 'No posts yet. Be the first to share something!'
              : 'Follow more people to see their posts here!'
          "
          @deleted="onPostDeleted"
        />

        <FeedPagination :has-more="hasMore" :loading="isLoading" @next="nextPage" />
      </div>
    </div>
  </div>
</template>

<style src="~/assets/scss/pages/index.scss" lang="scss" scoped></style>
