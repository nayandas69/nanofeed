<!--
  app/layouts/default.vue
  NanoFeed — Main App Shell
-->
<script setup lang="ts">
import Sidebar from '../components/layout/Sidebar.vue'
import MobileNav from '../components/layout/MobileNav.vue'
import RestrictionBanner from '../components/layout/RestrictionBanner.vue'
import PostComposeModal from '../components/post/PostComposeModal.vue'
import MaintenanceScreen from '../components/maintenance/MaintenanceScreen.vue'

const { data: siteSettings, refresh: refreshSiteSettings } = await useFetch('/api/site/settings', {
  key: 'site-settings',
})
const route = useRoute()
const { user } = useNanoAuth()
const maintenanceEnabled = computed(() => siteSettings.value?.maintenanceEnabled === true)
const ownProfile = computed(
  () =>
    route.name === 'profile-username' &&
    typeof route.params.username === 'string' &&
    route.params.username === user.value?.username,
)
const showMaintenance = computed(
  () => maintenanceEnabled.value && route.path !== '/dashboard' && !ownProfile.value,
)
const updateSettings = () => {
  void refreshSiteSettings()
}
let settingsTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  settingsTimer = setInterval(updateSettings, 30_000)
  window.addEventListener('focus', updateSettings)
})
onBeforeUnmount(() => {
  if (settingsTimer) clearInterval(settingsTimer)
  window.removeEventListener('focus', updateSettings)
})
watch(() => route.path, updateSettings)
</script>

<template>
  <MaintenanceScreen
    v-if="showMaintenance"
    :message="siteSettings?.maintenanceMessage || ''"
    :ends-at="siteSettings?.maintenanceEndsAt"
  />
  <div v-else class="nf-app-shell">
    <Sidebar v-if="!maintenanceEnabled" />
    <main class="nf-main-content">
      <RestrictionBanner />
      <slot />
    </main>
    <MobileNav v-if="!maintenanceEnabled" />
    <PostComposeModal v-if="!maintenanceEnabled" />
  </div>
</template>

<style src="~/assets/scss/layouts/default.scss" lang="scss" scoped></style>
