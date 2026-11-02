<!--
  app/components/ui/Modal.vue
  NanoFeed — Reusable Modal Dialog
-->
<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

// Close on escape key
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  document.addEventListener('keydown', handleKeydown)
  onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="nf-modal-backdrop" @mousedown="close">
        <div class="nf-modal" :class="`max-w-${maxWidth}`" @mousedown.stop>
          <!-- Header -->
          <div class="nf-modal-header">
            <h3 v-if="title" class="title">{{ title }}</h3>
            <!-- Spacer if no title -->
            <div v-else />

            <button class="close-btn" aria-label="Close modal" @click="close">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="nf-modal-body">
            <slot />
          </div>

          <!-- Footer (optional) -->
          <div v-if="$slots.footer" class="nf-modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style src="~/assets/scss/components/ui/Modal.scss" lang="scss" scoped></style>
