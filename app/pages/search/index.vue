<!--
  app/pages/search/index.vue
  NanoFeed — Global Search Results Page
-->
<script setup lang="ts">
import Navbar from '../../components/layout/Navbar.vue'
import SearchInput from '../../components/ui/SearchInput.vue'
import FeedList from '../../components/feed/FeedList.vue'
import UiAvatar from '../../components/ui/Avatar.vue'
import VerificationBadge from '../../components/profile/VerificationBadge.vue'

definePageMeta({
  title: 'Search',
  middleware: 'auth',
})

const route = useRoute()
const q = computed(() => String(route.query.q || ''))

const activeTab = ref('top')
const { data, pending } = await useFetch('/api/search', {
  query: { q },
  watch: [q],
})

const results = computed(() => data.value?.data || { users: [], posts: [], hashtags: [] })

const hasResults = computed(
  () =>
    results.value.users.length > 0 ||
    results.value.posts.length > 0 ||
    results.value.hashtags.length > 0,
)
</script>

<template>
  <div class="page-search">
    <Navbar title="Search" show-back />

    <div class="search-container">
      <div class="search-header">
        <SearchInput :initial-value="q" />
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
        <div v-if="pending" class="loading-state">Searching for "{{ q }}"...</div>

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
                      <VerificationBadge
                        :is-owner="user.role === 'OWNER'"
                        :is-verified="user.verified"
                        :is-contributor="!!user.contributorCommit"
                        :badge-order="user.badgeOrder"
                      />
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
                    <VerificationBadge
                      :is-owner="user.role === 'OWNER'"
                      :is-verified="user.verified"
                      :is-contributor="!!user.contributorCommit"
                      :badge-order="user.badgeOrder"
                    />
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

<style src="~/assets/scss/pages/search/index.scss" lang="scss" scoped></style>
