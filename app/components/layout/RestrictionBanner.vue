<!--
  app/components/layout/RestrictionBanner.vue
  NanoFeed — Banner showing if an account is restricted (self or public view)
-->
<script setup lang="ts">
import type { PublicUser } from '#shared/types/user'

const props = defineProps<{
  /** Optional user to check. If omitted, checks the current authenticated user. */
  user?: PublicUser | null
}>()

const {
  isAuthenticated: isSelfAuthenticated,
  isRestricted: isSelfRestricted,
  restrictionNote: selfNote,
} = useNanoAuth()

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
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div class="text">
        <span class="title">{{ title }}</span>
        <p class="note">
          {{
            note ||
            'This account has been restricted. Please contact the project owner for details.'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<style src="~/assets/scss/components/layout/RestrictionBanner.scss" lang="scss" scoped></style>
