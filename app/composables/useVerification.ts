/**
 * app/composables/useVerification.ts
 * NanoFeed — Verification Request Composable
 */

import type { CreateVerificationInput } from '#shared/types/verification'

export const useVerification = () => {
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  // Fetch current verification status
  const { data: statusData, refresh: refreshStatus } = useFetch('/api/verification/status')

  const verificationStatus = computed(() => (statusData.value as { data?: unknown })?.data ?? null)

  const submitRequest = async (input: CreateVerificationInput): Promise<boolean> => {
    isSubmitting.value = true
    error.value = null

    try {
      await $fetch('/api/verification/request', {
        method: 'POST',
        body: input,
      })
      await refreshStatus()
      return true
    } catch (err: unknown) {
      error.value =
        (err as { data?: { error?: string } })?.data?.error ??
        'Failed to submit verification request'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    verificationStatus,
    isSubmitting,
    error,
    submitRequest,
    refreshStatus,
  }
}
