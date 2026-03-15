<!--
  app/pages/dashboard.vue
  NanoFeed — Owner Dashboard Page
-->
<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue'
import DashboardStats from '../components/dashboard/DashboardStats.vue'
import VerificationRequests from '../components/dashboard/VerificationRequests.vue'
import ReportsList from '../components/dashboard/ReportsList.vue'
import UsersList from '../components/dashboard/UsersList.vue'
import SearchInput from '../components/ui/SearchInput.vue'

definePageMeta({
  middleware: 'auth'
})

// Client-side guard for UI (Server verifies it on the API endpoints)
const { isOwner, isLoading } = useNanoAuth()
const router = useRouter()

// Watch for auth resolution. If loaded and not owner, redirect away.
watch([isLoading, isOwner], ([loading, owner]) => {
  if (!loading && !owner) {
    router.replace('/')
  }
}, { immediate: true })

const activeTab = ref<'stats' | 'verifications' | 'reports' | 'users'>('stats')
const searchQuery = ref('')

// Reset search when changing tabs
watch(activeTab, () => {
  searchQuery.value = ''
})

const showSearch = computed(() => activeTab.value !== 'stats')
</script>

<template>
  <div class="page-dashboard" v-if="isOwner">
    <Navbar title="Owner Dashboard" showBack />

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
      <VerificationRequests v-else-if="activeTab === 'verifications'" :search-query="searchQuery" />
      <ReportsList v-else-if="activeTab === 'reports'" :search-query="searchQuery" />
      <UsersList v-else-if="activeTab === 'users'" :search-query="searchQuery" />
    </div>
  </div>
  
  <div v-else class="restricted-state">
    <div class="spinner"></div>
    <p>Verifying access...</p>
  </div>
</template>

<style lang="scss" scoped>
.restricted-state {
  @include flex-center;
  flex-direction: column;
  height: 50vh;
  gap: $space-4;
  color: $color-text-muted;
}

.dashboard-tabs {
  display: flex;
  border-bottom: 1px solid $color-border-soft;
  background-color: $color-surface-2;
  
  .tab-btn {
    flex: 1;
    padding: $space-3 $space-2;
    background: transparent;
    border: none;
    color: $color-text-muted;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    cursor: pointer;
    position: relative;
    @include hover-transition(background-color);

    @include md {
      font-size: $font-size-md;
    }

    &:hover {
      background-color: $color-surface-3;
    }

    &.active {
      color: $color-accent;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background-color: $color-accent;
        border-radius: $radius-full $radius-full 0 0;
      }
    }
  }
}

.dashboard-search {
  padding: $space-3 $space-4;
  background-color: $color-surface;
  border-bottom: 1px solid $color-border-soft;
}
</style>
