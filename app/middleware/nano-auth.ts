/**
 * app/middleware/auth.ts
 * NanoFeed — Client-side route guard: Require Authentication
 */

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, isLoading } = useNanoAuth()

  // Nuxt handles hydration carefully, but evaluating immediately works well with useAuth
  if (!isLoading.value && !isAuthenticated.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirectTo: to.fullPath }
    })
  }
})
