<!--
  app/components/profile/VerificationBadge.vue
  NanoFeed — Profile specific badge with tooltip
-->
<script setup lang="ts">
import UiBadge from '../ui/Badge.vue'

import { badgeLabels, orderedBadges } from '#shared/utils/badges'

const props = defineProps<{
  isOwner?: boolean
  isVerified?: boolean
  isContributor?: boolean
  badgeOrder?: readonly string[] | null
  all?: boolean
  flipOnInteraction?: boolean
}>()
const badges = computed(() => {
  const earned = orderedBadges({
    role: props.isOwner ? 'OWNER' : 'USER',
    verified: props.isVerified,
    contributorCommit: props.isContributor ? 'claimed' : null,
    badgeOrder: props.badgeOrder,
  })
  return props.all ? earned : earned.slice(0, 1)
})
</script>

<template>
  <div class="nf-verification-badge">
    <UiBadge
      v-for="badge in badges"
      :key="badge"
      :variant="badge"
      :text="badgeLabels[badge]"
      :flip-on-interaction="flipOnInteraction"
      icon-only
    />
  </div>
</template>

<style lang="scss" scoped>
.nf-verification-badge {
  display: inline-flex;
  gap: 4px;
}
</style>
