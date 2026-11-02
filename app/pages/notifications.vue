<!--
  app/pages/notifications.vue
  NanoFeed — Notifications Page
-->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import UiAvatar from '../components/ui/Avatar.vue'
import UiButton from '../components/ui/Button.vue'
import { errorMessage } from '../utils/errors'

// Custom date formatter since we cannot install date-fns
const formatDistanceToNow = (date: Date) => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString()
}
const { setReadStatus } = useNotifications()
const router = useRouter()

definePageMeta({ middleware: 'auth' })
type NotificationRow = Awaited<ReturnType<typeof fetchRows>>['notifications'][number]
type Sender = NonNullable<NotificationRow['sender']>
type NotificationGroup = NotificationRow & { isGrouped: boolean; senders: Sender[]; ids: string[] }
const fetchRows = (page: number) =>
  $fetch('/api/notifications', { query: { page, limit: 20 }, timeout: 5000, retry: 0 })
const notifications = ref<NotificationRow[]>([])
const isLoading = ref(true)
const page = ref(1)
const hasMore = ref(false)
const isUpdating = ref(false)
const notificationError = ref<string | null>(null)
const unreadTotal = ref<number | null>(null)

const fetchNotifications = async (loadMore = false) => {
  if (!loadMore) {
    isLoading.value = true
    page.value = 1
  } else {
    page.value++
  }

  try {
    const res = await fetchRows(page.value)

    if (loadMore) {
      notifications.value.push(...res.notifications)
    } else {
      notifications.value = res.notifications
    }

    unreadTotal.value = res.meta.unreadTotal
    hasMore.value = page.value < res.meta.totalPages
  } catch (err) {
    notificationError.value = errorMessage(err, 'Could not reload notifications. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Group REACTION notifications by postId within the current loaded batch
const groupedNotifications = computed(() => {
  const groups: NotificationGroup[] = []
  const reactionGroups = new Map<string, NotificationGroup>()

  for (const notif of notifications.value) {
    if (notif.type === 'REACTION' && notif.postId) {
      if (reactionGroups.has(notif.postId)) {
        const group = reactionGroups.get(notif.postId)!
        if (notif.sender && !group.senders.some((s) => s.id === notif.sender?.id)) {
          group.senders.push(notif.sender)
        }
        // Keep the latest createdAt and unread status
        if (!notif.read) group.read = false
        if (new Date(notif.createdAt) > new Date(group.createdAt)) {
          group.createdAt = notif.createdAt
        }
        group.ids.push(notif.id)
      } else {
        const newGroup = {
          ...notif,
          isGrouped: true,
          senders: notif.sender ? [notif.sender] : [],
          ids: [notif.id],
        }
        reactionGroups.set(notif.postId, newGroup)
        groups.push(newGroup)
      }
    } else {
      groups.push({
        ...notif,
        isGrouped: false,
        senders: notif.sender ? [notif.sender] : [],
        ids: [notif.id],
      })
    }
  }

  // Sort again as grouping might slightly shift things
  return groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

onMounted(() => {
  fetchNotifications()
})

const updateReadStatus = async (ids: string[] | undefined, read: boolean) => {
  if (isUpdating.value) return
  isUpdating.value = true
  notificationError.value = null
  try {
    const count = await setReadStatus(ids, read)
    if (count === null) {
      unreadTotal.value = null
      await fetchNotifications()
      return
    }
    unreadTotal.value = count
    notifications.value.forEach((row) => {
      if (!ids || ids.includes(row.id)) row.read = read
    })
  } catch (err) {
    notificationError.value = errorMessage(err, 'Could not update notifications. Please try again.')
    // Discard optimistic assumptions after a partially completed batch.
    await fetchNotifications()
  } finally {
    isUpdating.value = false
  }
}

const setGroupRead = (notif: NotificationGroup, read: boolean) => updateReadStatus(notif.ids, read)
const handleNotificationClick = async (notif: NotificationGroup) => {
  if (!notif.read) {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([
        setGroupRead(notif, true),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 1000)
        }),
      ])
    } finally {
      clearTimeout(timer)
    }
  }
  if (notif.postId) await router.push(`/post/${notif.postId}`)
}
const toggleReadStatus = async (notif: NotificationGroup, event: Event) => {
  event.stopPropagation()
  await setGroupRead(notif, !notif.read)
}

const getReactionGroupText = (senders: Sender[]) => {
  if (!senders.length) return 'Someone loved your post.'
  if (senders.length === 1) return `@${senders[0]!.username} loved your post.`
  return `@${senders[0]!.username} and ${senders.length - 1} others love your post.`
}

const parseMessage = (message: string) => {
  const parts = message.split(/(@\w+)/g)
  return parts.map((part) => {
    if (part.startsWith('@')) {
      return { text: part, isMention: true, username: part.slice(1) }
    }
    return { text: part, isMention: false }
  })
}

const formatDate = (dateStr: string) => {
  try {
    return formatDistanceToNow(new Date(dateStr))
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1 class="page-title">Notifications</h1>
      <div class="bulk-actions">
        <UiButton
          variant="ghost"
          size="sm"
          :disabled="isUpdating || isLoading || notifications.length === 0 || unreadTotal === null"
          @click="updateReadStatus(undefined, (unreadTotal ?? 0) > 0)"
          >{{ (unreadTotal ?? 0) > 0 ? 'Mark all as read' : 'Mark all as unread' }}</UiButton
        >
      </div>
    </div>

    <p v-if="notificationError" role="alert">{{ notificationError }}</p>

    <div v-if="isLoading && notifications.length === 0" class="loading-state">
      <div class="spinner" />
    </div>

    <div v-else-if="groupedNotifications.length === 0" class="empty-state">
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
        class="empty-icon"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      <h2>No notifications yet</h2>
      <p>When someone interacts with your posts or account, you'll see it here.</p>
    </div>

    <div v-else class="notifications-list">
      <div
        v-for="notif in groupedNotifications"
        :key="notif.isGrouped ? notif.ids[0] : notif.id"
        class="notification-item"
        :class="{ 'is-unread': !notif.read, 'is-clickable': !!notif.postId }"
        @click="handleNotificationClick(notif)"
      >
        <div class="notif-icon-col">
          <!-- Type matching Icons -->
          <svg
            v-if="notif.type === 'REACTION'"
            class="icon-reaction"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <path
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            />
          </svg>
          <svg
            v-else-if="notif.type === 'REPLY'"
            class="icon-reply"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <svg
            v-else-if="notif.type === 'MENTION'"
            class="icon-mention"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
          </svg>
          <svg
            v-else-if="notif.type === 'ACCOUNT_STATUS'"
            class="icon-system"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <svg
            v-else-if="notif.type === 'VERIFICATION_UPDATE'"
            class="icon-verified"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <div v-else class="icon-fallback" />
        </div>

        <div class="notif-content-col">
          <div class="meta-row">
            <!-- Avatars -->
            <div v-if="notif.isGrouped" class="avatars">
              <UiAvatar
                v-for="s in notif.senders.slice(0, 3)"
                :key="s.id"
                :src="s.avatar"
                :alt="s.username"
                size="sm"
                class="stack-avatar"
              />
              <span v-if="notif.senders.length > 3" class="avatar-more"
                >+{{ notif.senders.length - 3 }}</span
              >
            </div>
            <UiAvatar
              v-else-if="notif.sender"
              :src="notif.sender.avatar"
              :alt="notif.sender.username"
              size="sm"
            />

            <span class="time">{{ formatDate(notif.createdAt) }}</span>

            <!-- Actions (mark unread) -->
            <button
              class="action-btn"
              :disabled="isUpdating"
              :title="notif.read ? 'Mark as unread' : 'Mark as read'"
              :aria-label="notif.read ? 'Mark as unread' : 'Mark as read'"
              @click="(e) => toggleReadStatus(notif, e)"
            >
              <span class="dot" :class="{ 'is-unread': !notif.read }" />
            </button>
          </div>

          <div class="text-content">
            <template v-if="notif.type === 'REACTION' && notif.isGrouped">
              <span class="message fw-bold">{{ getReactionGroupText(notif.senders) }}</span>
            </template>
            <template v-else>
              <span class="message">
                <template v-for="(part, idx) in parseMessage(notif.message)" :key="idx">
                  <NuxtLink
                    v-if="part.isMention"
                    :to="`/profile/${part.username}`"
                    class="mention-link"
                    @click.stop
                    >{{ part.text }}</NuxtLink
                  >
                  <template v-else>{{ part.text }}</template>
                </template>
              </span>
            </template>
          </div>

          <div v-if="notif.post?.content" class="post-preview">
            {{ notif.post.content }}
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <UiButton
          :loading="isLoading"
          variant="secondary"
          block
          @click="() => fetchNotifications(true)"
        >
          Show more
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style src="~/assets/scss/pages/notifications.scss" lang="scss" scoped></style>
