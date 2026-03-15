/**
 * app/composables/useAuth.ts
 * NanoFeed — Authentication Composable
 *
 * Wraps Auth.js useAuth() to provide a clean, typed interface
 * for authentication state and actions throughout the app.
 */

export const useNanoAuth = () => {
  // useAuth() is provided by @hebilicious/authjs-nuxt module
  const { session, status, signIn, signOut } = useAuth()

  /** Whether the user is currently authenticated */
  const isAuthenticated = computed(() => status.value === 'authenticated')

  /** Whether the auth state is still loading */
  const isLoading = computed(() => status.value === 'loading')

  /** The current user (from session) or null */
  const user = computed(() => session.value?.user ?? null)

  /** Whether the current user is the project owner */
  const isOwner = computed(() => user.value?.role === 'OWNER')

  /** Whether the current user is verified */
  const isVerified = computed(() => user.value?.verified === true)

  /** Whether the current user is restricted */
  const isRestricted = computed(() => user.value?.isRestricted === true)

  /** The restriction note for the current user */
  const restrictionNote = computed(() => user.value?.restrictionNote ?? null)

  /**
   * Sign in with GitHub OAuth.
   * Redirects to GitHub authorization page.
   */
  const loginWithGithub = () =>
    signIn('github', { callbackUrl: '/' })

  /**
   * Sign out and redirect to the login page.
   */
  const logout = () =>
    signOut({ callbackUrl: '/auth/login' })

  return {
    session,
    status,
    user,
    isAuthenticated,
    isLoading,
    isOwner,
    isVerified,
    isRestricted,
    restrictionNote,
    loginWithGithub,
    logout,
  }
}
