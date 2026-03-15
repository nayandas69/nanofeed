/**
 * server/db/prisma.ts
 * NanoFeed — Prisma Client Singleton
 *
 * In serverless environments (Vercel), each function invocation may create
 * a new module instance. This pattern ensures we reuse a single PrismaClient
 * to avoid exhausting the database connection pool.
 */

import pkg from '@prisma/client'
import type { PrismaClient } from '@prisma/client'
const { PrismaClient: PrismaClientConstructor } = pkg

// Declare a global variable to hold the Prisma instance in development
// This prevents creating multiple instances during hot-reload
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

/**
 * Get a singleton instance of PrismaClient.
 * - In production: creates a new instance on each cold start (expected for serverless)
 * - In development: reuses the global instance across hot-reloads
 */
const prisma =
  (global.__prisma as PrismaClient) ??
  new PrismaClientConstructor({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}

export default prisma
