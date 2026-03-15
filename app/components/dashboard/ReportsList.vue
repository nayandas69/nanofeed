<!--
  app/components/dashboard/ReportsList.vue
  NanoFeed — Owner Reports Management
-->
<script setup lang="ts">
import UiBadge from '../ui/Badge.vue'
import { REPORT_REASON_LABELS } from '#shared/constants/reportReasons'

const props = defineProps<{
  searchQuery?: string
}>()

const { data, status, refresh } = useFetch(() => `/api/dashboard/reports?q=${props.searchQuery || ''}`)

const result = computed(() => (data.value as { data?: any })?.data ?? null)
const reports = computed(() => result.value?.reports ?? [])
const isLoading = computed(() => status.value === 'pending')

const isProcessing = ref<string | null>(null)

const resolveReport = async (reportId: string | null, action: 'RESOLVE' | 'DISMISS', hidePost = false, postId?: string) => {
  const targetId = postId || reportId
  if (!targetId) return

  isProcessing.value = targetId
  try {
    await $fetch('/api/dashboard/resolve-report', {
      method: 'POST',
      body: { reportId, postId, action, hidePost }
    })
    // Refresh the list
    await refresh()
  } catch (err) {
    console.error('Failed to resolve report:', err)
  } finally {
    isProcessing.value = null
  }
}
</script>

