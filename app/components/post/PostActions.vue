<!--
  app/components/post/PostActions.vue
  NanoFeed — Post Interaction Buttons (Delete, Report)
-->
<script setup lang="ts">
import UiButton from '../ui/Button.vue'
import UiModal from '../ui/Modal.vue'
import type { PostWithAuthor } from '#shared/types/post'
import { REPORT_REASONS, REPORT_REASON_LABELS, type ReportReason } from '#shared/constants/reportReasons'

const props = defineProps<{
  post: PostWithAuthor
}>()

const emit = defineEmits<{
  'deleted': [postId: string]
}>()

const { user, isAuthenticated, isOwner } = useNanoAuth()
const { deletePost, isDeleting, reactToPost } = usePosts()
const { submitReport, isSubmitting: isReporting } = useReports()

const isAuthor = computed(() => user.value?.id === props.post.authorId)
const canDelete = computed(() => isAuthor.value || isOwner.value)

// Reaction Logic
const reactionCount = ref(props.post._count?.reactions || 0)
const hasReacted = ref(false) // In a real app, this should come from the server-side post data
const isReacting = ref(false)

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

// Reply Logic
const showReplyModal = ref(false)
const replyContent = ref('')
const { createPost, isCreating: isReplying } = usePosts()

const handleReply = async () => {
  if (!replyContent.value.trim()) return
  const success = await createPost(replyContent.value, props.post.id)
  if (success) {
    showReplyModal.value = false
    replyContent.value = ''
    // Optionally emit or refresh feed
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
    notes: reportNotes.value
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
</script>

<template>
  <div class="nf-post-actions" @click.stop v-if="isAuthenticated">
    <!-- Reply Button -->
    <button
      class="action-btn reply-btn"
      @click="showReplyModal = true"
      title="Reply"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      <span v-if="post._count?.replies" class="count">{{ post._count.replies }}</span>
    </button>

    <!-- Love Button -->
    <button
      class="action-btn love-btn"
      :class="{ 'is-active': hasReacted }"
      @click="handleReact"
      :disabled="isReacting"
      title="Love"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" :fill="hasReacted ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5L12 21l7-7Z"/></svg>
      <span v-if="reactionCount" class="count">{{ reactionCount }}</span>
    </button>

    <!-- Delete Button -->
    <button
      v-if="canDelete"
      class="action-btn delete-btn"
      @click="showDeleteConfirm = true"
      title="Delete Post"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
    </button>

    <!-- Report Button (Hidden if author) -->
    <button
      v-else
      class="action-btn report-btn"
      @click="showReportModal = true"
      title="Report Post"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
    </button>

    <!-- Reply Modal -->
    <UiModal v-model="showReplyModal" title="Reply to Post" maxWidth="sm">
      <div class="reply-box">
        <textarea
          v-model="replyContent"
          placeholder="Post your reply"
          class="reply-textarea"
          rows="4"
          autofocus
        ></textarea>
      </div>
      <template #footer>
        <UiButton variant="ghost" @click="showReplyModal = false">Cancel</UiButton>
        <UiButton variant="primary" :disabled="!replyContent.trim()" :loading="isReplying" @click="handleReply">Reply</UiButton>
      </template>
    </UiModal>

    <!-- Delete Confirmation Modal -->
    <UiModal v-model="showDeleteConfirm" title="Delete Post?" maxWidth="sm">
      <p>This action cannot be undone. Are you sure you want to delete this post?</p>
      <template #footer>
        <UiButton variant="ghost" @click="showDeleteConfirm = false">Cancel</UiButton>
        <UiButton variant="danger" :loading="isDeleting === post.id" @click="confirmDelete">Delete</UiButton>
      </template>
    </UiModal>

    <!-- Report Modal -->
    <UiModal v-model="showReportModal" title="Report Post" maxWidth="sm">
      <div v-if="reportSuccess" class="report-success">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="success-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p>Report submitted successfully. Thank you for keeping NanoFeed safe.</p>
      </div>

      <div v-else class="report-form">
        <div class="form-group">
          <label>Reason for reporting</label>
          <div class="radio-group">
            <label v-for="[key, label] in Object.entries(REPORT_REASON_LABELS)" :key="key" class="radio-label">
              <input type="radio" :value="key" v-model="reportReason" name="report_reason" />
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
          ></textarea>
        </div>
      </div>

      <template #footer v-if="!reportSuccess">
        <UiButton variant="ghost" @click="showReportModal = false">Cancel</UiButton>
        <UiButton variant="primary" :disabled="!reportReason" :loading="isReporting" @click="handleReport">Submit Report</UiButton>
      </template>
    </UiModal>
  </div>
</template>

<style lang="scss" scoped>
.nf-post-actions {
  display: flex;
  align-items: center;
  gap: $space-2;
  margin-top: $space-2;
}

.action-btn {
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: $color-text-muted;
  @include hover-transition(all);

  &.reply-btn:hover {
    color: $color-accent;
    background-color: rgba($color-accent, 0.1);
  }

  &.love-btn {
    &.is-active {
      color: #f91880;
    }
    &:hover {
      color: #f91880;
      background-color: rgba(#f91880, 0.1);
    }
  }

  &.delete-btn:hover {
    color: $color-danger;
    background-color: rgba($color-danger, 0.1);
  }

  &.report-btn:hover {
    color: $color-warning;
    background-color: rgba($color-warning, 0.1);
  }

  .count {
    font-size: $font-size-xs;
    margin-left: 4px;
  }
}

.reply-box {
  .reply-textarea {
    width: 100%;
    background: transparent;
    border: none;
    color: $color-text;
    font-size: $font-size-lg;
    font-family: inherit;
    resize: none;
    padding: $space-2;
    
    &:focus {
      outline: none;
    }
  }
}

// Report Modal Styles
.report-success {
  text-align: center;
  padding: $space-4 0;

  .success-icon {
    color: $color-success;
    margin-bottom: $space-3;
  }
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: $space-2;

    label {
      font-weight: $font-weight-medium;
      color: $color-text;
    }
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    background: $color-surface-2;
    padding: $space-3;
    border-radius: $radius-md;
    border: 1px solid $color-border-soft;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: $space-2;
    cursor: pointer;
    font-weight: normal;

    input[type="radio"] {
      accent-color: $color-accent;
      width: 16px;
      height: 16px;
    }
  }

  .comments-input {
    width: 100%;
    padding: $space-3;
    background-color: $color-surface-2;
    border: 1px solid $color-border-soft;
    border-radius: $radius-md;
    color: $color-text;
    font-family: inherit;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: $color-accent;
    }
  }
}
</style>
