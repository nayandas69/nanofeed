<!--
  app/components/settings/AvatarUploader.vue
  NanoFeed — GitHub Avatar Sync/Input UI
-->
<script setup lang="ts">
import UiInput from '../ui/Input.vue'
import UiAvatar from '../ui/Avatar.vue'
import { githubAvatarUrl } from '../../utils/constants'

const props = defineProps<{
  modelValue: string
  githubId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const syncWithGithub = () => {
  if (props.githubId) {
    emit('update:modelValue', githubAvatarUrl(props.githubId))
  }
}
</script>

<template>
  <div class="nf-avatar-uploader">
    <div class="preview-section">
      <UiAvatar :src="modelValue" alt="Avatar preview" size="lg" />
      
      <button 
        v-if="githubId" 
        type="button" 
        class="sync-btn"
        @click="syncWithGithub"
        title="Sync with GitHub avatar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        Reset to GitHub
      </button>
    </div>

    <div class="input-section">
      <UiInput
        :modelValue="modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
        label="Avatar URL"
        placeholder="https://..."
      />
      <p class="hint">Upload your image to a service like Imgur or GitHub and paste the image URL here.</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nf-avatar-uploader {
  display: flex;
  gap: $space-4;
  align-items: flex-start;
  
  @include max-sm {
    flex-direction: column;
  }
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  flex-shrink: 0;

  .sync-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-xs;
    color: $color-accent;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.input-section {
  flex: 1;
  width: 100%;
}

.hint {
  font-size: $font-size-xs;
  color: $color-text-muted;
  margin-top: $space-1;
}
</style>
