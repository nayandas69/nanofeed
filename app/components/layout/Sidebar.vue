<!--
  app/components/layout/Sidebar.vue
  NanoFeed — Desktop Left Navigation
-->
<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import UiButton from '../ui/Button.vue'
import UiAvatar from '../ui/Avatar.vue'
import SearchInput from '../ui/SearchInput.vue'
import { useNotifications } from '../../composables/useNotifications'

const { user, isAuthenticated, logout, isOwner } = useNanoAuth()
const router = useRouter()
const showLogoutMenu = ref(false)
const logoutMenuRef = ref<HTMLElement | null>(null)

const { unreadCount, fetchUnreadCount } = useNotifications()

onMounted(() => {
  if (isAuthenticated.value) {
    fetchUnreadCount()
  }
})

onClickOutside(logoutMenuRef, () => {
  showLogoutMenu.value = false
})

const handleLogout = async () => {
  showLogoutMenu.value = false
  await logout()
}

const _onClickBack = () => {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const navLinks = computed(() => {
  const links: Array<{ name: string; path: string; icon: string; badge?: number }> = [
    { name: 'Home', path: '/', icon: 'home' },
  ]

  if (isAuthenticated.value) {
    links.push({
      name: 'Notifications',
      path: '/notifications',
      icon: 'bell',
      badge: unreadCount.value,
    })
    links.push({ name: 'Profile', path: `/profile/${user.value?.username}`, icon: 'user' })
    links.push({ name: 'Settings', path: '/settings', icon: 'settings' })
  }

  if (isOwner.value) {
    links.push({ name: 'Dashboard', path: '/dashboard', icon: 'dashboard' })
  }

  return links
})

const { openComposer } = useCompose()

const onClickPost = () => {
  openComposer()
}
</script>

<template>
  <aside class="nf-sidebar">
    <div class="sidebar-top">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <span class="logo-text">N<span>F</span></span>
      </NuxtLink>

      <!-- Search (Desktop) -->
      <div class="sidebar-search">
        <SearchInput compact placeholder="Search..." />
      </div>

      <!-- Navigation -->
      <nav class="nav-menu">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-item"
          active-class="is-active"
        >
          <!-- Simplified icons based on name -->
          <div class="icon-wrapper">
            <!-- Home -->
            <svg
              v-if="link.icon === 'home'"
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
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <!-- User -->
            <svg
              v-else-if="link.icon === 'user'"
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <!-- Settings -->
            <svg
              v-else-if="link.icon === 'settings'"
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
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
            <!-- Dashboard -->
            <svg
              v-else-if="link.icon === 'dashboard'"
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
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <!-- Bell (Notifications) -->
            <svg
              v-else-if="link.icon === 'bell'"
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
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>

            <span v-if="link.badge && link.badge > 0" class="badge-dot" />
          </div>
          <span class="label"
            >{{ link.name }}
            <span v-if="link.badge && link.badge > 0" class="badge-count">{{
              link.badge > 99 ? '99+' : link.badge
            }}</span></span
          >
        </NuxtLink>
      </nav>

      <!-- Compose Button -->
      <!-- Only trigger a modal in a real app; here we just link to top for simplicity/focus -->
      <UiButton v-if="isAuthenticated" block size="lg" class="compose-btn" @click="onClickPost">
        Post
      </UiButton>
    </div>

    <!-- User Section -->
    <div class="sidebar-bottom">
      <NuxtLink to="/docs" class="sidebar-docs">Documentation ↗</NuxtLink>
      <div v-if="isAuthenticated && user" ref="logoutMenuRef" class="user-menu-wrapper">
        <!-- Logout Menu Dropdown -->
        <Transition name="slide-up">
          <div v-if="showLogoutMenu" class="logout-dropdown">
            <button class="logout-btn" @click="handleLogout">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout @{{ user.username }}
            </button>
          </div>
        </Transition>

        <div
          class="user-menu"
          :class="{ 'is-active': showLogoutMenu }"
          @click="showLogoutMenu = !showLogoutMenu"
        >
          <UiAvatar :src="user.avatar" :alt="user.username" size="md" />
          <div class="user-info">
            <div class="name">{{ user.displayName }}</div>
            <div class="username">@{{ user.username }}</div>
          </div>
          <svg
            class="more-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </div>
      </div>

      <div v-else class="login-prompt">
        <NuxtLink to="/auth/login">
          <UiButton block variant="primary">Sign In</UiButton>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<style src="~/assets/scss/components/layout/Sidebar.scss" lang="scss" scoped></style>
