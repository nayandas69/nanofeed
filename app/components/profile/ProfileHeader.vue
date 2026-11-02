<!--
  app/components/profile/ProfileHeader.vue
  NanoFeed — User Profile Header Area
-->
<script setup lang="ts">
import UiAvatar from '../ui/Avatar.vue'
import UiButton from '../ui/Button.vue'
import VerificationBadge from './VerificationBadge.vue'
import FollowListModal from './FollowListModal.vue'
import type { PublicUser } from '#shared/types/user'

const props = defineProps<{
  profileUser: PublicUser
  postCount?: number
  maintenanceMode?: boolean
}>()

const route = useRoute()
const { user: currentUser, isAuthenticated } = useNanoAuth()
const isSelf = computed(() => currentUser.value?.id === props.profileUser.id)

const joinedDate = computed(() => {
  return new Date(props.profileUser.createdAt || 0).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
})

// Follow Logic
const { data: statsData, refresh: refreshStats } = useFetch(
  `/api/users/${props.profileUser.username}/follow-stats`,
  { immediate: !props.maintenanceMode },
)
const stats = computed(() => {
  const apiStats = statsData.value?.data
  if (apiStats) return apiStats

  // Fallback to eager data from profileUser
  return {
    followerCount: props.profileUser._count?.followers ?? 0,
    followingCount: props.profileUser._count?.following ?? 0,
    isFollowing: false,
  }
})

const isProcessing = ref(false)
const handleFollowToggle = async () => {
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirectTo: route.fullPath },
    })
  }

  isProcessing.value = true
  try {
    await $fetch(`/api/users/${props.profileUser.username}/follow`, { method: 'POST' })
    await refreshStats()
  } catch (err) {
    console.error('Follow toggle failed:', err)
  } finally {
    isProcessing.value = false
  }
}

// Follow List Modal State
const showFollowList = ref(false)
const followListType = ref<'followers' | 'following'>('followers')
const followListTitle = computed(() =>
  followListType.value === 'followers' ? 'Followers' : 'Following',
)

const openFollowList = (type: 'followers' | 'following') => {
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirectTo: route.fullPath },
    })
  }
  followListType.value = type
  showFollowList.value = true
}
</script>

<template>
  <div class="nf-profile-header">
    <!-- Banner (Placeholder solid color) -->
    <div class="profile-banner" />

    <div class="profile-info-container">
      <div class="profile-actions">
        <UiAvatar
          :src="profileUser.avatar"
          :alt="profileUser.username"
          size="xl"
          class="profile-avatar"
        />

        <!-- Only action is 'Edit Profile' for own profile right now -->
        <div class="action-btn-wrapper">
          <NuxtLink v-if="isSelf && !maintenanceMode" to="/settings">
            <UiButton variant="ghost" class="edit-profile-btn">Edit Profile</UiButton>
          </NuxtLink>
          <UiButton
            v-else-if="currentUser && !isSelf && !maintenanceMode"
            :variant="stats.isFollowing ? 'secondary' : 'primary'"
            :loading="isProcessing"
            class="follow-btn"
            @click="handleFollowToggle"
          >
            {{ stats.isFollowing ? 'Unfollow' : 'Follow' }}
          </UiButton>
        </div>
      </div>

      <div class="profile-details">
        <div class="name-row">
          <h2 class="display-name">{{ profileUser.displayName }}</h2>
          <VerificationBadge
            class="profile-badges"
            all
            flip-on-interaction
            :is-owner="profileUser.role === 'OWNER'"
            :is-verified="profileUser.verified"
            :is-contributor="!!profileUser.contributorCommit"
            :badge-order="profileUser.badgeOrder"
          />
        </div>

        <div class="username-row">
          <span class="username">@{{ profileUser.username }}</span>
        </div>

        <div v-if="profileUser.bio" class="bio">
          <p>{{ profileUser.bio }}</p>
        </div>

        <div class="meta-row">
          <span class="meta-item" title="Joined Date">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-calendar-days"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
              <path d="M8 14h.01" />
              <path d="M12 14h.01" />
              <path d="M16 14h.01" />
              <path d="M8 18h.01" />
              <path d="M12 18h.01" />
              <path d="M16 18h.01" />
            </svg>
            Joined {{ joinedDate }}
          </span>
        </div>

        <div v-if="!maintenanceMode" class="stats-row">
          <span class="stat">
            <strong>{{ postCount ?? 0 }}</strong> <span class="label">Posts</span>
          </span>
          <button class="stat clickable" @click="openFollowList('following')">
            <strong>{{ stats.followingCount }}</strong> <span class="label">Following</span>
          </button>
          <button class="stat clickable" @click="openFollowList('followers')">
            <strong>{{ stats.followerCount }}</strong> <span class="label">Followers</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Follower/Following Modal -->
    <FollowListModal
      v-if="!maintenanceMode"
      :show="showFollowList"
      :title="followListTitle"
      :username="profileUser.username"
      :type="followListType"
      @close="showFollowList = false"
    />
  </div>
</template>

<style src="~/assets/scss/components/profile/ProfileHeader.scss" lang="scss" scoped></style>
