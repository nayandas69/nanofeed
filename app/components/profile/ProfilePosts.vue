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

const page = ref(1)
const pageSize = ref(20)

// Instead of global useFeed, we use a custom useFetch for the profile
const { data, status, refresh } = useFetch('/api/posts', {
  query: computed(() => ({ 
    username: props.username, 
    page: page.value, 
    pageSize: pageSize.value 
  })),
  watch: [page]
})

const result = computed(() => (data.value as { data?: unknown })?.data ?? null)
const posts = computed(() => (result.value as { posts?: PostWithAuthor[] } | null)?.posts ?? [])
const hasMore = computed(() => (result.value as { hasMore?: boolean } | null)?.hasMore ?? false)
const isLoading = computed(() => status.value === 'pending')

const loadMore = () => {
  if (hasMore.value) page.value++
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

watch(totalPosts, (newCount) => {
  emit('update:count', newCount)
}, { immediate: true })

defineExpose({
  refresh: () => {
    page.value = 1
    return refresh()
  }
})
</script>

<template>
  <div class="nf-profile-posts">
    <div class="tab-header">
      <h3 class="active-tab">Posts</h3>
    </div>
    
    <FeedList 
      :posts="posts" 
      :loading="isLoading" 
      emptyMessage="This user hasn't posted anything yet."
      @deleted="onPostDeleted"
    />
    
    <FeedPagination 
      :hasMore="hasMore" 
      :loading="isLoading" 
      @next="loadMore" 
    />
  </div>
</template>

<style lang="scss" scoped>
.nf-profile-posts {
  display: flex;
  flex-direction: column;
}

.tab-header {
  border-bottom: 1px solid $color-border-soft;
  display: flex;

  .active-tab {
    padding: $space-4;
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-text;
    position: relative;
    margin: 0;
    cursor: pointer;
    
    @include hover-transition(background-color);

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 10%;
      right: 10%;
      height: 4px;
      background-color: $color-accent;
      border-radius: $radius-full $radius-full 0 0;
    }
  }
}
</style>
