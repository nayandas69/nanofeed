/**
 * app/composables/useReports.ts
 * NanoFeed — Reports Composable
 */

import type { CreateReportInput } from '#shared/types/report'

export const useReports = () => {
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  const submitReport = async (input: CreateReportInput): Promise<boolean> => {
    isSubmitting.value = true
    error.value = null

    try {
      await $fetch('/api/reports/create', {
        method: 'POST',
        body: input,
      })
      return true
    } catch (err: unknown) {
      error.value =
        (err as { data?: { error?: string } })?.data?.error ??
        'Failed to submit report'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    error,
    submitReport,
  }
}
