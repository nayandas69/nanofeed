/**
 * server/utils/auth.ts
 * NanoFeed — Shared Auth.js Configuration
 */

import GitHub from '@auth/core/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '../db/prisma'
import { Role } from '@prisma/client'
import type { AuthConfig } from '@auth/core'

export const authOptions: AuthConfig = {
  // Explicitly set the base path for Auth.js internal routes
  basePath: '/api/auth',
  trustHost: true,

  // Secure secret for signing sessions (from env)
  secret: process.env.AUTH_SECRET,

  // Use Prisma adapter to persist sessions, accounts and users in PostgreSQL
  adapter: PrismaAdapter(prisma),

  // OAuth providers
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      // Request user:email scope to get private email addresses
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: { scope: 'read:user user:email' },
      },
      profile(profile: any) {
        return {
          id: profile.id.toString(),
          username: profile.login,
          displayName: profile.name ?? profile.login,
          avatar: profile.avatar_url,
          email: profile.email,
          role: 'USER' as Role,
          verified: false,
        }
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  // Callbacks — customize session/JWT behavior
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider !== 'github' || !profile) return true

      const githubProfile = profile as unknown as {
        id: number
        login: string
        avatar_url: string
        email: string | null
      }

      const githubId = String(githubProfile.id)
      const ownerGithubId = process.env.OWNER_GITHUB_ID

      try {
        const existingUser = await prisma.user.findUnique({
          where: { githubId },
        })

        if (existingUser) {
          await prisma.user.update({
            where: { githubId },
            data: {
              avatar: githubProfile.avatar_url,
              role: githubId === ownerGithubId ? Role.OWNER : existingUser.role,
            },
          })
        } else {
          await prisma.user.create({
            data: {
              githubId,
              email: githubProfile.email ?? `${githubProfile.login}@users.noreply.github.com`,
              username: githubProfile.login,
              displayName: (user.name ?? githubProfile.login),
              avatar: githubProfile.avatar_url,
              role: githubId === ownerGithubId ? Role.OWNER : Role.USER,
              verified: githubId === ownerGithubId,
            },
          })
        }
      } catch (error) {
        console.error('[Auth] Failed to upsert user:', error)
        return false
      }

      return true
    },

    async session({ session }: any) {
      if (!session.user?.email) return session

      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          role: true,
          verified: true,
        },
      })

      if (dbUser) {
        session.user = {
          ...session.user,
          ...dbUser,
        }
      }

      return session
    },
  },
}
