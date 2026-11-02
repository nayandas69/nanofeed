<!--
  app/components/feed/HomeTabs.vue
  Sticky tab bar for switching between Recommended and Following feeds.
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  activeTab: 'recommended' | 'following' | 'latest'
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: 'recommended' | 'following' | 'latest']
}>()

// Mobile Scroll Logic: Hide on scroll down, show on scroll up
const isVisible = ref(true)
const lastScrollY = ref(0)
const scrollThreshold = 10 // Minimum scroll distance to trigger visibility change

const handleScroll = () => {
  if (typeof window === 'undefined') return

  const currentScrollY = window.scrollY
  const scrollDiff = Math.abs(currentScrollY - lastScrollY.value)

  // Show header if scrolling up significantly or at the very top
  if (currentScrollY <= 0) {
    isVisible.value = true
  } else if (scrollDiff > scrollThreshold) {
    if (currentScrollY > lastScrollY.value) {
      // Scrolling down
      isVisible.value = false
    } else {
      // Scrolling up
      isVisible.value = true
    }
    lastScrollY.value = currentScrollY
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav class="home-tabs" :class="{ 'is-hidden': !isVisible }">
    <div class="tabs-container">
      <button
        v-for="tab in ['recommended', 'following', 'latest'] as const"
        :key="tab"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        :aria-pressed="activeTab === tab"
        @click="emit('update:activeTab', tab)"
      >
        <span class="text">{{
          tab === 'recommended' ? 'For you' : tab === 'following' ? 'Following' : 'Latest'
        }}</span>
        <span class="indicator" />
      </button>
    </div>
  </nav>
</template>

<style src="~/assets/scss/components/feed/HomeTabs.scss" lang="scss" scoped></style>
