<!--
  app/components/layout/MobileNav.vue
  NanoFeed — Bottom Navigation for Mobile
-->
<script setup lang="ts">
import { useNotifications } from '../../composables/useNotifications'

const { user, isAuthenticated, isOwner } = useNanoAuth()

interface NavLink {
  name: string
  path: string
  icon: string
  badge?: number
}

const navLinks = computed(() => {
  const links: NavLink[] = [{ name: 'Home', path: '/', icon: 'home' }]

  if (isAuthenticated.value) {
    links.push({ name: 'Search', path: '/search', icon: 'search' })
    links.push({
      name: 'Notifications',
      path: '/notifications',
      icon: 'bell',
      badge: unreadCount.value,
    })
    links.push({ name: 'Profile', path: `/profile/${user.value?.username}`, icon: 'user' })
  }

  if (isOwner.value) {
    links.push({ name: 'Dashboard', path: '/dashboard', icon: 'dashboard' })
  }

  return links
})
const { unreadCount, fetchUnreadCount } = useNotifications()

onMounted(() => {
  if (isAuthenticated.value) {
    fetchUnreadCount()
  }
})
</script>

<template>
  <nav class="nf-mobile-nav" aria-label="Main navigation">
    <NuxtLink
      v-for="link in navLinks"
      :key="link.path"
      :to="link.path"
      class="nav-item"
      active-class="is-active"
      :aria-label="link.name"
    >
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
      <!-- User / Profile -->
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
      <!-- Search -->
      <svg
        v-else-if="link.icon === 'search'"
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
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <!-- Notifications -->
      <div v-else-if="link.icon === 'bell'" class="icon-wrapper">
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
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <span v-if="link.badge && link.badge > 0" class="badge-dot" />
      </div>
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
    </NuxtLink>

    <!-- Settings (if auth) -->
    <NuxtLink
      v-if="isAuthenticated"
      to="/settings"
      class="nav-item"
      active-class="is-active"
      aria-label="Settings"
    >
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
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        />
      </svg>
    </NuxtLink>
  </nav>
</template>

<style src="~/assets/scss/components/layout/MobileNav.scss" lang="scss" scoped></style>
