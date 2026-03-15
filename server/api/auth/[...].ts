/**
 * server/api/auth/[...].ts
 * NanoFeed — Auth.js Handler
 */

import { NuxtAuthHandler } from '#auth'
import { authOptions } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  // console.log('[Auth Handler] event.path:', event.path)
  // console.log('[Auth Handler] runtimeConfig.public.authJs:', runtimeConfig.public?.authJs)
  return await NuxtAuthHandler(authOptions, runtimeConfig)(event)
})
