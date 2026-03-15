/**
 * app/composables/useHashtags.ts
 * NanoFeed — Hashtag Posts Composable
 *
 * Fetches posts filtered by a specific hashtag.
 */

export const useHashtags = (tag: Ref<string> | string) => {
  const tagRef = isRef(tag) ? tag : ref(tag)
  const page = ref(1)

  const { data, status, refresh, error } = useFetch(
    () => `/api/hashtags/${tagRef.value}`,
    {
      query: computed(() => ({ page: page.value, pageSize: 20 })),
      watch: [tagRef, page],
    }
  )

  const result = computed(() => (data.value as { data?: unknown })?.data ?? null)
  const posts = computed(() => (result.value as { posts?: unknown[] } | null)?.posts ?? [])
  const total = computed(() => (result.value as { total?: number } | null)?.total ?? 0)
  const hasMore = computed(() => (result.value as { hasMore?: boolean } | null)?.hasMore ?? false)
  const isLoading = computed(() => status.value === 'pending')

  return {
    posts,
    total,
    hasMore,
    page,
    isLoading,
    error,
    refresh,
    nextPage: () => { if (hasMore.value) page.value++ },
    prevPage: () => { if (page.value > 1) page.value-- },
  }
}
