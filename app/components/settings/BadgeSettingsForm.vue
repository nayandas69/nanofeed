<script setup lang="ts">
import { badgeLabels, orderedBadges, type BadgeKind } from '#shared/utils/badges'
import VerificationBadge from '../profile/VerificationBadge.vue'
import UiButton from '../ui/Button.vue'

const { user, refresh, ready } = useUser()
await ready
const order = ref<BadgeKind[]>([])
const saving = ref(false)
const message = ref('')
const error = ref('')
watch(
  user,
  (value) => {
    order.value = value ? orderedBadges(value) : []
  },
  { immediate: true },
)
const move = (index: number, offset: number) => {
  const next = [...order.value]
  const [badge] = next.splice(index, 1)
  if (badge) next.splice(index + offset, 0, badge)
  order.value = next
  message.value = ''
}
const save = async () => {
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    await $fetch('/api/users/badge-order', { method: 'PATCH', body: { badgeOrder: order.value } })
    await refresh()
    // Refresh any mounted author/profile data after changing the public preference.
    clearNuxtState((key) => key.startsWith('feed-'))
    await refreshNuxtData()
    message.value = 'Badge order saved.'
  } catch {
    error.value = 'Could not save badge order. Please refresh and try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="badge-settings" aria-labelledby="badge-settings-title">
    <h2 id="badge-settings-title">Badge display</h2>
    <p>
      Your first badge appears on posts and follower lists. Your profile shows all earned badges in
      this order.
    </p>
    <p v-if="!order.length">Your earned badges will appear here.</p>
    <form v-else @submit.prevent="save">
      <ol aria-label="Badge order">
        <li v-for="(badge, index) in order" :key="badge">
          <VerificationBadge
            :is-owner="badge === 'owner'"
            :is-verified="badge === 'verified'"
            :is-contributor="badge === 'contributor'"
          />
          <span>{{ badgeLabels[badge] }}</span>
          <button
            type="button"
            :disabled="saving || index === 0"
            :aria-label="`Move ${badgeLabels[badge]} up`"
            @click="move(index, -1)"
          >
            ↑
          </button>
          <button
            type="button"
            :disabled="saving || index === order.length - 1"
            :aria-label="`Move ${badgeLabels[badge]} down`"
            @click="move(index, 1)"
          >
            ↓
          </button>
        </li>
      </ol>
      <UiButton type="submit" :loading="saving" :disabled="saving">Save badge order</UiButton>
    </form>
    <p v-if="message" role="status">{{ message }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
  </section>
</template>

<style src="~/assets/scss/components/settings/BadgeSettingsForm.scss" lang="scss" scoped></style>
