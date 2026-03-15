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

  const { data, status, refresh, error } = useFetch('/api/feed', {
    query: computed(() => ({ page: page.value, pageSize: pageSize.value })),
    watch: [page, pageSize],
  })

  const feed = computed<PaginatedPosts | null>(() => {
    const d = data.value as { data?: PaginatedPosts } | null
    return d?.data ?? null
  })

  const posts = computed(() => feed.value?.posts ?? [])
  const hasMore = computed(() => feed.value?.hasMore ?? false)
  const total = computed(() => feed.value?.total ?? 0)
  const isLoading = computed(() => status.value === 'pending')

  const nextPage = () => {
    if (hasMore.value) page.value++
  }

  const prevPage = () => {
    if (page.value > 1) page.value--
  }

  const goToPage = (p: number) => {
    page.value = p
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
    prevPage,
    goToPage,
  }
}
