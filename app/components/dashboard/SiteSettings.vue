<script setup lang="ts">
import { errorMessage } from '../../utils/errors'
import UiButton from '../ui/Button.vue'

const { data, error: loadError } = await useFetch('/api/site/settings')
function toLocalDateTime(value: string | Date | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}
const form = reactive({
  verificationRequestsEnabled: data.value?.verificationRequestsEnabled ?? true,
  maintenanceEnabled: data.value?.maintenanceEnabled ?? false,
  maintenanceMessage: data.value?.maintenanceMessage ?? '',
  maintenanceEndsAt: '',
})
// Convert to the owner’s timezone in the browser, not the server’s timezone.
const scheduleReady = ref(false)
const initialLocalEnd = ref('')
onMounted(() => {
  initialLocalEnd.value = toLocalDateTime(data.value?.maintenanceEndsAt)
  form.maintenanceEndsAt = initialLocalEnd.value
  scheduleReady.value = true
})
const saving = ref(false)
const message = ref('')
async function save() {
  saving.value = true
  message.value = ''
  try {
    const scheduleChanged = form.maintenanceEndsAt !== initialLocalEnd.value
    const maintenanceEndsAt = scheduleChanged
      ? form.maintenanceEndsAt
        ? new Date(form.maintenanceEndsAt).toISOString()
        : null
      : undefined
    await $fetch('/api/dashboard/settings', { method: 'PUT', body: { ...form, maintenanceEndsAt } })
    initialLocalEnd.value = form.maintenanceEndsAt
    message.value = 'Settings saved.'
    await refreshNuxtData()
  } catch (error) {
    message.value = errorMessage(error, 'Could not save settings.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form v-if="!loadError" class="site-settings" @submit.prevent="save">
    <h2>Site controls</h2>
    <label
      ><input v-model="form.verificationRequestsEnabled" type="checkbox" /> Accept verification
      requests</label
    >
    <label
      ><input v-model="form.maintenanceEnabled" type="checkbox" /> Enable maintenance mode</label
    >
    <label for="maintenance-message">Maintenance message</label>
    <textarea
      id="maintenance-message"
      v-model="form.maintenanceMessage"
      maxlength="500"
      required
      rows="3"
    />
    <label for="maintenance-ends">Estimated return time (optional)</label>
    <input
      id="maintenance-ends"
      v-model="form.maintenanceEndsAt"
      type="datetime-local"
      :disabled="!scheduleReady"
    />
    <p class="hint">Uses your local time. Maintenance stays on until you turn it off.</p>
    <UiButton type="submit" :loading="saving" :disabled="!scheduleReady">Save settings</UiButton>
    <p v-if="message" role="status">{{ message }}</p>
  </form>
  <p v-else role="alert">Could not load site settings. Refresh and try again.</p>
</template>

<style src="~/assets/scss/components/dashboard/SiteSettings.scss" lang="scss" scoped></style>
