/**
 * app/composables/useFeed.ts
 * NanoFeed — Paginated Feed Composable
 *
 * Fetches and manages the home feed with pagination.
 */

import type { PaginatedPosts } from '#shared/types/post'

export const useFeed = () => {
  const page = ref(1)
  const pageSize = ref(20)
  const posts = ref<any[]>([])

  const { data, status, refresh: fetchRefresh, error } = useFetch('/api/feed', {
    query: computed(() => ({ page: page.value, pageSize: pageSize.value })),
    watch: [page],
  })

  // Watch for new data and append it
  watch(data, (newData: any) => {
    const newPosts = newData?.data?.posts ?? []
    if (page.value === 1) {
      posts.value = newPosts
    } else {
      // Functional deduplication based on ID
      const existingIds = new Set(posts.value.map(p => p.id))
      const filteredNewPosts = newPosts.filter((p: any) => !existingIds.has(p.id))
      posts.value = [...posts.value, ...filteredNewPosts]
    }
  }, { immediate: true })

  const feed = computed<PaginatedPosts | null>(() => {
    const d = data.value as unknown as { data?: PaginatedPosts } | null
    return d?.data ?? null
  })

  const hasMore = computed(() => feed.value?.hasMore ?? false)
  const total = computed(() => feed.value?.total ?? 0)
  const isLoading = computed(() => status.value === 'pending')

  const nextPage = () => {
    if (hasMore.value && !isLoading.value) {
      page.value++
    }
  }

  const refresh = async () => {
    page.value = 1
    await fetchRefresh()
  }

  return {
    posts,
    feed,
    page,
    pageSize,
    hasMore,
    total,
    isLoading,
    error,
    refresh,
    nextPage,
  }
}
