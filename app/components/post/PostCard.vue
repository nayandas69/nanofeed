<!--
  app/components/post/PostCard.vue
  NanoFeed — Single Post Display
-->
<script setup lang="ts">
import UiAvatar from '../ui/Avatar.vue'
import UiBadge from '../ui/Badge.vue'
import PostActions from './PostActions.vue'
import type { PostWithAuthor } from '#shared/types/post'
import { renderContentWithHashtags } from '../../utils/hashtagParser'
import { useTimeAgo } from '@vueuse/core'

const props = defineProps<{
  post: PostWithAuthor
}>()

const emit = defineEmits<{
  'deleted': [postId: string]
}>()

const router = useRouter()

// Format timestamp relatively (e.g., "2m", "1h")
const dateObj = new Date(props.post.createdAt)
const timeAgo = useTimeAgo(dateObj)

// Shorthand for X-style time strings
const shortTime = computed(() => {
  const str = timeAgo.value
  if (str === 'just now') return 'now'
  return str.replace(' seconds ago', 's')
            .replace(' minutes ago', 'm')
            .replace(' hours ago', 'h')
            .replace(' days ago', 'd')
            .replace(' months ago', 'mo')
            .replace(' years ago', 'y')
})

const navigateToPost = () => {
  router.push(`/post/${props.post.id}`)
}

const navigateToProfile = () => {
  router.push(`/profile/${props.post.author.username}`)
}
</script>

<template>
  <article class="nf-post-card" @click="navigateToPost">
    <!-- Left Column: Avatar -->
    <div class="post-left" @click.stop="navigateToProfile">
      <UiAvatar
        :src="post.author.avatar"
        :alt="post.author.username"
        size="md"
        class="author-avatar"
      />
    </div>

    <!-- Right Column: Content -->
    <div class="post-right">
      <!-- Header -->
      <header class="post-header" @click.stop="navigateToProfile">
        <span class="display-name">{{ post.author.displayName }}</span>
        
        <!-- Badges -->
        <UiBadge v-if="post.author.role === 'OWNER'" variant="owner" iconOnly />
        <UiBadge v-else-if="post.author.verified" variant="verified" iconOnly />
        
        <span class="username">@{{ post.author.username }}</span>
        <span class="dot">·</span>
        <time :datetime="dateObj.toISOString()" :title="dateObj.toLocaleString()" class="timestamp">
          {{ shortTime }}
        </time>
      </header>

      <!-- Body / Content -->
      <div 
        class="post-content" 
        v-html="renderContentWithHashtags(post.content)"
      ></div>

      <!-- Footer / Actions -->
      <PostActions :post="post" @deleted="emit('deleted', $event)" />
    </div>
  </article>
</template>

<style lang="scss">
// Note: Not completely scoped here so the v-html .hashtag styles applied from utils work correctly
// if we didn't inject them globally (we did in main.scss, but this ensures safety).
.nf-post-card {
  display: flex;
  gap: $space-3;
  padding: $space-5;
  border: 1px solid rgba($color-border, 0.3);
  background: rgba($color-surface, 0.4);
  backdrop-filter: blur(10px);
  border-radius: $radius-xl;
  cursor: pointer;
  @include hover-transition(all);

  &:hover {
    background-color: rgba($color-surface-2, 0.6);
    border-color: rgba($color-accent, 0.3);
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}

.post-left {
  flex-shrink: 0;

  .author-avatar {
    cursor: pointer;
    @include hover-transition(opacity);
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.post-right {
  flex: 1;
  min-width: 0; // Prevent text blowing out layout
}

.post-header {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  margin-bottom: $space-1;
  cursor: pointer;

  .display-name {
    font-weight: $font-weight-bold;
    color: $color-text;
    @include truncate;
    
    &:hover {
      text-decoration: underline;
    }
  }

  .username, .timestamp, .dot {
    color: $color-text-muted;
    font-size: $font-size-sm;
    @include truncate;
  }
  
  .dot {
    flex-shrink: 0;
  }
  
  .timestamp {
    flex-shrink: 0;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.post-content {
  font-size: $font-size-base;
  line-height: 1.5;
  color: $color-text;
  word-wrap: break-word;
  white-space: pre-wrap; // Preserve newlines from text area
  
  // The .hashtag class is defined globally in main.scss, 
  // but we can ensure it's styled here too
  .hashtag {
    color: $color-accent;
    cursor: pointer;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
