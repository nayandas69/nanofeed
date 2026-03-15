/**
 * prisma/seed.ts
 * NanoFeed — Database Seed Script
 *
 * Seeds the owner account using environment variables.
 * The owner is automatically assigned the OWNER role.
 *
 * Run: npm run db:seed
 */

import pkg from '@prisma/client'
import type { Role as RoleType } from '@prisma/client'
const { PrismaClient, Role } = pkg as unknown as { PrismaClient: any; Role: typeof RoleType }

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Starting NanoFeed database seed...')

  // Validate required environment variables
  const ownerGithubId = process.env.OWNER_GITHUB_ID
  const ownerUsername = process.env.OWNER_GITHUB_USERNAME

  if (!ownerGithubId || !ownerUsername) {
    throw new Error(
      'Missing required env vars: OWNER_GITHUB_ID and OWNER_GITHUB_USERNAME must be set in .env'
    )
  }

  // Upsert the owner account
  // Using upsert so re-running the seed doesn't create duplicates
  const owner = await prisma.user.upsert({
    where: { githubId: ownerGithubId },
    update: {
      role: Role.OWNER, // ensure role is always OWNER even if changed
    },
    create: {
      githubId: ownerGithubId,
      username: ownerUsername,
      displayName: ownerUsername,
      email: `${ownerUsername}@users.noreply.github.com`,
      avatar: `https://avatars.githubusercontent.com/u/${ownerGithubId}?v=4`,
      role: Role.OWNER,
      verified: true, // Owner is auto-verified
    },
  })

  console.log(`✅ Owner account seeded:`)
  console.log(`   Username: @${owner.username}`)
  console.log(`   Role: ${owner.role}`)
  console.log(`   GitHub ID: ${owner.githubId}`)

  console.log('\n✨ Database seed complete!')
}

main()
  .then(() => {
    void prisma.$disconnect()
  })
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error)
    void prisma.$disconnect()
    process.exit(1)
  })
