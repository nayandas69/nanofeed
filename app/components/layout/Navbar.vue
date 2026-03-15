<!--
  app/components/layout/Navbar.vue
  NanoFeed — Mobile Top/Header Bar
-->
<script setup lang="ts">
import UiAvatar from '../ui/Avatar.vue'
import SearchInput from '../ui/SearchInput.vue'

interface Props {
  title?: string
  showBack?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Home',
  showBack: false,
})

const { user, isAuthenticated, logout } = useNanoAuth()
const router = useRouter()

const onClickBack = () => {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const showSearch = ref(false)
</script>

<template>
  <header class="nf-navbar">
    <div class="left">
      <!-- Back Button -->
      <button v-if="showBack" class="icon-btn" @click="onClickBack" aria-label="Go back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <!-- User Avatar (Mobile only) -->
      <UiAvatar
        v-else-if="isAuthenticated && user"
        :src="user.avatar"
        :alt="user.username"
        size="sm"
        class="mobile-avatar"
        @click="logout"
        title="Logout"
      />
    </div>

    <!-- Title -->
    <h1 v-if="!showSearch" class="title">{{ title }}</h1>

    <!-- Search Bar (Integrated) -->
    <div v-else class="navbar-search">
      <SearchInput compact @search="showSearch = false" />
    </div>

    <div class="right">
      <button 
        v-if="!showSearch" 
        class="icon-btn search-toggle" 
        @click="showSearch = true"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>
      <button 
        v-else 
        class="icon-btn close-search" 
        @click="showSearch = false"
        aria-label="Close search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <slot name="actions" />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.nf-navbar {
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  height: 53px;
  padding: 0 $space-4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba($color-bg, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid $color-border-soft;

  // Visual consistency for 3 columns even if slots are empty
  .left, .right {
    display: flex;
    align-items: center;
    width: 60px;
    height: 100%;
  }
  
  .right {
    justify-content: flex-end;
  }
  .title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    margin: 0;
    @include truncate;
    flex: 1;
    text-align: center;
  }
}

.navbar-search {
  flex: 1;
  margin: 0 $space-2;
  @include flex-center;
  max-width: 400px;
}

.icon-btn {
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: $color-text;
  @include hover-transition(background-color);

  &:hover {
    background-color: $color-surface-2;
  }
}

.mobile-avatar {
  display: none;
  cursor: pointer;
  
  @include max-sm {
    display: inline-block;
  }
}

// On desktop, the title typically goes to the left rather than center
@include md {
  .title {
    text-align: left;
    margin-left: $space-4; // space from back button if present
  }
  
  .nf-navbar {
    justify-content: flex-start;
  }
}
</style>
