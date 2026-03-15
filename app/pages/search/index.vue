<!--
  app/pages/search/index.vue
  NanoFeed — Global Search Results Page
-->
<script setup lang="ts">
import Navbar from '../../components/layout/Navbar.vue'
import SearchInput from '../../components/ui/SearchInput.vue'
import FeedList from '../../components/feed/FeedList.vue'
import UiAvatar from '../../components/ui/Avatar.vue'
import UiBadge from '../../components/ui/Badge.vue'

definePageMeta({
  title: 'Search',
  middleware: 'auth'
})

const route = useRoute()
const q = computed(() => String(route.query.q || ''))

const activeTab = ref('top')
const { data, pending, refresh } = await useFetch('/api/search', {
  query: { q },
  watch: [q]
})

const results = computed(() => (data.value as any)?.data || { users: [], posts: [], hashtags: [] })

const hasResults = computed(() => 
  results.value.users.length > 0 || 
  results.value.posts.length > 0 || 
  results.value.hashtags.length > 0
)
</script>

<template>
  <div class="page-search">
    <Navbar title="Search" showBack />

    <div class="search-container">
      <div class="search-header">
        <SearchInput :initialValue="q" />
      </div>

      <!-- Tabs -->
      <div v-if="q" class="search-tabs">
        <button 
          v-for="tab in ['top', 'users', 'posts', 'hashtags']" 
          :key="tab"
          class="tab-btn"
          :class="{ 'is-active': activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        </button>
      </div>

      <div class="search-results">
        <div v-if="pending" class="loading-state">
          Searching for "{{ q }}"...
        </div>

        <div v-else-if="!q" class="empty-state">
          <p>Try searching for people, topics, or keywords.</p>
        </div>

        <div v-else-if="!hasResults" class="empty-state">
          <p>No results found for "{{ q }}".</p>
        </div>

        <div v-else class="results-content">
          <!-- TOP RESULTS -->
          <template v-if="activeTab === 'top'">
            <section v-if="results.users.length" class="result-section">
              <h3>People</h3>
              <div class="user-list">
                <NuxtLink 
                  v-for="user in results.users" 
                  :key="user.id" 
                  :to="`/profile/${user.username}`"
                  class="user-card"
                >
                  <UiAvatar :src="user.avatar" :alt="user.username" size="md" />
                  <div class="user-info">
                    <div class="name-row">
                      <span class="name">{{ user.displayName }}</span>
                      <UiBadge v-if="user.role === 'OWNER'" variant="owner" iconOnly />
                      <UiBadge v-else-if="user.verified" variant="verified" iconOnly />
                    </div>
                    <span class="handle">@{{ user.username }}</span>
                  </div>
                </NuxtLink>
              </div>
            </section>

            <section v-if="results.hashtags.length" class="result-section">
              <h3>Hashtags</h3>
              <div class="hashtag-list">
                <NuxtLink 
                  v-for="tag in results.hashtags" 
                  :key="tag.id" 
                  :to="`/hashtags/${tag.tag}`"
                  class="tag-card"
                >
                  <span class="tag-name">#{{ tag.tag }}</span>
                  <span class="tag-count">{{ tag.postCount || 0 }} posts</span>
                </NuxtLink>
              </div>
            </section>

            <section v-if="results.posts.length" class="result-section">
              <h3>Posts</h3>
              <FeedList :posts="results.posts" />
            </section>
          </template>

          <!-- USERS ONLY -->
          <template v-if="activeTab === 'users'">
            <div class="user-list full-list">
              <NuxtLink 
                v-for="user in results.users" 
                :key="user.id" 
                :to="`/profile/${user.username}`" 
                class="user-card"
              >
                <UiAvatar :src="user.avatar" :alt="user.username" size="md" />
                <div class="user-info">
                   <div class="name-row">
                      <span class="name">{{ user.displayName }}</span>
                      <UiBadge v-if="user.role === 'OWNER'" variant="owner" iconOnly />
                      <UiBadge v-else-if="user.verified" variant="verified" iconOnly />
                    </div>
                  <span class="handle">@{{ user.username }}</span>
                </div>
              </NuxtLink>
            </div>
          </template>

          <!-- POSTS ONLY -->
          <template v-if="activeTab === 'posts'">
            <FeedList :posts="results.posts" />
          </template>

          <!-- TAGS ONLY -->
          <template v-if="activeTab === 'hashtags'">
            <div class="hashtag-list full-list">
              <NuxtLink 
                v-for="tag in results.hashtags" 
                :key="tag.id" 
                :to="`/hashtags/${tag.tag}`"
                class="tag-card"
              >
                <span class="tag-name">#{{ tag.tag }}</span>
                <span class="tag-count">{{ tag.postCount || 0 }} posts</span>
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-search {
  max-width: $content-max-width;
  margin: 0 auto;
  min-height: 100vh;
  border-left: 1px solid $color-border-soft;
  border-right: 1px solid $color-border-soft;
}

.search-container {
  display: flex;
  flex-direction: column;
}

.search-header {
  padding: $space-4;
  background-color: rgba($color-bg, 0.85);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 53px;
  z-index: $z-sticky;
}

.search-tabs {
  display: flex;
  border-bottom: 1px solid $color-border-soft;
  
  .tab-btn {
    flex: 1;
    padding: $space-4;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-muted;
    background: none;
    border: none;
    position: relative;
    @include hover-transition(color);

    &:hover {
      background-color: $color-surface-2;
      color: $color-text;
    }

    &.is-active {
      color: $color-text;
      font-weight: $font-weight-bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 20%;
        right: 20%;
        height: 4px;
        background-color: $color-accent;
        border-radius: $radius-full;
      }
    }
  }
}

.search-results {
  padding: $space-4 0;
}

.loading-state, .empty-state {
  padding: $space-12 $space-4;
  text-align: center;
  color: $color-text-muted;
  font-size: $font-size-md;
}

.result-section {
  margin-bottom: $space-8;
  
  h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    padding: 0 $space-4;
    margin-bottom: $space-4;
  }
}

.user-list {
  display: flex;
  flex-direction: column;

  .user-card {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-3 $space-4;
    text-decoration: none;
    color: inherit;
    @include hover-transition(background-color);

    &:hover {
      background-color: $color-surface-2;
    }

    .user-info {
      .name-row {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .name {
          font-weight: $font-weight-bold;
          font-size: $font-size-sm;
        }
      }

      .handle {
        color: $color-text-muted;
        font-size: $font-size-sm;
      }
    }
  }
}

.hashtag-list {
  display: flex;
  flex-direction: column;

  .tag-card {
    display: flex;
    flex-direction: column;
    padding: $space-3 $space-4;
    text-decoration: none;
    @include hover-transition(background-color);

    &:hover {
      background-color: $color-surface-2;
    }

    .tag-name {
      font-weight: $font-weight-bold;
      color: $color-text;
    }

    .tag-count {
      font-size: $font-size-xs;
      color: $color-text-muted;
    }
  }
}
</style>
