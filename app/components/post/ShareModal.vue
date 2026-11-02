<!--
  app/components/post/ShareModal.vue
  The share modal with social links and copy-to-clipboard.
-->
<script setup lang="ts">
import UiModal from '../ui/Modal.vue'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  modelValue: boolean
  postId: string
  postText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { copy, copied } = useClipboard()

const postUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/post/${props.postId}`
})

const shareText = computed(() => {
  const text = props.postText
    ? `${props.postText.substring(0, 100)}...`
    : 'Check out this post on NanoFeed!'
  return encodeURIComponent(text)
})

const handleCopy = () => {
  copy(postUrl.value)
}

// Social Share links
const socialLinks = computed(() => [
  {
    name: 'X',
    icon: 'x',
    url: `https://x.com/intent/tweet?text=${shareText.value}&url=${encodeURIComponent(postUrl.value)}`,
    color: '#000000',
  },
  {
    name: 'Facebook',
    icon: 'facebook',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl.value)}`,
    color: '#1877F2',
  },
  {
    name: 'WhatsApp',
    icon: 'whatsapp',
    url: `https://wa.me/?text=${shareText.value}%20${encodeURIComponent(postUrl.value)}`,
    color: '#25D366',
  },
  {
    name: 'Discord',
    icon: 'discord',
    url: `https://discord.com/channels/@me`,
    color: '#5865F2',
    note: 'Open Discord to share',
  },
])

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    title="Share Post"
    max-width="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="share-options">
      <!-- Copy Link Section -->
      <div class="copy-section">
        <div class="url-display">
          <input type="text" readonly :value="postUrl" class="url-input" />
          <button class="copy-btn" :class="{ 'is-copied': copied }" @click="handleCopy">
            <template v-if="copied">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Copied</span>
            </template>
            <template v-else>
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
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span>Copy link</span>
            </template>
          </button>
        </div>
      </div>

      <div class="divider">
        <span>or share via</span>
      </div>

      <!-- Social Grid -->
      <div class="social-grid">
        <a
          v-for="platform in socialLinks"
          :key="platform.name"
          :href="platform.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-item"
          @click="close"
        >
          <div class="social-icon" :style="{ backgroundColor: platform.color }">
            <!-- X Icon -->
            <svg
              v-if="platform.icon === 'x'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path
                d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z"
              />
            </svg>

            <!-- Facebook Icon -->
            <svg
              v-if="platform.icon === 'facebook'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>

            <!-- WhatsApp Icon -->
            <svg
              v-if="platform.icon === 'whatsapp'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"
              />
            </svg>

            <!-- Discord Icon -->
            <svg
              v-if="platform.icon === 'discord'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path
                d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"
              />
            </svg>
          </div>
          <span class="platform-name">{{ platform.name }}</span>
          <span v-if="platform.note" class="platform-note">{{ platform.note }}</span>
        </a>
      </div>
    </div>
  </UiModal>
</template>

<style src="~/assets/scss/components/post/ShareModal.scss" lang="scss" scoped></style>
