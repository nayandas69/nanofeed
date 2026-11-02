<!--
  app/components/profile/ProfilePosts.vue
  NanoFeed — Feed renderer specifically for profile posts
-->
<script setup lang="ts">
import FeedList from '../feed/FeedList.vue'
import FeedPagination from '../feed/FeedPagination.vue'
import type { PostWithAuthor } from '#shared/types/post'

const props = defineProps<{
  username: string
}>()

const { isAuthenticated } = useNanoAuth()

const activeTab = ref<'posts' | 'replies'>('posts')

const page = ref(1)
const pageSize = ref(20)

// Instead of global useFeed, we use a custom useFetch for the profile
const { data, status, refresh } = useFetch('/api/posts', {
  query: computed(() => ({
    username: props.username,
    page: page.value,
    pageSize: pageSize.value,
    tab: activeTab.value,
  })),
  watch: [page, activeTab],
  lazy: true,
  server: false, // Don't block SSR for these tabs to make page load cleaner
})

const result = computed(() => (data.value as { data?: unknown })?.data ?? null)
const posts = computed(() => (result.value as { posts?: PostWithAuthor[] } | null)?.posts ?? [])
const hasMore = computed(() => (result.value as { hasMore?: boolean } | null)?.hasMore ?? false)
const isLoading = computed(() => status.value === 'pending' || status.value === 'idle')

const loadMore = () => {
  if (hasMore.value) page.value++
}

const setTab = (tab: 'posts' | 'replies') => {
  activeTab.value = tab
  page.value = 1
}

const onPostDeleted = async () => {
  page.value = 1 // Reset to page 1 on delete to avoid pagination offset issues
  await refresh()
}

// Emitting data upward so ProfileHeader can show accurate post count
const totalPosts = computed(() => (result.value as { total?: number })?.total ?? 0)
const emit = defineEmits<{
  'update:count': [count: number]
}>()

watch(
  totalPosts,
  (newCount) => {
    if (activeTab.value === 'posts') {
      emit('update:count', newCount)
    }
  },
  { immediate: true },
)

defineExpose({
  refresh: () => {
    page.value = 1
    return refresh()
  },
})
</script>

<template>
  <div class="nf-profile-posts">
    <div class="tab-header">
      <button class="tab-btn" :class="{ active: activeTab === 'posts' }" @click="setTab('posts')">
        Posts
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'replies' }"
        @click="setTab('replies')"
      >
        Replies
      </button>
    </div>

    <div v-if="!isAuthenticated" class="guest-gate">
      <div class="gate-content">
        <h2>Join NanoFeed to see @{{ username }}'s posts</h2>
        <p>
          This is where the magic happens. Sign in or create an account to view full profiles and
          join the conversation.
        </p>
        <div class="gate-actions">
          <NuxtLink to="/auth/login">
            <UiButton variant="primary" size="lg" block>Sign In</UiButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <template v-else>
      <FeedList
        :posts="posts"
        :loading="isLoading"
        :empty-message="
          activeTab === 'posts'
            ? 'This user hasn\'t posted anything yet.'
            : 'This user hasn\'t replied to any posts yet.'
        "
        @deleted="onPostDeleted"
      />

      <FeedPagination :has-more="hasMore" :loading="isLoading" @next="loadMore" />
    </template>
  </div>
</template>

<style src="~/assets/scss/components/profile/ProfilePosts.scss" lang="scss" scoped></style>
