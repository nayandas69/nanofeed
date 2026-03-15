<!--
  app/components/dashboard/RestrictionModal.vue
  NanoFeed — Modal for adding a restriction note when disabling an account
-->
<script setup lang="ts">
import UiButton from '../ui/Button.vue'

const props = defineProps<{
  show: boolean
  username: string
  action: 'restrict' | 'update'
  initialNote?: string
}>()

const emit = defineEmits(['close', 'confirm'])

const note = ref(props.initialNote || '')

watch(() => props.show, (newVal) => {
  if (newVal) {
    note.value = props.initialNote || ''
  }
})

const handleConfirm = () => {
  emit('confirm', note.value)
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="nf-modal-overlay" @click.self="emit('close')">
      <div class="nf-modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ action === 'restrict' ? 'Restrict User' : 'Update Restriction Note' }}
          </h3>
          <button class="close-btn" @click="emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-desc">
            Provide a note for <strong>@{{ username }}</strong>. They will see this message on their feed/settings.
          </p>
          
          <div class="input-group">
            <label for="restriction-note">Note to User:</label>
            <textarea 
              id="restriction-note"
              v-model="note"
              placeholder="e.g., Your account has been restricted due to multiple reports. Please contact the project owner."
              class="custom-textarea custom-scrollbar"
              rows="4"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <UiButton variant="ghost" @click="emit('close')">Cancel</UiButton>
          <UiButton 
            variant="primary" 
            :disabled="!note.trim()"
            @click="handleConfirm"
          >
            {{ action === 'restrict' ? 'Restrict Account' : 'Update Note' }}
          </UiButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.nf-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: $space-4;
}

.nf-modal-content {
  background-color: $color-bg;
  border: 1px solid $color-border-soft;
  border-radius: $radius-xl;
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  box-shadow: $shadow-xl;
  overflow: hidden;
}

.modal-header {
  padding: $space-4;
  border-bottom: 1px solid $color-border-soft;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .modal-title {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
  }

  .close-btn {
    background: none;
    border: none;
    color: $color-text-muted;
    cursor: pointer;
    padding: $space-1;
    border-radius: $radius-full;
    transition: all 0.2s;

    &:hover {
      background-color: $color-surface-2;
      color: $color-text;
    }
  }
}

.modal-body {
  padding: $space-4;

  .modal-desc {
    color: $color-text-muted;
    font-size: $font-size-sm;
    margin-bottom: $space-4;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: $space-2;

    label {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $color-text;
    }

    .custom-textarea {
      background-color: $color-surface;
      border: 1px solid $color-border-soft;
      border-radius: $radius-md;
      padding: $space-3;
      color: $color-text;
      font-family: inherit;
      font-size: $font-size-sm;
      resize: vertical;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: $color-accent;
      }
    }
  }
}

.modal-footer {
  padding: $space-4;
  border-top: 1px solid $color-border-soft;
  display: flex;
  justify-content: flex-end;
  gap: $space-3;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
  
  .nf-modal-content {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  
  .nf-modal-content {
    transform: scale(0.95);
  }
}
</style>
