<!--
  app/components/layout/Navbar.vue
  NanoFeed — Mobile Top/Header Bar
-->
<script setup lang="ts">
import UiAvatar from '../ui/Avatar.vue'
import { useRouter } from 'vue-router'

import { onClickOutside } from '@vueuse/core'

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

const showLogoutMenu = ref(false)
const logoutMenuRef = ref<HTMLElement | null>(null)
onClickOutside(logoutMenuRef, () => {
  showLogoutMenu.value = false
})

const handleLogout = async () => {
  showLogoutMenu.value = false
  await logout()
}
</script>

<template>
  <header class="nf-navbar">
    <div class="left">
      <!-- Back Button -->
      <button v-if="showBack" class="icon-btn" aria-label="Go back" @click="onClickBack">
        <svg
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
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <!-- User Avatar Section (Mobile only) -->
      <div v-else-if="isAuthenticated && user" ref="logoutMenuRef" class="mobile-avatar-wrapper">
        <button
          class="avatar-btn"
          aria-label="Account menu"
          :aria-expanded="showLogoutMenu"
          @click="showLogoutMenu = !showLogoutMenu"
        >
          <UiAvatar :src="user.avatar" :alt="user.username" size="sm" class="mobile-avatar" />
        </button>

        <!-- Logout Menu Dropdown -->
        <Transition name="slide-up">
          <div v-if="showLogoutMenu" class="logout-dropdown">
            <button class="logout-btn" @click="handleLogout">
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
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout @{{ user.username }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Title -->
    <h1 class="title">{{ title }}</h1>

    <div class="right">
      <slot name="actions" />
    </div>
  </header>
</template>

<style src="~/assets/scss/components/layout/Navbar.scss" lang="scss" scoped></style>
