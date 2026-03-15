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
  middleware: 'auth'
})

useSeoMeta({
  title: `#${tag.value}`,
  description: `Recent posts tagged with #${tag.value} on NanoFeed.`
})

const page = ref(1)
const { data, pending, refresh } = await useFetch(() => `/api/hashtags/${tag.value}`, {
  query: { page },
  watch: [tag]
})

const feedData = computed(() => (data.value as any)?.data || { posts: [], total: 0, hasMore: false })

const nextPage = () => {
  if (feedData.value.hasMore) {
    page.value++
  }
}
</script>

<template>
  <div class="page-hashtag">
    <Navbar :title="`#${tag}`" showBack />

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
          :emptyMessage="`No posts found with #${tag} yet.`"
        />

        <FeedPagination 
          :hasMore="feedData.hasMore" 
          :loading="pending" 
          @next="nextPage" 
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-hashtag {
  max-width: $content-max-width;
  margin: 0 auto;
  min-height: 100vh;
  border-left: 1px solid $color-border-soft;
  border-right: 1px solid $color-border-soft;
}

.hashtag-header {
  padding: $space-8 $space-4;
  border-bottom: 1px solid $color-border-soft;
  background: linear-gradient(to bottom, rgba($color-accent, 0.05), transparent);

  .tag-info {
    h1 {
      font-size: $font-size-3xl;
      font-weight: $font-weight-bold;
      margin-bottom: $space-1;
    }

    p {
      color: $color-text-muted;
      font-size: $font-size-md;
    }
  }
}

.hashtag-content {
  padding-bottom: $space-16;
}

:deep(.feed-list) {
  padding: $space-4;
}
</style>
