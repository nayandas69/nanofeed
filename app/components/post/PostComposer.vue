<!--
  app/components/post/PostComposer.vue
  NanoFeed — Create new post input area
-->
<script setup lang="ts">
import UiButton from '../ui/Button.vue'
import UiAvatar from '../ui/Avatar.vue'
import { validatePostContent } from '../../utils/validation'
import { POST_MAX_LENGTH } from '../../utils/constants'

const props = defineProps<{
  parentId?: string
  placeholder?: string
}>()

const { user, isRestricted } = useNanoAuth()
const { createPost, isCreating, error } = usePosts()
const { refresh: refreshFeed } = useFeed({ autoLoad: false })

const emit = defineEmits(['posted'])

const content = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)

// Auto-resize textarea
const adjustHeight = () => {
  if (!inputRef.value) return
  inputRef.value.style.height = 'auto'
  inputRef.value.style.height = `${inputRef.value.scrollHeight}px`
}

watch(content, () => nextTick(adjustHeight))
onMounted(adjustHeight)

const characterCount = computed(() => content.value.trim().length)
const isOverLimit = computed(() => characterCount.value > POST_MAX_LENGTH)
const canSubmit = computed(
  () => characterCount.value > 0 && !isOverLimit.value && !isCreating.value && !isRestricted.value,
)

const submitError = ref<string | null>(null)

const onSubmit = async () => {
  if (!canSubmit.value) return
  submitError.value = null

  const validationError = validatePostContent(content.value)
  if (validationError) {
    submitError.value = validationError
    return
  }

  const post = await createPost(content.value, props.parentId)

  if (post) {
    // Success: clear input & refresh feed
    content.value = ''
    if (inputRef.value) inputRef.value.style.height = 'auto'
    if (!props.parentId) await refreshFeed()
    emit('posted')
  } else {
    submitError.value = error.value || 'Failed to craft post.'
  }
}
</script>

<template>
  <div class="nf-composer">
    <div class="composer-left">
      <UiAvatar v-if="user" :src="user.avatar" :alt="user.username" size="md" />
    </div>

    <div class="composer-right">
      <!-- Input -->
      <textarea
        ref="inputRef"
        v-model="content"
        :placeholder="placeholder || 'What are you building?'"
        :aria-label="parentId ? 'Write a reply' : 'Write a post'"
        class="composer-input"
        :disabled="isCreating || isRestricted"
        rows="1"
        @keydown.ctrl.enter="onSubmit"
        @keydown.meta.enter="onSubmit"
      />

      <!-- Errors -->
      <div v-if="submitError" class="composer-error">
        {{ submitError }}
      </div>

      <!-- Action Footer -->
      <div class="composer-footer">
        <div
          class="character-count"
          :class="{ 'is-over': isOverLimit, 'is-near': characterCount > POST_MAX_LENGTH - 20 }"
        >
          <span v-if="characterCount > 0"> {{ characterCount }} / {{ POST_MAX_LENGTH }} </span>
        </div>

        <UiButton
          variant="primary"
          size="sm"
          :disabled="!canSubmit"
          :loading="isCreating"
          @click="onSubmit"
        >
          Post
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style src="~/assets/scss/components/post/PostComposer.scss" lang="scss" scoped></style>
