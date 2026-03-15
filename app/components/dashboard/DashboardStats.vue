<!--
  app/components/dashboard/DashboardStats.vue
  NanoFeed — Owner Dashboard Statistics Cards
-->
<script setup lang="ts">
import { useFetch } from '#app'

const { data, status } = useFetch('/api/dashboard/stats')

const stats = computed(() => (data.value as { data?: any })?.data ?? null)
const isLoading = computed(() => status.value === 'pending')
</script>

<template>
  <div class="nf-dashboard-stats">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="stats" class="stats-grid">
      <!-- Total Users -->
      <div class="stat-card">
        <div class="icon users-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="content">
          <h4 class="label">Total Users</h4>
          <span class="value">{{ stats.totalUsers }}</span>
        </div>
      </div>

      <!-- New Signups (7d) -->
      <div class="stat-card">
        <div class="icon signups-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
        </div>
        <div class="content">
          <h4 class="label">New Users (7d)</h4>
          <span class="value">{{ stats.recentSignups }}</span>
        </div>
      </div>

      <!-- Total Posts -->
      <div class="stat-card">
        <div class="icon posts-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="content">
          <h4 class="label">Total Posts</h4>
          <span class="value">{{ stats.totalPosts }}</span>
        </div>
      </div>

      <!-- Pending Verifications -->
      <div class="stat-card" :class="{ 'has-action': stats.pendingVerifications > 0 }">
        <div class="icon verify-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <div class="content">
          <h4 class="label">Pending Verification</h4>
          <span class="value">{{ stats.pendingVerifications }}</span>
        </div>
      </div>

      <!-- Open Reports -->
      <div class="stat-card" :class="{ 'has-action': stats.openReports > 0 }">
        <div class="icon reports-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
        </div>
        <div class="content">
          <h4 class="label">Open Reports</h4>
          <span class="value">{{ stats.openReports }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-state {
  @include flex-center;
  padding: $space-10;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $space-4;
  padding: $space-4;
}

.stat-card {
  @include surface(2);
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-4;

  &.has-action {
    border-color: $color-warning;
  }
}

.icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: $radius-lg;
  flex-shrink: 0;

  &.users-icon {
    background-color: rgba($color-accent, 0.1);
    color: $color-accent;
  }
  
  &.signups-icon {
    background-color: rgba($color-success, 0.1);
    color: $color-success;
  }

  &.posts-icon {
    background-color: rgba($color-text, 0.1);
    color: $color-text;
  }

  &.verify-icon {
    background-color: rgba($color-owner, 0.1);
    color: $color-owner;
  }

  &.reports-icon {
    background-color: rgba($color-danger, 0.1);
    color: $color-danger;
  }
}

.content {
  display: flex;
  flex-direction: column;

  .label {
    margin: 0;
    font-size: $font-size-sm;
    color: $color-text-muted;
    font-weight: $font-weight-normal;
  }

  .value {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    line-height: 1.2;
    color: $color-text;
  }
}
</style>
