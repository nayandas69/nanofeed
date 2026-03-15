/**
 * app/composables/useUser.ts
 * NanoFeed — Current User Data Composable
 *
 * Fetches the full current user profile from /api/users/me
 * and provides update functionality via /api/users/update.
 */

import type { UpdateUserInput } from '#shared/types/user'

export const useUser = () => {
  const { data, status, refresh, error } = useFetch('/api/users/me', {
    // Only fetch when window is focused & on mount
    watch: false,
  })

  const user = computed(() => (data.value as { data?: unknown })?.data ?? null)
  const isLoading = computed(() => status.value === 'pending')

  /**
   * Update the current user's profile.
   * Refreshes the user data after a successful update.
   */
  const updateProfile = async (input: UpdateUserInput): Promise<void> => {
    await $fetch('/api/users/update', {
      method: 'PATCH',
      body: input,
    })
    // Refresh local data after update
    await refresh()
  }

  return {
    user,
    isLoading,
    error,
    refresh,
    updateProfile,
  }
}
