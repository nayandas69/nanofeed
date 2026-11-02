<!--
  app/pages/post/[id].vue
  NanoFeed — Post Detail & Threading View
-->
<script setup lang="ts">
import Navbar from '../../components/layout/Navbar.vue'
import PostCard from '../../components/post/PostCard.vue'
import PostComposer from '../../components/post/PostComposer.vue'
import FeedList from '../../components/feed/FeedList.vue'

import type { PostWithAuthor } from '#shared/types/post'

const route = useRoute()
const postId = route.params.id as string

const { data, status, refresh } = useFetch<{
  data: PostWithAuthor & { replies: PostWithAuthor[] }
}>(`/api/posts/${postId}`)

const post = computed(() => data.value?.data || null)
const replies = computed(() => post.value?.replies || [])
const isLoading = computed(() => status.value === 'pending')

const onPosted = () => {
  refresh()
}
</script>

<template>
  <div class="page-post-detail">
    <Navbar title="Post" show-back />

    <div v-if="isLoading && !post" class="loading-state">
      <div class="spinner" />
    </div>

    <div v-else-if="!post" class="error-state">
      <p>Post not found or has been removed.</p>
    </div>

    <template v-else>
      <!-- The main post -->
      <div class="main-post-section">
        <PostCard :post="post" is-detail-view />
      </div>

      <!-- Reply composer -->
      <div class="reply-composer-section">
        <PostComposer :parent-id="post.id" placeholder="Post your reply" @posted="onPosted" />
      </div>

      <!-- Thread / Replies -->
      <div class="replies-section">
        <div v-if="replies.length > 0" class="replies-header">
          <h3>Replies</h3>
        </div>
        <FeedList :posts="replies" :loading="isLoading" empty-message="" />
      </div>
    </template>
  </div>
</template>

<style src="~/assets/scss/pages/post/[id].scss" lang="scss" scoped></style>
