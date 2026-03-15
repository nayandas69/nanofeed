<!--
  app/components/dashboard/VerificationRequests.vue
  NanoFeed — Owner Verification Management with status filtering
-->
<script setup lang="ts">
import UiButton from '../ui/Button.vue'
import UiAvatar from '../ui/Avatar.vue'
import UiBadge from '../ui/Badge.vue'

const props = defineProps<{
  searchQuery?: string
}>()

const activeFilter = ref<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING')

const { data, status, refresh } = useFetch(() => `/api/dashboard/verifications?status=${activeFilter.value}&q=${props.searchQuery || ''}`)

const result = computed(() => (data.value as { data?: any })?.data ?? null)
const requests = computed(() => result.value?.requests ?? [])
const isLoading = computed(() => status.value === 'pending')

const isProcessing = ref<string | null>(null)

const handleVerify = async (id: string, action: 'verify' | 'reject') => {
  isProcessing.value = id
  
  try {
    await $fetch(`/api/dashboard/${action}-user`, {
      method: 'POST',
      body: { requestId: id }
    })
    await refresh()
  } catch (err) {
    alert(`Failed to ${action} user.`)
  } finally {
    isProcessing.value = null
  }
}

const setFilter = (filter: 'PENDING' | 'ACCEPTED' | 'REJECTED') => {
  activeFilter.value = filter
}
</script>

<template>
  <div class="nf-verification-requests">
    <!-- Filter Bar -->
    <div class="filter-bar">
      <button 
        v-for="filter in ['PENDING', 'ACCEPTED', 'REJECTED']" 
        :key="filter"
        class="filter-btn"
        :class="{ active: activeFilter === filter }"
        @click="setFilter(filter as any)"
      >
        {{ filter.charAt(0) + filter.slice(1).toLowerCase() }}
      </button>
    </div>

    <div v-if="isLoading && requests.length === 0" class="loading-state">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="requests.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-inbox"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
      <p>No {{ activeFilter.toLowerCase() }} verification requests.</p>
    </div>

    <div v-else class="requests-list custom-scrollbar">
      <div v-for="req in requests" :key="req.id" class="request-card">
        <div class="request-header">
          <div class="user-info">
            <UiAvatar :src="req.user.avatar" :alt="req.user.username" size="md" />
            <div class="names">
              <span class="display-name">{{ req.user.displayName }}</span>
              <span class="username">@{{ req.user.username }}</span>
            </div>
          </div>
          <div class="meta-info">
            <UiBadge 
              v-if="activeFilter !== 'PENDING'" 
              :variant="activeFilter === 'ACCEPTED' ? 'verified' : 'danger'"
              :text="activeFilter"
              size="sm"
            />
            <div class="date">{{ new Date(req.createdAt).toLocaleDateString() }}</div>
          </div>
        </div>

        <div class="request-body">
          <div class="detail-row">
            <span class="label">Real Name:</span>
            <span class="value">{{ req.realName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Email:</span>
            <span class="value">{{ req.email }}</span>
          </div>
          <div class="detail-row reason">
            <span class="label">Reason:</span>
            <p class="value">{{ req.reason }}</p>
          </div>
        </div>

        <div v-if="activeFilter === 'PENDING'" class="request-actions">
          <UiButton 
            variant="ghost" 
            :disabled="isProcessing !== null"
            @click="handleVerify(req.id, 'reject')"
          >
            Reject
          </UiButton>
          <UiButton 
            variant="primary" 
            :loading="isProcessing === req.id"
            :disabled="isProcessing !== null && isProcessing !== req.id"
            @click="handleVerify(req.id, 'verify')"
          >
            Approve
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nf-verification-requests {
  padding: $space-4;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  gap: $space-2;
  margin-bottom: $space-4;
  background-color: $color-surface-2;
  padding: $space-1;
  border-radius: $radius-lg;
  width: fit-content;

  .filter-btn {
    padding: $space-2 $space-4;
    border: none;
    border-radius: $radius-md;
    background: transparent;
    color: $color-text-muted;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: $color-text;
    }

    &.active {
      background-color: $color-surface-3;
      color: $color-accent;
      box-shadow: $shadow-sm;
    }
  }
}

.loading-state, .empty-state {
  flex: 1;
  @include flex-center;
  flex-direction: column;
  gap: $space-3;
  padding: $space-10;
  color: $color-text-muted;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  overflow-y: auto;
  padding-right: $space-2;
}

.request-card {
  @include surface(2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid $color-border-soft;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: $space-4;
  border-bottom: 1px solid $color-border-soft;
  background-color: rgba($color-bg, 0.3);

  .user-info {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  .names {
    display: flex;
    flex-direction: column;

    .display-name { font-weight: $font-weight-bold; }
    .username { font-size: $font-size-sm; color: $color-text-muted; }
  }

  .meta-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: $space-2;

    .date {
      font-size: $font-size-xs;
      color: $color-text-muted;
    }
  }
}

.request-body {
  padding: $space-4;
  display: flex;
  flex-direction: column;
  gap: $space-2;

  .detail-row {
    font-size: $font-size-sm;

    .label {
      color: $color-text-muted;
      margin-right: $space-2;
      font-weight: $font-weight-medium;
    }

    .value {
      color: $color-text;
    }

    &.reason {
      margin-top: $space-2;
      
      .label { display: block; margin-bottom: $space-1; }
      .value { 
        background-color: $color-bg;
        padding: $space-3;
        border-radius: $radius-sm;
        border: 1px solid $color-border-soft;
        margin: 0;
        white-space: pre-wrap;
        font-size: $font-size-xs;
      }
    }
  }
}

.request-actions {
  display: flex;
  justify-content: flex-end;
  gap: $space-3;
  padding: $space-3 $space-4;
  border-top: 1px solid $color-border-soft;
  background-color: rgba($color-bg, 0.2);
}
</style>
