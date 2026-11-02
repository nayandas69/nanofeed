<!--
  app/components/post/PostActions.vue
  NanoFeed — Post Interaction Buttons (Delete, Report)
-->
<script setup lang="ts">
import UiButton from '../ui/Button.vue'
import UiModal from '../ui/Modal.vue'
import ShareModal from './ShareModal.vue'
import type { PostWithAuthor } from '#shared/types/post'
import { REPORT_REASON_LABELS, type ReportReason } from '#shared/constants/reportReasons'

const props = defineProps<{
  post: PostWithAuthor
}>()

const emit = defineEmits<{
  deleted: [postId: string]
}>()

const { user, isAuthenticated, isOwner } = useNanoAuth()
const {
  deletePost,
  isDeleting,
  reactToPost,
  createPost,
  isCreating: isReplying,
  repost,
} = usePosts()
const { submitReport, isSubmitting: isReporting } = useReports()

const isAuthor = computed(() => user.value?.id === props.post.authorId)
const canDelete = computed(() => isAuthor.value || isOwner.value)

// Reaction Logic
const reactionCount = ref(props.post._count?.reactions || 0)
const hasReacted = ref(props.post.hasReacted || false)
const isReacting = ref(false)

// Repost Logic
const repostCount = ref(props.post._count?.reposts || 0)
// The post API does not provide the viewer's repost state until they toggle it.
const hasReposted = ref<boolean | undefined>(undefined)
const isReposting = ref(false)

// Keep local state in sync with props
watch([() => props.post.id, () => user.value?.id], () => {
  hasReacted.value = props.post.hasReacted || false
  reactionCount.value = props.post._count?.reactions || 0
  repostCount.value = props.post._count?.reposts || 0
  hasReposted.value = undefined
})

const handleReact = async () => {
  if (!isAuthenticated.value || isReacting.value) return
  isReacting.value = true
  const res = await reactToPost(props.post.id)
  if (res) {
    hasReacted.value = res.reacted
    reactionCount.value += res.reacted ? 1 : -1
  }
  isReacting.value = false
}

const handleRepost = async () => {
  if (!isAuthenticated.value || isReposting.value) return
  isReposting.value = true
  const postId = props.post.id
  const userId = user.value?.id
  const res = (await repost(postId)) as { reposted: boolean } | null
  if (
    res &&
    typeof res.reposted === 'boolean' &&
    props.post.id === postId &&
    user.value?.id === userId
  ) {
    hasReposted.value = res.reposted
    repostCount.value += res.reposted ? 1 : -1
  }
  isReposting.value = false
}

// Reply Logic
const showReplyModal = ref(false)
const replyContent = ref('')

const handleReply = async () => {
  if (!replyContent.value.trim()) return
  const success = await createPost(replyContent.value, props.post.id)
  if (success) {
    showReplyModal.value = false
    replyContent.value = ''
  }
}

// Delete Dialog
const showDeleteConfirm = ref(false)
const confirmDelete = async () => {
  const success = await deletePost(props.post.id)
  if (success) {
    showDeleteConfirm.value = false
    emit('deleted', props.post.id)
  }
}

// Report Dialog
const showReportModal = ref(false)
const reportReason = ref<ReportReason | ''>('')
const reportNotes = ref('')
const reportSuccess = ref(false)

const handleReport = async () => {
  if (!reportReason.value) return

  const success = await submitReport({
    postId: props.post.id,
    reason: reportReason.value as ReportReason,
    notes: reportNotes.value,
  })

  if (success) {
    reportSuccess.value = true
    setTimeout(() => {
      showReportModal.value = false
      reportSuccess.value = false
      reportReason.value = ''
      reportNotes.value = ''
    }, 2000)
  }
}

const showShareModal = ref(false)
</script>

