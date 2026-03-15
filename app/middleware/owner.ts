/**
 * app/middleware/owner.ts
 * NanoFeed — Client-side route guard: Require Owner Role
 */

export default defineNuxtRouteMiddleware((to) => {
  const { isOwner, isLoading } = useNanoAuth()

  if (!isLoading.value && !isOwner.value) {
    // If they aren't owner, bump them back to home
    return navigateTo('/')
  }
})
