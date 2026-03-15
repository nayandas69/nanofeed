<!--
  app/components/layout/RestrictionBanner.vue
  NanoFeed — Banner showing if an account is restricted (self or public view)
-->
<script setup lang="ts">
import type { PublicUser } from '#shared/types/user'

const props = defineProps<{
  /** Optional user to check. If omitted, checks the current authenticated user. */
  user?: PublicUser | any
}>()

const { isAuthenticated: isSelfAuthenticated, isRestricted: isSelfRestricted, restrictionNote: selfNote } = useNanoAuth()

const isRestrictedTarget = computed(() => {
  if (props.user) return props.user.isRestricted === true
  return isSelfAuthenticated.value && isSelfRestricted.value
})

const note = computed(() => {
  if (props.user) return props.user.restrictionNote
  return selfNote.value
})

const title = computed(() => {
  if (props.user && !isSelfRestricted.value) return 'Account Restricted'
  return 'Your Account is Restricted'
})
</script>

<template>
  <div v-if="isRestrictedTarget" class="nf-restriction-banner">
    <div class="banner-content">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div class="text">
        <span class="title">{{ title }}</span>
        <p class="note">{{ note || 'This account has been restricted. Please contact the project owner for details.' }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nf-restriction-banner {
  background-color: rgba($color-danger, 0.1);
  border-bottom: 1px solid rgba($color-danger, 0.2);
  padding: $space-3 $space-4;
  margin-bottom: $space-1;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.banner-content {
  display: flex;
  gap: $space-3;
  align-items: flex-start;
  max-width: $content-max-width;
  margin: 0 auto;

  .icon {
    color: $color-danger;
    margin-top: 2px;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .title {
      font-weight: $font-weight-bold;
      font-size: $font-size-sm;
      color: $color-danger;
    }

    .note {
      font-size: $font-size-xs;
      color: $color-text;
      margin: 0;
      line-height: 1.4;
    }
  }
}
</style>
