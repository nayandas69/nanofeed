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

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      note.value = props.initialNote || ''
    }
  },
)

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
            <svg
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-desc">
            Provide a note for <strong>@{{ username }}</strong
            >. They will see this message on their feed/settings.
          </p>

          <div class="input-group">
            <label for="restriction-note">Note to User:</label>
            <textarea
              id="restriction-note"
              v-model="note"
              placeholder="e.g., Your account has been restricted due to multiple reports. Please contact the project owner."
              class="custom-textarea custom-scrollbar"
              rows="4"
            />
          </div>
        </div>

        <div class="modal-footer">
          <UiButton variant="ghost" @click="emit('close')">Cancel</UiButton>
          <UiButton variant="primary" :disabled="!note.trim()" @click="handleConfirm">
            {{ action === 'restrict' ? 'Restrict Account' : 'Update Note' }}
          </UiButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style src="~/assets/scss/components/dashboard/RestrictionModal.scss" lang="scss" scoped></style>