<template>
  <div class="nf-reports-list">
    <div v-if="isLoading && reports.length === 0" class="loading-state">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="reports.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
      <p>No active reports to review.</p>
    </div>

    <div v-else class="reports-grid">
      <div v-for="report in reports" :key="report.id" class="report-card" :class="{ 'is-grouped': report.type === 'POST' }">
        <!-- Status & Type Header -->
        <div class="report-header">
          <UiBadge 
            :variant="report.status === 'OPEN' ? 'warning' : 'default'" 
            :text="report.status" 
          />
          <span v-if="report.type === 'POST'" class="group-badge">
            {{ report.reports.length }} Reports
          </span>
          <span class="type-label">{{ report.type === 'POST' ? 'Post Report' : 'User Report' }}</span>
          <span class="date">{{ new Date(report.createdAt).toLocaleDateString() }}</span>
        </div>
        
        <!-- Post Content (Timeline Link) -->
        <div v-if="report.postId && report.post" class="report-post-preview">
          <div class="author-info">
            <span class="label">Author:</span>
            <NuxtLink :to="`/profile/${report.post.author.username}`" class="author-link">
              @{{ report.post.author.username }}
            </NuxtLink>
          </div>
          <div class="content-box">
             <p class="post-text">"{{ report.post.content }}"</p>
             <NuxtLink :to="`/post/${report.postId}`" class="view-post-link">
               View Post Timeline →
             </NuxtLink>
          </div>
        </div>

        <!-- Reporter Timeline -->
        <div class="reporter-timeline">
          <span class="label">Reporting History:</span>
          <div class="timeline-items">
            <!-- If grouped, show many; if individual (USER report), show one -->
            <div v-for="r in (report.type === 'POST' ? report.reports : [report])" :key="r.id" class="timeline-item">
              <div class="reporter-info">
                <strong>@{{ r.reporter?.username }}</strong>
                <span class="reason-tag">{{ (REPORT_REASON_LABELS as any)[r.reason] || r.reason }}</span>
                <span class="time">{{ new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>
              <p v-if="r.notes" class="reporter-message">{{ r.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Reported User Info (Mostly for USER reports) -->
        <div v-if="report.reportedUser && report.type === 'USER'" class="report-meta">
          <div class="reported-user">
            <span class="label">Reported User:</span>
             <NuxtLink :to="`/profile/${report.reportedUser.username}`">@{{ report.reportedUser.username }}</NuxtLink>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="report.status === 'OPEN'" class="report-actions">
          <button 
            class="action-btn dismiss" 
            :disabled="isProcessing === (report.postId || report.id)"
            @click="resolveReport(report.type === 'POST' ? null : report.id, 'DISMISS', false, report.postId)"
          >
            Dismiss All
          </button>
          
          <button 
            v-if="report.type === 'POST'"
            class="action-btn resolve-hide" 
            :disabled="isProcessing === report.postId"
            @click="resolveReport(null, 'RESOLVE', true, report.postId)"
          >
            Hide Post & Resolve
          </button>

          <button 
            v-else
            class="action-btn resolve" 
            :disabled="isProcessing === report.id"
            @click="resolveReport(report.id, 'RESOLVE')"
          >
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nf-reports-list {
  padding: $space-4;
}

.loading-state, .empty-state {
  @include flex-center;
  flex-direction: column;
  gap: $space-3;
  padding: $space-10;
  color: $color-text-muted;
}

.reports-grid {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.report-card {
  @include surface(2);
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-5;
  border-left: 4px solid transparent;

  &.is-grouped {
    border-left-color: $color-warning;
  }

  .label {
    font-size: $font-size-xs;
    color: $color-text-muted;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: $space-1;
    display: block;
  }
}

.report-header {
  display: flex;
  align-items: center;
  gap: $space-3;
  border-bottom: 1px solid $color-border-soft;
  padding-bottom: $space-3;

  .group-badge {
    background: rgba($color-warning, 0.1);
    color: $color-warning;
    padding: 2px 8px;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
  }

  .type-label {
    font-weight: $font-weight-bold;
    color: $color-text;
    flex: 1;
  }

  .date {
    font-size: $font-size-sm;
    color: $color-text-muted;
  }
}

.report-post-preview {
  background: $color-surface-3;
  padding: $space-4;
  border-radius: $radius-md;
  border: 1px solid $color-border-soft;

  .author-info {
    margin-bottom: $space-2;
    font-size: $font-size-sm;
    
    .author-link {
      color: $color-accent;
      font-weight: $font-weight-bold;
      &:hover { text-decoration: underline; }
    }
  }

  .post-text {
    margin: 0 0 $space-2 0;
    font-size: $font-size-base;
    color: $color-text;
  }

  .view-post-link {
    font-size: $font-size-sm;
    color: $color-accent;
    display: inline-block;
    &:hover { text-decoration: underline; }
  }
}

.reporter-timeline {
  .timeline-items {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    margin-top: $space-2;
  }

  .timeline-item {
    background: rgba($color-surface, 0.5);
    padding: $space-3;
    border-radius: $radius-md;
    border-left: 2px solid $color-border-soft;

    .reporter-info {
      display: flex;
      align-items: center;
      gap: $space-2;
      font-size: $font-size-sm;
      margin-bottom: $space-1;

      .reason-tag {
        font-size: 10px;
        background: $color-surface-2;
        padding: 1px 6px;
        border-radius: $radius-sm;
        color: $color-text-muted;
      }

      .time {
        color: $color-text-muted;
        font-size: $font-size-xs;
        margin-left: auto;
      }
    }

    .reporter-message {
      margin: 0;
      font-size: $font-size-sm;
      color: $color-text;
      font-style: italic;
    }
  }
}

.report-meta {
  font-size: $font-size-sm;
  a {
    color: $color-accent;
    font-weight: $font-weight-bold;
    &:hover { text-decoration: underline; }
  }
}

.report-actions {
  display: flex;
  gap: $space-3;
  margin-top: $space-2;
  padding-top: $space-4;
  border-top: 1px dashed $color-border-soft;

  .action-btn {
    padding: $space-2 $space-5;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    cursor: pointer;
    border: 1px solid transparent;
    @include hover-transition(all);

    &.dismiss {
      background: transparent;
      color: $color-text-muted;
      border-color: $color-border-soft;
      &:hover:not(:disabled) { background: rgba($color-text-muted, 0.1); }
    }

    &.resolve-hide {
      background: $color-danger;
      color: white;
      &:hover:not(:disabled) { filter: brightness(1.1); }
    }

    &.resolve {
      background: $color-accent;
      color: white;
      &:hover:not(:disabled) { filter: brightness(1.1); }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
