<!--
  app/components/dashboard/UsersList.vue
  NanoFeed — Owner User Management
-->
<script setup lang="ts">
import UiAvatar from '../ui/Avatar.vue'
import UiBadge from '../ui/Badge.vue'
import RestrictionModal from './RestrictionModal.vue'

const props = defineProps<{
  searchQuery?: string
}>()

const { data, status, refresh } = useFetch(() => `/api/dashboard/users?q=${props.searchQuery || ''}`)

const result = computed(() => (data.value as { data?: any })?.data ?? null)
const users = computed(() => result.value?.users ?? [])
const isLoading = computed(() => status.value === 'pending')

const isProcessing = ref<string | null>(null)

const updateUserStatus = async (userId: string, updates: any) => {
  isProcessing.value = userId
  try {
    await $fetch('/api/dashboard/update-user-status', {
      method: 'POST',
      body: { userId, ...updates }
    })
    await refresh()
  } catch (err) {
    console.error('Failed to update user status:', err)
  } finally {
    isProcessing.value = null
  }
}

// Restriction Feature
const showRestrictionModal = ref(false)
const selectedUser = ref<any>(null)

const openRestrictionModal = (user: any) => {
  selectedUser.value = user
  showRestrictionModal.value = true
}

const handleRestrictionConfirm = async (note: string) => {
  if (!selectedUser.value) return
  
  const userId = selectedUser.value.id
  showRestrictionModal.value = false
  
  await updateUserStatus(userId, {
    isRestricted: true,
    restrictionNote: note
  })
}
</script>

<template>
  <div class="nf-users-list">
    <div v-if="isLoading && users.length === 0" class="loading-state">
      <div class="spinner"></div>
    </div>
    
    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" :class="{ restricted: user.isRestricted }">
            <td>
              <div class="user-info">
                <UiAvatar :src="user.avatar" :alt="user.username" size="sm" />
                <div class="user-text">
                  <span class="name">{{ user.displayName }}</span>
                  <span class="handle">@{{ user.username }}</span>
                </div>
              </div>
            </td>
            <td>
              <UiBadge :variant="user.role === 'OWNER' ? 'owner' : 'default'" :text="user.role" />
            </td>
            <td>
              <div class="status-stack">
                <UiBadge v-if="user.verified" variant="verified" text="Verified" />
                <UiBadge v-if="user.isRestricted" variant="danger" text="Restricted" />
                <span v-if="!user.verified && !user.isRestricted" class="status-unverified">Standard</span>
              </div>
            </td>
            <td>
              <div class="actions">
                <div class="action-group">
                  <span class="group-label">Verification:</span>
                  <button 
                    class="action-btn" 
                    :disabled="isProcessing === user.id"
                    @click="updateUserStatus(user.id, { verified: !user.verified })"
                  >
                    {{ user.verified ? 'Revoke' : 'Verify' }}
                  </button>
                </div>

                <div class="action-group">
                  <span class="group-label">Access:</span>
                  <button 
                    v-if="!user.isRestricted"
                    class="action-btn restrict" 
                    :disabled="isProcessing === user.id"
                    @click="openRestrictionModal(user)"
                  >
                    Disable Account
                  </button>
                  <button 
                    v-else
                    class="action-btn enable" 
                    :disabled="isProcessing === user.id"
                    @click="updateUserStatus(user.id, { isRestricted: false })"
                  >
                    Enable Account
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Restriction Modal -->
    <RestrictionModal 
      :show="showRestrictionModal"
      :username="selectedUser?.username || ''"
      action="restrict"
      @close="showRestrictionModal = false"
      @confirm="handleRestrictionConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>
.nf-users-list {
  padding: $space-4;
}

.loading-state {
  @include flex-center;
  padding: $space-10;
}

.users-table-container {
  overflow-x: auto;
  @include surface(2);
  border-radius: $radius-lg;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: $space-4;
    font-size: $font-size-xs;
    text-transform: uppercase;
    color: $color-text-muted;
    border-bottom: 1px solid $color-border-soft;
  }

  td {
    padding: $space-4;
    border-bottom: 1px solid $color-border-soft;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr.restricted td {
    background-color: rgba($color-danger, 0.02);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: $space-3;

  .user-text {
    display: flex;
    flex-direction: column;
    
    .name {
      font-weight: $font-weight-bold;
      color: $color-text;
      white-space: nowrap;
    }
    
    .handle {
      font-size: $font-size-sm;
      color: $color-text-muted;
    }
  }
}

.status-stack {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  align-items: flex-start;
}

.status-unverified {
  font-size: $font-size-sm;
  color: $color-text-muted;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: $space-3;

  @include md {
    flex-direction: row;
    align-items: center;
  }

  .action-group {
    display: flex;
    flex-direction: column;
    gap: $space-1;

    .group-label {
      font-size: 10px;
      color: $color-text-muted;
      text-transform: uppercase;
      font-weight: $font-weight-bold;
    }
  }

  .action-btn {
    padding: $space-1 $space-3;
    font-size: $font-size-xs;
    border-radius: $radius-md;
    background: rgba($color-text, 0.05);
    border: 1px solid $color-border-soft;
    color: $color-text;
    cursor: pointer;
    white-space: nowrap;
    @include hover-transition(all);

    &:hover:not(:disabled) {
      background: rgba($color-text, 0.1);
      border-color: $color-text-muted;
    }

    &.restrict {
      color: $color-danger;
      &:hover:not(:disabled) { background: rgba($color-danger, 0.1); border-color: $color-danger; }
    }

    &.enable {
      color: $color-success;
      &:hover:not(:disabled) { background: rgba($color-success, 0.1); border-color: $color-success; }
    }

    &.promote {
      color: $color-accent;
      &:hover:not(:disabled) { background: rgba($color-accent, 0.1); border-color: $color-accent; }
    }

    &.demote {
      color: $color-warning;
      &:hover:not(:disabled) { background: rgba($color-warning, 0.1); border-color: $color-warning; }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