<template>
  <div v-if="isAuthenticated" class="nf-post-actions" @click.stop>
    <!-- Reply Button -->
    <button
      class="action-btn reply-btn"
      title="Reply"
      aria-label="Reply"
      @click="showReplyModal = true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-message-circle"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
      <span v-if="post._count?.replies" class="count">{{ post._count.replies }}</span>
    </button>

    <!-- Repost Button -->
    <button
      class="action-btn repost-btn"
      :class="{ 'is-active': hasReposted }"
      :disabled="isReposting"
      title="Repost"
      aria-label="Repost"
      :aria-pressed="hasReposted"
      @click="handleRepost"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-repeat"
      >
        <path d="m17 2 4 4-4 4" />
        <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
        <path d="m7 22-4-4 4-4" />
        <path d="M21 13v1a4 4 0 0 1-4 4H3" />
      </svg>
      <span v-if="repostCount" class="count">{{ repostCount }}</span>
    </button>

    <!-- Love Button -->
    <button
      class="action-btn love-btn"
      :class="{ 'is-active': hasReacted }"
      :disabled="isReacting"
      title="Love"
      aria-label="Love"
      :aria-pressed="hasReacted"
      @click="handleReact"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        :fill="hasReacted ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-heart"
      >
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5L12 21l7-7Z"
        />
      </svg>
      <span v-if="reactionCount" class="count">{{ reactionCount }}</span>
    </button>

    <!-- Share Button -->
    <button
      class="action-btn share-btn"
      title="Share"
      aria-label="Share"
      @click="showShareModal = true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-share"
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" x2="12" y1="2" y2="15" />
      </svg>
    </button>

    <!-- Delete Button -->
    <button
      v-if="canDelete"
      class="action-btn delete-btn"
      title="Delete Post"
      aria-label="Delete post"
      @click="showDeleteConfirm = true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-trash-2"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </svg>
    </button>

    <!-- Report Button (Hidden if author) -->
    <button
      v-else
      class="action-btn report-btn"
      title="Report Post"
      aria-label="Report post"
      @click="showReportModal = true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-flag"
      >
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" x2="4" y1="22" y2="15" />
      </svg>
    </button>

    <!-- Reply Modal -->
    <UiModal v-model="showReplyModal" title="Reply to Post" max-width="sm">
      <div class="reply-box">
        <textarea
          v-model="replyContent"
          placeholder="Post your reply"
          class="reply-textarea"
          rows="4"
          autofocus
        />
      </div>
      <template #footer>
        <UiButton variant="ghost" @click="showReplyModal = false">Cancel</UiButton>
        <UiButton
          variant="primary"
          :disabled="!replyContent.trim()"
          :loading="isReplying"
          @click="handleReply"
          >Reply</UiButton
        >
      </template>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal v-model="showDeleteConfirm" title="Delete Post?" max-width="sm">
      <p>This action cannot be undone. Are you sure you want to delete this post?</p>
      <template #footer>
        <UiButton variant="ghost" @click="showDeleteConfirm = false">Cancel</UiButton>
        <UiButton variant="danger" :loading="isDeleting === post.id" @click="confirmDelete"
          >Delete</UiButton
        >
      </template>
    </UiModal>

    <!-- Report Modal -->
    <UiModal v-model="showReportModal" title="Report Post" max-width="sm">
      <div v-if="reportSuccess" class="report-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="success-icon"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p>Report submitted successfully. Thank you for keeping NanoFeed safe.</p>
      </div>

      <div v-else class="report-form">
        <div class="form-group">
          <label>Reason for reporting</label>
          <div class="radio-group">
            <label
              v-for="[key, label] in Object.entries(REPORT_REASON_LABELS)"
              :key="key"
              class="radio-label"
            >
              <input v-model="reportReason" type="radio" :value="key" name="report_reason" />
              <span>{{ label }}</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="report_notes">Additional Details (optional)</label>
          <textarea
            id="report_notes"
            v-model="reportNotes"
            rows="3"
            placeholder="Help us understand the issue..."
            class="comments-input"
          />
        </div>
      </div>

      <template v-if="!reportSuccess" #footer>
        <UiButton variant="ghost" @click="showReportModal = false">Cancel</UiButton>
        <UiButton
          variant="primary"
          :disabled="!reportReason"
          :loading="isReporting"
          @click="handleReport"
          >Submit Report</UiButton
        >
      </template>
    </UiModal>

    <!-- External Share Modal -->
    <ShareModal v-model="showShareModal" :post-id="post.id" :post-text="post.content" />
  </div>
</template>

<style src="~/assets/scss/components/post/PostActions.scss" lang="scss" scoped></style>
