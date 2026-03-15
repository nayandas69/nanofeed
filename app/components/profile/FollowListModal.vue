<!--
  app/components/profile/FollowListModal.vue
  NanoFeed — Modal for displaying followers or following list
-->
<script setup lang="ts">
import UiAvatar from '../ui/Avatar.vue'
import UiButton from '../ui/Button.vue'
import VerificationBadge from './VerificationBadge.vue'
import type { PublicUser } from '#shared/types/user'

const props = defineProps<{
  show: boolean
  title: string
  username: string
  type: 'followers' | 'following'
}>()

const emit = defineEmits(['close'])

const { user: currentUser } = useNanoAuth()

// Reactive URL for fetching
const url = computed(() => `/api/users/${props.username}/${props.type}`)
const { data: usersData, status, refresh } = useFetch(url, {
  immediate: false
})

const users = computed(() => (usersData.value as { data: PublicUser[] })?.data || [])
const isLoading = computed(() => status.value === 'pending')

// Watch for show to trigger refresh
watch(() => props.show, (newVal) => {
  if (newVal) refresh()
})

const handleClose = () => {
  emit('close')
}

// Follow toggle state for users in the list
const processingId = ref<string | null>(null)
const handleFollowToggle = async (user: PublicUser) => {
  if (!currentUser.value) return navigateTo('/auth/login')
  
  processingId.value = user.id
  try {
    await $fetch(`/api/users/${user.username}/follow`, { method: 'POST' })
    // Optimistic update
    user.isFollowing = !user.isFollowing
  } catch (err) {
    console.error('Follow toggle failed in list:', err)
  } finally {
    processingId.value = null
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="nf-modal-overlay" @click.self="handleClose">
      <div class="nf-modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="close-btn" @click="handleClose">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="modal-body custom-scrollbar">
          <div v-if="isLoading && users.length === 0" class="loading-state">
            <div class="spinner"></div>
          </div>
          
          <div v-else-if="users.length === 0 && !isLoading" class="empty-state">
            <p>No user found.</p>
          </div>

          <div v-else class="user-list">
            <div 
              v-for="user in users" 
              :key="user.id" 
              class="user-item-wrapper"
            >
              <NuxtLink 
                :to="`/profile/${user.username}`"
                class="user-item"
                @click="handleClose"
              >
                <UiAvatar :src="user.avatar" :alt="user.username" size="md" />
                <div class="user-info">
                  <div class="name-row">
                    <span class="display-name">{{ user.displayName }}</span>
                    <VerificationBadge 
                      v-if="user.verified || user.role === 'OWNER'"
                      :isVerified="user.verified" 
                      :isOwner="user.role === 'OWNER'" 
                    />
                  </div>
                  <span class="username">@{{ user.username }}</span>
                </div>
              </NuxtLink>

              <!-- Follow Button (Hidden for self) -->
              <div v-if="currentUser && currentUser.id !== user.id" class="item-actions">
                <UiButton 
                  size="sm"
                  :variant="user.isFollowing ? 'secondary' : 'primary'"
                  :loading="processingId === user.id"
                  @click.stop="handleFollowToggle(user)"
                >
                  {{ user.isFollowing ? 'Unfollow' : 'Follow' }}
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.nf-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $space-4;
}

.nf-modal-content {
  background-color: $color-bg;
  border: 1px solid $color-border-soft;
  border-radius: $radius-xl;
  width: 100%;
  max-width: 450px;
  height: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: $shadow-xl;
  overflow: hidden;
}

.modal-header {
  padding: $space-4;
  border-bottom: 1px solid $color-border-soft;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .modal-title {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
  }

  .close-btn {
    background: none;
    border: none;
    color: $color-text-muted;
    cursor: pointer;
    padding: $space-1;
    border-radius: $radius-full;
    transition: all 0.2s;

    &:hover {
      background-color: $color-surface-2;
      color: $color-text;
    }
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: $space-2;
  
  // Custom scrollbar for better feel
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: $color-surface-3;
    border-radius: $radius-full;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.loading-state, .empty-state {
  padding: $space-10;
  text-align: center;
  color: $color-text-muted;
}

.user-list {
  display: flex;
  flex-direction: column;
}

.user-item-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-1 $space-4;
  border-radius: $radius-lg;
  transition: background-color 0.2s;

  &:hover {
    background-color: $color-surface-2;
  }
}

.user-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-2 0;
  text-decoration: none;

  .user-info {
    display: flex;
    flex-direction: column;

    .name-row {
      display: flex;
      align-items: center;
      gap: $space-1;
      
      .display-name {
        color: $color-text;
        font-weight: $font-weight-bold;
        font-size: $font-size-base;
      }
    }

    .username {
      color: $color-text-muted;
      font-size: $font-size-sm;
    }
  }
}

.item-actions {
  margin-left: $space-4;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
  
  .nf-modal-content {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  
  .nf-modal-content {
    transform: scale(0.95);
  }
}
</style>
