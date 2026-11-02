<!--
  app/components/post/PostCard.vue
  NanoFeed — Single Post Display
-->

<template>
  <article
    class="nf-post-card"
    :class="{
      'is-inside-repost': isInsideRepost,
      'has-parent': post.parent && !isInsideRepost,
    }"
    @click="navigateToPost"
  >
    <!-- Thread Connection (Inside a single card for context) -->
    <div v-if="post.parent && !isInsideRepost" class="threaded-parent">
      <div class="post-layout">
        <div class="post-left" @click.stop="router.push(`/profile/${post.parent.author.username}`)">
          <UiAvatar
            :src="post.parent.author.avatar"
            :alt="post.parent.author.username"
            size="md"
            class="author-avatar"
          />
          <div class="thread-line" />
        </div>
        <div class="post-right" @click.stop="router.push(`/post/${post.parent.id}`)">
          <header class="post-header">
            <span class="display-name">{{
              isUnavailable(post.parent?.author) ? 'User' : post.parent?.author.displayName
            }}</span>

            <!-- Badges for Parent -->
            <template v-if="!isUnavailable(post.parent?.author)">
              <VerificationBadge
                v-if="post.parent?.author"
                :is-owner="post.parent.author.role === 'OWNER'"
                :is-verified="post.parent.author.verified"
                :is-contributor="!!post.parent.author.contributorCommit"
                :badge-order="post.parent.author.badgeOrder"
              />
            </template>

            <span class="username"
              >@{{
                isUnavailable(post.parent?.author) ? 'user' : post.parent?.author.username
              }}</span
            >
            <span class="dot">·</span>
            <span class="timestamp">{{
              useTimeAgo(new Date(post.parent?.createdAt || Date.now())).value
            }}</span>
          </header>
          <div class="post-content">
            <span v-if="isUnavailable(post.parent?.author)">This post is no longer available</span>
            <PostContent v-else :content="post.parent?.content || ''" />
          </div>
        </div>
      </div>
    </div>

    <div class="post-layout main-post">
      <!-- Left Column: Avatar & Thread Line -->
      <div class="post-left" @click.stop="navigateToProfile">
        <!-- Offset for Repost Header -->
        <div v-if="post.repostOfId && !isInsideRepost" class="repost-spacer" />

        <UiAvatar
          :src="isUnavailable(post.author) ? '' : post.author.avatar"
          :alt="isUnavailable(post.author) ? 'User' : post.author.username"
          size="md"
          class="author-avatar"
        />
        <!-- Thread Line (Vertical connector for conversation) -->
        <div v-if="post.parentId && !isInsideRepost" class="thread-line top" />
      </div>

      <!-- Right Column: Content -->
      <div class="post-right">
        <!-- Repost Header -->
        <div v-if="post.repostOfId && !isInsideRepost" class="repost-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="repost-icon"
          >
            <path d="m17 2 4 4-4 4" />
            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
            <path d="m7 22-4-4 4-4" />
            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
          </svg>
          <span>{{ isSelf ? 'You' : post.author.displayName }} reposted</span>
        </div>

        <!-- Header -->
        <header class="post-header" @click.stop="navigateToProfile">
          <span class="display-name">{{
            isUnavailable(post.author) ? 'User' : post.author.displayName
          }}</span>

          <!-- Badges -->
          <template v-if="!isUnavailable(post.author)">
            <VerificationBadge
              :is-owner="post.author.role === 'OWNER'"
              :is-verified="post.author.verified"
              :is-contributor="!!post.author.contributorCommit"
              :badge-order="post.author.badgeOrder"
            />
          </template>

          <span class="username"
            >@{{ isUnavailable(post.author) ? 'user' : post.author.username }}</span
          >
          <span class="dot">·</span>
          <time
            :datetime="dateObj.toISOString()"
            :title="dateObj.toLocaleString()"
            class="timestamp"
          >
            {{ shortTime }}
          </time>
        </header>

        <!-- Reply Indicator -->
        <div v-if="post.parentId && !isInsideRepost" class="reply-indicator">
          <span>Replying to </span>
          <span
            class="reply-to"
            @click.stop="
              !isUnavailable(post.parent?.author) &&
              router.push(`/profile/${post.parent?.author.username || ''}`)
            "
          >
            @{{ isUnavailable(post.parent?.author) ? 'user' : post.parent?.author.username || '' }}
          </span>
        </div>

        <!-- Body / Content -->
        <div v-if="!post.repostOf" class="post-content">
          <template v-if="isUnavailable(post.author)">
            <span class="unavailable-text">This post is no longer available</span>
          </template>
          <template v-else>
            <PostContent :content="post.content" />
          </template>
        </div>

        <!-- Reposted Content -->
        <div v-if="post.repostOf" class="reposted-content-wrapper">
          <PostCard :post="post.repostOf" :is-inside-repost="true" />
        </div>

        <!-- Footer / Actions -->
        <PostActions v-if="!isInsideRepost" :post="post" @deleted="emit('deleted', $event)" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import UiAvatar from '../ui/Avatar.vue'
import VerificationBadge from '../profile/VerificationBadge.vue'
import PostActions from './PostActions.vue'
import type { PostWithAuthor } from '#shared/types/post'
import PostContent from './PostContent.vue'
import { useTimeAgo } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    post: PostWithAuthor
    isInsideRepost?: boolean
  }>(),
  {
    isInsideRepost: false,
  },
)

const emit = defineEmits<{
  deleted: [postId: string]
}>()

const router = useRouter()
const { user: currentUser } = useNanoAuth()
const isSelf = computed(() => currentUser.value?.id === props.post.authorId)

// Format timestamp relatively (e.g., "2m", "1h")
const dateObj = new Date(props.post.createdAt)
const timeAgo = useTimeAgo(dateObj)

// Shorthand for X-style time strings
const shortTime = computed(() => {
  const str = timeAgo.value
  if (str === 'just now') return 'now'
  return str
    .replace(' seconds ago', 's')
    .replace(' minutes ago', 'm')
    .replace(' hours ago', 'h')
    .replace(' days ago', 'd')
    .replace(' months ago', 'mo')
    .replace(' years ago', 'y')
})

const isUnavailable = (user?: {
  isActive?: boolean
  deletionRequestedAt?: Date | string | null
}) => {
  if (!user) return false
  // Use explicit false/null checks to handle cases where the API didn't return these fields (undefined)
  return (
    user.isActive === false ||
    (user.deletionRequestedAt !== undefined && user.deletionRequestedAt !== null)
  )
}

const navigateToPost = () => {
  if (props.isInsideRepost || isUnavailable(props.post.author)) return
  router.push(`/post/${props.post.id}`)
}

const navigateToProfile = () => {
  if (isUnavailable(props.post.author)) return
  router.push(`/profile/${props.post.author.username}`)
}
</script>

<style src="~/assets/scss/components/post/PostCard.scss" lang="scss"></style>
