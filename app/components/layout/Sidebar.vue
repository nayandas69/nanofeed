<!--
  app/components/layout/Sidebar.vue
  NanoFeed — Desktop Left Navigation
-->
<script setup lang="ts">
// @ts-ignore - Explicit import to fix "not defined" runtime error
import { onClickOutside } from '@vueuse/core'
import UiButton from '../ui/Button.vue'
import UiAvatar from '../ui/Avatar.vue'
import SearchInput from '../ui/SearchInput.vue'

const { user, isAuthenticated, logout, isOwner } = useNanoAuth() as any
const router = useRouter()
const showLogoutMenu = ref(false)
const logoutMenuRef = ref<HTMLElement | null>(null)

onClickOutside(logoutMenuRef, () => {
  showLogoutMenu.value = false
})

const handleLogout = async () => {
  showLogoutMenu.value = false
  await logout()
}

const onClickBack = () => {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const navLinks = computed(() => {
  const links = [
    { name: 'Home', path: '/', icon: 'home' },
  ]

  if (isAuthenticated.value) {
    links.push({ name: 'Profile', path: `/profile/${user.value?.username}`, icon: 'user' })
    links.push({ name: 'Settings', path: '/settings', icon: 'settings' })
  }

  if (isOwner.value) {
    links.push({ name: 'Dashboard', path: '/dashboard', icon: 'dashboard' })
  }

  return links
})

const { isComposerOpen, openComposer } = useCompose()

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
            <svg v-if="link.icon === 'home'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <!-- User -->
            <svg v-else-if="link.icon === 'user'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <!-- Settings -->
            <svg v-else-if="link.icon === 'settings'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <!-- Dashboard -->
            <svg v-else-if="link.icon === 'dashboard'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          </div>
          <span class="label">{{ link.name }}</span>
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
      <div v-if="isAuthenticated && user" class="user-menu-wrapper">
        <!-- Logout Menu Dropdown -->
        <Transition name="slide-up">
          <div v-if="showLogoutMenu" class="logout-dropdown" ref="logoutMenuRef">
            <button class="logout-btn" @click="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout @{{ user.username }}
            </button>
          </div>
        </Transition>

        <div class="user-menu" @click="showLogoutMenu = !showLogoutMenu" :class="{ 'is-active': showLogoutMenu }">
          <UiAvatar :src="user.avatar" :alt="user.username" size="md" />
          <div class="user-info">
            <div class="name">{{ user.displayName }}</div>
            <div class="username">@{{ user.username }}</div>
          </div>
          <svg class="more-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </div>
      </div>

      <div v-else class="login-prompt">
        <NuxtLink to="/auth/login">
          <UiButton block variant="secondary">Sign In</UiButton>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.nf-sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100dvh;
  width: $sidebar-width;
  padding: $space-4;
  position: sticky;
  top: 0;

  @include max-sm {
    display: none; // Hidden on mobile, replaced by MobileNav
  }
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  width: 50px;
  height: 50px;
  text-decoration: none;
  @include hover-transition(background-color);

  &:hover {
    background-color: $color-surface-2;
  }

  .logo-text {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-text;
    letter-spacing: -0.05em;
    
    span {
      color: $color-accent;
    }
  }
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: $space-4;
  padding: $space-3 $space-4;
  border-radius: $radius-full;
  font-size: $font-size-xl;
  color: $color-text;
  text-decoration: none;
  width: max-content;
  @include hover-transition(background-color);

  &:hover {
    background-color: $color-surface-2;
  }

  &.is-active {
    font-weight: $font-weight-bold;
  }

  .icon-wrapper {
    @include flex-center;
  }
}

.compose-btn {
  margin-top: $space-4;
}

.sidebar-bottom {
  margin-top: auto;
}

.user-menu-wrapper {
  position: relative;
  width: 100%;
}

.logout-dropdown {
  position: absolute;
  bottom: calc(100% + $space-2);
  left: 0;
  right: 0;
  background-color: $color-bg;
  border: 1px solid $color-border-soft;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  padding: $space-3;
  z-index: $z-dropdown;

  .logout-btn {
    @include flex-center;
    justify-content: flex-start;
    gap: $space-3;
    width: 100%;
    padding: $space-3;
    border-radius: $radius-md;
    color: $color-text;
    font-weight: $font-weight-bold;
    font-size: $font-size-sm;
    @include hover-transition(background-color);

    &:hover {
      background-color: rgba($color-danger, 0.1);
      color: $color-danger;
    }
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-3;
  border-radius: $radius-full;
  cursor: pointer;
  @include hover-transition(background-color);

  &:hover, &.is-active {
    background-color: $color-surface-2;
  }

  .user-info {
    flex: 1;
    overflow: hidden;

    .name {
      font-weight: $font-weight-bold;
      font-size: $font-size-sm;
      @include truncate;
    }

    .username {
      color: $color-text-muted;
      font-size: $font-size-sm;
      @include truncate;
    }
  }

  .more-icon {
    color: $color-text-muted;
    flex-shrink: 0;
  }
}
</style>
