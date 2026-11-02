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

const { data, status, refresh } = useFetch(
  () => `/api/dashboard/verifications?status=${activeFilter.value}&q=${props.searchQuery || ''}`,
)

const result = computed(() => data.value?.data ?? null)
const requests = computed(() => result.value?.requests ?? [])
const isLoading = computed(() => status.value === 'pending')

const isProcessing = ref<string | null>(null)

const handleVerify = async (id: string, action: 'verify' | 'reject') => {
  isProcessing.value = id

  try {
    await $fetch(`/api/dashboard/${action}-user`, {
      method: 'POST',
      body: { requestId: id },
    })
    await refresh()
  } catch {
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
        @click="setFilter(filter)"
      >
        {{ filter.charAt(0) + filter.slice(1).toLowerCase() }}
      </button>
    </div>

    <div v-if="isLoading && requests.length === 0" class="loading-state">
      <div class="spinner" />
    </div>

    <div v-else-if="requests.length === 0" class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-inbox"
      >
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path
          d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
        />
      </svg>
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

<style
  src="~/assets/scss/components/dashboard/VerificationRequests.scss"
  lang="scss"
  scoped
></style>
