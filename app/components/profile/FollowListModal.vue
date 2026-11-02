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
const {
  data: usersData,
  status,
  refresh,
} = useFetch(url, {
  immediate: false,
})

const users = computed(() => (usersData.value as { data: PublicUser[] })?.data || [])
const isLoading = computed(() => status.value === 'pending')

// Watch for show to trigger refresh
watch(
  () => props.show,
  (newVal) => {
    if (newVal) refresh()
  },
)

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body custom-scrollbar">
          <div v-if="isLoading && users.length === 0" class="loading-state">
            <div class="spinner" />
          </div>

          <div v-else-if="users.length === 0 && !isLoading" class="empty-state">
            <p>No user found.</p>
          </div>

          <div v-else class="user-list">
            <div v-for="user in users" :key="user.id" class="user-item-wrapper">
              <NuxtLink :to="`/profile/${user.username}`" class="user-item" @click="handleClose">
                <UiAvatar :src="user.avatar" :alt="user.username" size="md" />
                <div class="user-info">
                  <div class="name-row">
                    <span class="display-name">{{ user.displayName }}</span>
                    <VerificationBadge
                      :is-verified="user.verified"
                      :is-owner="user.role === 'OWNER'"
                      :is-contributor="!!user.contributorCommit"
                      :badge-order="user.badgeOrder"
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

<style src="~/assets/scss/components/profile/FollowListModal.scss" lang="scss" scoped></style>
