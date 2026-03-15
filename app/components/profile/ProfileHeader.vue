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
import { useTimeAgo } from '@vueuse/core'

const props = defineProps<{
  profileUser: PublicUser
  postCount?: number
}>()

const { user: currentUser } = useNanoAuth()
const isSelf = computed(() => currentUser.value?.id === props.profileUser.id)

const joinedDate = computed(() => {
  return new Date(props.profileUser.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  })
})

// Follow Logic
const { data: statsData, refresh: refreshStats } = useFetch(`/api/users/${props.profileUser.username}/follow-stats`)
const stats = computed(() => {
  const apiStats = (statsData.value as { data: any })?.data
  if (apiStats) return apiStats
  
  // Fallback to eager data from profileUser
  return {
    followerCount: props.profileUser._count?.followers ?? 0,
    followingCount: props.profileUser._count?.following ?? 0,
    isFollowing: false
  }
})

const isProcessing = ref(false)
const handleFollowToggle = async () => {
  if (!currentUser.value) {
    return navigateTo('/auth/login')
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
const followListTitle = computed(() => followListType.value === 'followers' ? 'Followers' : 'Following')

const openFollowList = (type: 'followers' | 'following') => {
  followListType.value = type
  showFollowList.value = true
}
</script>

<template>
  <div class="nf-profile-header">
    <!-- Banner (Placeholder solid color) -->
    <div class="profile-banner"></div>

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
          <NuxtLink v-if="isSelf" to="/settings">
            <UiButton variant="ghost" class="edit-profile-btn">Edit Profile</UiButton>
          </NuxtLink>
          <UiButton 
            v-else-if="currentUser" 
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
            :isOwner="profileUser.role === 'OWNER'"
            :isVerified="profileUser.verified"
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            Joined {{ joinedDate }}
          </span>
        </div>

        <div class="stats-row">
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
      :show="showFollowList"
      :title="followListTitle"
      :username="profileUser.username"
      :type="followListType"
      @close="showFollowList = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.nf-profile-header {
  border-bottom: 1px solid $color-border-soft;
}

.profile-banner {
  height: 150px;
  background-color: $color-surface-3; // simple placeholder
  width: 100%;
}

.profile-info-container {
  padding: $space-4;
  position: relative;
}

.profile-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: -70px; // Pull avatar up over banner
  margin-bottom: $space-3;
}

.profile-avatar {
  border: 4px solid $color-bg;
  background-color: $color-bg;
}

.action-btn-wrapper {
  margin-top: 70px; // Push button down from top of avatar overlap
}

.edit-profile-btn {
  border: 1px solid $color-border-soft;
  border-radius: $radius-full;
  font-weight: $font-weight-bold;
  
  &:hover {
    background-color: $color-surface-2;
  }
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: $space-2;

  .display-name {
    margin: 0;
    font-size: $font-size-xl;
    line-height: 1.2;
  }
}

.username-row {
  color: $color-text-muted;
  font-size: $font-size-base;
  margin-bottom: $space-3;
}

.bio {
  font-size: $font-size-base;
  line-height: 1.5;
  margin-bottom: $space-3;
  white-space: pre-wrap;
}

.meta-row {
  display: flex;
  gap: $space-4;
  margin-bottom: $space-3;

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: $space-1;
    color: $color-text-muted;
    font-size: $font-size-sm;

    svg {
      opacity: 0.8;
    }
  }
}

.stats-row {
  display: flex;
  gap: $space-4;

  .stat {
    font-size: $font-size-sm;
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    font-family: inherit;
    
    strong {
      color: $color-text;
    }
    
    .label {
      color: $color-text-muted;
    }

    &.clickable {
      cursor: pointer;
      &:hover strong {
        text-decoration: underline;
      }
    }
  }
}
</style>
