<!--
  app/components/ui/Badge.vue
  NanoFeed — Status / Verification Badge
-->
<script setup lang="ts">
interface Props {
  variant?: 'verified' | 'owner' | 'contributor' | 'default' | 'success' | 'warning' | 'danger'
  text?: string
  iconOnly?: boolean
  flipOnInteraction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  text: '',
  iconOnly: false,
  flipOnInteraction: false,
})
const label = computed(
  () =>
    props.text ||
    (props.variant === 'owner'
      ? 'Project Owner'
      : props.variant === 'verified'
        ? 'Verified Developer'
        : props.variant === 'contributor'
          ? 'Verified Contributor'
          : ''),
)
const tooltipOpen = ref(false)
const hasTooltip = computed(() => ['verified', 'owner', 'contributor'].includes(props.variant))
let flipAnimation: Animation | undefined
function flipIcon(event: Event) {
  if (!props.flipOnInteraction || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return
  const badge = event.currentTarget
  if (!(badge instanceof HTMLElement)) return
  const icon = badge.querySelector('svg')
  if (!icon || typeof icon.animate !== 'function') return
  flipAnimation?.cancel()
  flipAnimation = icon.animate(
    [
      { transform: 'perspective(240px) rotateY(0deg) scale(1)' },
      { transform: 'perspective(240px) rotateY(180deg) scale(1.12)' },
      { transform: 'perspective(240px) rotateY(360deg) scale(1)' },
    ],
    { duration: 550, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  )
}
onBeforeUnmount(() => flipAnimation?.cancel())
function toggleTooltip(event: Event) {
  if (!hasTooltip.value) return
  event.preventDefault()
  event.stopPropagation()
  flipIcon(event)
  tooltipOpen.value = !tooltipOpen.value
}
</script>

<template>
  <span
    class="nf-badge"
    :class="[`variant-${variant}`, { 'icon-only': iconOnly, 'tooltip-open': tooltipOpen }]"
    :title="label"
    :aria-label="label || undefined"
    :tabindex="hasTooltip ? 0 : undefined"
    :role="hasTooltip ? 'button' : undefined"
    :aria-expanded="hasTooltip ? tooltipOpen : undefined"
    @mouseenter="flipIcon"
    @click="toggleTooltip"
    @keydown.enter="toggleTooltip"
    @keydown.space="toggleTooltip"
    @keydown.esc="tooltipOpen = false"
    @blur="tooltipOpen = false"
  >
    <!-- Verified Checkmark -->
    <svg
      v-if="variant === 'verified'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="M12 1.8 14.6 3l2.8-.1 1.2 2.5 2.4 1.5-.3 2.8 1.3 2.3-1.3 2.3.3 2.8-2.4 1.5-1.2 2.5-2.8-.1L12 22.2l-2.6-1.2-2.8.1-1.2-2.5-2.4-1.5.3-2.8L2 12l1.3-2.3L3 6.9l2.4-1.5 1.2-2.5 2.8.1L12 1.8Zm-1.1 13.8 5.9-6-1.4-1.4-4.5 4.5-2.3-2.3-1.4 1.4 3.7 3.8Z"
      />
    </svg>

    <svg
      v-else-if="variant === 'contributor'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" />
    </svg>

    <!-- Owner Crown -->
    <svg
      v-else-if="variant === 'owner'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="M2 6.5a1.5 1.5 0 1 1 2.7.9l3.1 2.2 2.8-4.4a1.5 1.5 0 1 1 2.8 0l2.8 4.4 3.1-2.2a1.5 1.5 0 1 1 1.8.9L19 17H5L2.9 8.3A1.5 1.5 0 0 1 2 6.5ZM5 19h14v2H5z"
      />
    </svg>

    <span v-if="!iconOnly && text" class="text">{{ text }}</span>
    <span v-if="hasTooltip && label" class="badge-tooltip" aria-hidden="true">{{ label }}</span>
  </span>
</template>

<style src="~/assets/scss/components/ui/Badge.scss" lang="scss" scoped></style>
