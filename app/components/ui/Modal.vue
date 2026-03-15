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
  'close': []
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
        <div
          class="nf-modal"
          :class="`max-w-${maxWidth}`"
          @mousedown.stop
        >
          <!-- Header -->
          <div class="nf-modal-header">
            <h3 v-if="title" class="title">{{ title }}</h3>
            <!-- Spacer if no title -->
            <div v-else></div>

            <button class="close-btn" @click="close" aria-label="Close modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
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

<style lang="scss" scoped>
.nf-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  @include flex-center;
  padding: $space-4;
}

.nf-modal {
  @include surface(2);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: $shadow-lg;

  &.max-w-sm { max-width: 400px; }
  &.max-w-md { max-width: 500px; }
  &.max-w-lg { max-width: 700px; }
}

.nf-modal-header {
  @include flex-between;
  padding: $space-4;
  border-bottom: 1px solid $color-border-soft;

  .title {
    margin: 0;
    font-size: $font-size-lg;
  }

  .close-btn {
    @include flex-center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: $color-text-muted;
    @include hover-transition(background-color);

    &:hover {
      background-color: $color-surface-3;
      color: $color-text;
    }
  }
}

.nf-modal-body {
  padding: $space-4;
  overflow-y: auto;
  @include custom-scrollbar;
}

.nf-modal-footer {
  padding: $space-4;
  border-top: 1px solid $color-border-soft;
  display: flex;
  justify-content: flex-end;
  gap: $space-3;
}
</style>
