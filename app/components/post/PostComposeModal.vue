<!--
  app/components/post/PostComposeModal.vue
  NanoFeed — Global Post Creation Modal
-->
<script setup lang="ts">
import UiModal from '../ui/Modal.vue'
import PostComposer from './PostComposer.vue'

const { isComposerOpen, closeComposer } = useCompose()

// Close modal when a post is successfully created
// The PostComposer emits nothing right now, so we might need to modify it
// or just rely on the user closing it. But auto-closing is better.
</script>

<template>
  <UiModal 
    v-model="isComposerOpen" 
    title="Create Post" 
    @close="closeComposer"
  >
    <div class="modal-composer-wrapper">
      <PostComposer @posted="closeComposer" />
    </div>
  </UiModal>
</template>

<style lang="scss" scoped>
.modal-composer-wrapper {
  padding: $space-2 0;
}
</style>
