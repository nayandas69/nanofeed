<!--
  app/components/profile/VerificationBadge.vue
  NanoFeed — Profile specific badge with tooltip
-->
<script setup lang="ts">
import UiBadge from '../ui/Badge.vue'

defineProps<{
  isOwner?: boolean
  isVerified?: boolean
}>()
</script>

<template>
  <div class="nf-verification-badge">
    <UiBadge v-if="isOwner" variant="owner" text="Project Owner" />
    <UiBadge v-else-if="isVerified" variant="verified" text="Verified Developer" />
  </div>
</template>

<style lang="scss" scoped>
.nf-verification-badge {
  display: inline-flex;
}
</style>
