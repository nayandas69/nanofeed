/**
 * app/plugins/auth.ts
 * NanoFeed — Auth Session Hydration
 * 
 * Ensures the session is fetched/initialized on app load.
 */

export default defineNuxtPlugin(async (nuxtApp) => {
  // @auth/nuxt handles session fetching automatically if configured to, 
  // but it's good practice to ensure everything is mounted and available
  // implicitly via the module. 
  
  // E.g. If you needed to do something globally with the user on load:
  // const { user } = useNanoAuth()
  // if (user.value) { ... }
})
