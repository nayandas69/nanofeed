<!--
  app/components/dashboard/ReportsList.vue
  NanoFeed — Owner Reports Management
-->
<script setup lang="ts">
import UiBadge from '../ui/Badge.vue'
import UiButton from '../ui/Button.vue'
import { REPORT_REASON_LABELS } from '#shared/constants/reportReasons'

const props = defineProps<{
  searchQuery?: string
}>()

const page = ref(1)
const pageSize = 20
const query = computed(() => props.searchQuery?.trim() || '')
watch(
  query,
  () => {
    page.value = 1
  },
  { flush: 'sync' },
)
const { data, status, error, refresh } = useFetch('/api/dashboard/reports', {
  query: { q: query, page, pageSize },
})

const result = computed(() => data.value?.data ?? null)
const reports = computed(() => result.value?.reports ?? [])
const isLoading = computed(() => status.value === 'pending')
const totalPages = computed(() => Math.max(1, Math.ceil((result.value?.total ?? 0) / pageSize)))
watch(totalPages, (lastPage) => {
  if (page.value > lastPage) page.value = lastPage
})

const isProcessing = ref<string | null>(null)

const resolveReport = async (
  reportId: string | null,
  action: 'RESOLVE' | 'DISMISS',
  hidePost = false,
  postId?: string | null,
) => {
  const targetId = postId || reportId
  if (!targetId) return

  isProcessing.value = targetId
  try {
    await $fetch('/api/dashboard/resolve-report', {
      method: 'POST',
      body: { reportId, postId, action, hidePost },
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
    <div v-if="error" role="alert">
      Could not load reports.
      <UiButton variant="ghost" size="sm" @click="refresh()">Retry</UiButton>
    </div>
    <div v-if="isLoading && reports.length === 0" class="loading-state">
      <div class="spinner" />
    </div>

    <div v-else-if="reports.length === 0 && !error" class="empty-state">
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
        class="lucide lucide-shield-check"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      <p>No active reports to review.</p>
    </div>

    <div v-else class="reports-grid">
      <div
        v-for="report in reports"
        :key="report.id"
        class="report-card"
        :class="{ 'is-grouped': report.type === 'POST' }"
      >
        <!-- Status & Type Header -->
        <div class="report-header">
          <UiBadge
            :variant="report.status === 'OPEN' ? 'warning' : 'default'"
            :text="report.status"
          />
          <span v-if="report.type === 'POST'" class="group-badge">
            {{ report.reports.length }} Reports
          </span>
          <span class="type-label">{{
            report.type === 'POST' ? 'Post Report' : 'User Report'
          }}</span>
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
            <div
              v-for="r in report.type === 'POST' ? report.reports : [report]"
              :key="r.id"
              class="timeline-item"
            >
              <div class="reporter-info">
                <strong>@{{ r.reporter?.username }}</strong>
                <span class="reason-tag">{{ REPORT_REASON_LABELS[r.reason] || r.reason }}</span>
                <span class="time">{{
                  new Date(r.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}</span>
              </div>
              <p v-if="r.notes" class="reporter-message">{{ r.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Reported User Info (Mostly for USER reports) -->
        <div v-if="report.reportedUser && report.type === 'USER'" class="report-meta">
          <div class="reported-user">
            <span class="label">Reported User:</span>
            <NuxtLink :to="`/profile/${report.reportedUser.username}`"
              >@{{ report.reportedUser.username }}</NuxtLink
            >
          </div>
        </div>

        <!-- Actions -->
        <div v-if="report.status === 'OPEN'" class="report-actions">
          <button
            class="action-btn dismiss"
            :disabled="isProcessing === (report.postId || report.id)"
            @click="
              resolveReport(
                report.type === 'POST' ? null : report.id,
                'DISMISS',
                false,
                report.postId,
              )
            "
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
    <nav v-if="totalPages > 1 || page > 1" class="report-pagination" aria-label="Report pages">
      <UiButton variant="secondary" size="sm" :disabled="isLoading || page <= 1" @click="page--"
        >Previous</UiButton
      >
      <span aria-live="polite">Page {{ page }} of {{ totalPages }}</span>
      <UiButton
        variant="secondary"
        size="sm"
        :disabled="isLoading || page >= totalPages"
        @click="page++"
        >Next</UiButton
      >
    </nav>
  </div>
</template>

<style src="~/assets/scss/components/dashboard/ReportsList.scss" lang="scss" scoped></style>
