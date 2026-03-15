/**
 * app/composables/useCompose.ts
 * NanoFeed — Global composition state
 */
export const useCompose = () => {
  const isComposerOpen = useState<boolean>('composer-modal-open', () => false)

  const openComposer = () => {
    isComposerOpen.value = true
  }

  const closeComposer = () => {
    isComposerOpen.value = false
  }

  const toggleComposer = () => {
    isComposerOpen.value = !isComposerOpen.value
  }

  return {
    isComposerOpen,
    openComposer,
    closeComposer,
    toggleComposer
  }
}
