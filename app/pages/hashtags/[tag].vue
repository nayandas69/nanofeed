<!--
  app/pages/hashtags/[tag].vue
  NanoFeed — Hashtag Feed Page
-->
<script setup lang="ts">
import Navbar from '../../components/layout/Navbar.vue'
import FeedList from '../../components/feed/FeedList.vue'
import FeedPagination from '../../components/feed/FeedPagination.vue'

const route = useRoute()
const tag = computed(() => String(route.params.tag || ''))

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: `#${tag.value}`,
  description: `Recent posts tagged with #${tag.value} on NanoFeed.`,
})

const page = ref(1)
const { data, pending } = await useFetch(() => `/api/hashtags/${tag.value}`, {
  query: { page },
  watch: [tag],
})

const feedData = computed(() => data.value?.data || { posts: [], total: 0, hasMore: false })

const nextPage = () => {
  if (feedData.value.hasMore) {
    page.value++
  }
}
</script>

<template>
  <div class="page-hashtag">
    <Navbar :title="`#${tag}`" show-back />

    <div class="hashtag-container">
      <header class="hashtag-header">
        <div class="tag-info">
          <h1>#{{ tag }}</h1>
          <p v-if="!pending">{{ feedData.total }} posts</p>
        </div>
      </header>

      <div class="hashtag-content">
        <FeedList
          :posts="feedData.posts"
          :loading="pending"
          :empty-message="`No posts found with #${tag} yet.`"
        />

        <FeedPagination :has-more="feedData.hasMore" :loading="pending" @next="nextPage" />
      </div>
    </div>
  </div>
</template>

<style src="~/assets/scss/pages/hashtags/[tag].scss" lang="scss" scoped></style>
