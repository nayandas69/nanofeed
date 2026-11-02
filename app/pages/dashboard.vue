<!--
  app/pages/dashboard.vue
  NanoFeed — Owner Dashboard Page
-->
<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue'
import DashboardStats from '../components/dashboard/DashboardStats.vue'
import SiteSettings from '../components/dashboard/SiteSettings.vue'
import VerificationRequests from '../components/dashboard/VerificationRequests.vue'
import ReportsList from '../components/dashboard/ReportsList.vue'
import UsersList from '../components/dashboard/UsersList.vue'
import SearchInput from '../components/ui/SearchInput.vue'

definePageMeta({
  middleware: 'auth',
})

// Client-side guard for UI (Server verifies it on the API endpoints)
const { isOwner, isLoading } = useNanoAuth()
const router = useRouter()

// Watch for auth resolution. If loaded and not owner, redirect away.
watch(
  [isLoading, isOwner],
  ([loading, owner]) => {
    if (!loading && !owner) {
      router.replace('/')
    }
  },
  { immediate: true },
)

const activeTab = ref<'stats' | 'verifications' | 'reports' | 'users' | 'settings'>('stats')
const searchQuery = ref('')

// Reset search when changing tabs
watch(activeTab, () => {
  searchQuery.value = ''
})

const showSearch = computed(() => activeTab.value !== 'stats' && activeTab.value !== 'settings')
</script>

<template>
  <div v-if="isOwner" class="page-dashboard">
    <Navbar title="Owner Dashboard" show-back />

    <!-- Dashboard Tabs -->
    <div class="dashboard-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'stats' }"
        @click="activeTab = 'stats'"
      >
        Overview
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'verifications' }"
        @click="activeTab = 'verifications'"
      >
        Verifications
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'reports' }"
        @click="activeTab = 'reports'"
      >
        Reports
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'settings' }"
        @click="activeTab = 'settings'"
      >
        Site controls
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        Users
      </button>
    </div>

    <!-- Search Bar (Conditional) -->
    <div v-if="showSearch" class="dashboard-search">
      <SearchInput
        v-model="searchQuery"
        placeholder="Filter by name, username, or content..."
        no-redirect
        :debounce="300"
      />
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <DashboardStats v-if="activeTab === 'stats'" />
      <SiteSettings v-else-if="activeTab === 'settings'" />
      <VerificationRequests v-else-if="activeTab === 'verifications'" :search-query="searchQuery" />
      <ReportsList v-else-if="activeTab === 'reports'" :search-query="searchQuery" />
      <UsersList v-else-if="activeTab === 'users'" :search-query="searchQuery" />
    </div>
  </div>

  <div v-else class="restricted-state">
    <div class="spinner" />
    <p>Verifying access...</p>
  </div>
</template>

<style src="~/assets/scss/pages/dashboard.scss" lang="scss" scoped></style>
