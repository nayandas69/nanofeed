<!--
  app/components/layout/MobileNav.vue
  NanoFeed — Bottom Navigation for Mobile
-->
<script setup lang="ts">
import UiAvatar from '../ui/Avatar.vue'

const { user, isAuthenticated, isOwner } = useNanoAuth()

const navLinks = computed(() => {
  const links = [
    { name: 'Home', path: '/', icon: 'home' },
  ]

  if (isAuthenticated.value) {
    links.push({ name: 'Search', path: '/search', icon: 'search' })
    links.push({ name: 'Profile', path: `/profile/${user.value?.username}`, icon: 'user' })
  }

  if (isOwner.value) {
    links.push({ name: 'Dashboard', path: '/dashboard', icon: 'dashboard' })
  }

  return links
})
const { isComposerOpen, openComposer } = useCompose()
</script>

<template>
  <nav class="nf-mobile-nav">
    <NuxtLink
      v-for="link in navLinks"
      :key="link.path"
      :to="link.path"
      class="nav-item"
      active-class="is-active"
    >
      <!-- Home -->
      <svg v-if="link.icon === 'home'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <!-- User / Profile -->
      <svg v-else-if="link.icon === 'user'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <!-- Search -->
      <svg v-else-if="link.icon === 'search'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <!-- Dashboard -->
      <svg v-else-if="link.icon === 'dashboard'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
    </NuxtLink>

    <!-- Settings (if auth) -->
    <NuxtLink v-if="isAuthenticated" to="/settings" class="nav-item" active-class="is-active">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </NuxtLink>

    <!-- Post Floating Action Button wrapper - for layout space, actual fab is fixed -->
    <div class="fab-spacer"></div>
  </nav>

  <!-- Mobile Floating Action Button (FAB) -->
  <button
    v-if="isAuthenticated"
    class="nf-mobile-fab"
    @click="openComposer"
    aria-label="Create post"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </button>
</template>

<style lang="scss" scoped>
.nf-mobile-nav {
  display: none; // Hidden on desktop
  
  @include max-sm {
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: rgba($color-bg, 0.85);
    backdrop-filter: blur(8px);
    border-top: 1px solid $color-border-soft;
    z-index: $z-sticky;
  }
}

.nav-item {
  display: flex;
  padding: $space-3;
  color: $color-text-muted;
  border-radius: $radius-full;
  @include hover-transition(color);

  &.is-active {
    color: $color-text;
  }

  &:active {
    background-color: $color-surface-2;
  }
}

.fab-spacer {
  width: 56px; // Space for the FAB
}

.nf-mobile-fab {
  display: none;

  @include max-sm {
    @include flex-center;
    position: fixed;
    bottom: 76px; // Above the nav bar
    right: 16px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: $color-accent;
    color: white;
    border: none;
    box-shadow: $shadow-lg;
    z-index: $z-sticky;
    
    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
