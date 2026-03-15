/**
 * app/middleware/guest.ts
 * NanoFeed — Client-side route guard: Require GUEST (Unauthenticated)
 * 
 * Used for pages like login, so logged in users don't see it.
 */

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, isLoading } = useNanoAuth()

  if (!isLoading.value && isAuthenticated.value) {
    // If they are already logged in, redirect away from auth pages
    return navigateTo('/')
  }
})
