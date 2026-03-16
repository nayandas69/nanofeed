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
    // lazy: skip immediate client re-fetch when SSR already delivered the data.
    // This prevents a hydration flash where posts disappear then reappear, which
    // was triggering the broken TransitionGroup position:absolute layout bug.
    lazy: true,
  })

  // Watch for new data and handle pagination properly
  watch(
    () => data.value,
    (newData: any) => {
      if (!newData?.success) return
      
      const newPosts = newData?.data?.posts ?? []
      
      // Reset posts array when returning to page 1 (refresh)
      if (page.value === 1) {
        posts.value = newPosts
      } else if (newPosts.length > 0) {
        // Functional deduplication based on ID for subsequent pages
        const existingIds = new Set(posts.value.map(p => p.id))
        const filteredNewPosts = newPosts.filter((p: any) => !existingIds.has(p.id))
        posts.value = [...posts.value, ...filteredNewPosts]
      }
    },
    { immediate: true, deep: false }
  )

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
    // Clear posts before resetting to page 1 to ensure clean state
    posts.value = []
    page.value = 1
    // Force API refetch with new query params
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
