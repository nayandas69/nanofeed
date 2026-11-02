import { createHash } from 'node:crypto'
import { generateChallenge, validateChallenge, verifyJWT, verifyToken } from 'rootcap'
import prisma from '../db/prisma'

const SCOPE = 'github-sign-in'
const IDENTIFIER = 'rootcap:github-sign-in'
const CHALLENGE_TTL = 5 * 60_000
export const ROOTCAP_TOKEN_TTL = 2 * 60_000

type TokenPayload = { seed?: unknown; exp?: unknown; scope?: unknown; type?: unknown }
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
const claimId = (seed: string) => `rootcap:${hash(seed)}`

function secret() {
  const value = process.env.ROOTCAP_SECRET
  if (!value || value.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Human verification is unavailable' })
  }
  return value
}

export function createRootcapChallenge() {
  return generateChallenge(secret(), { scope: SCOPE, expiresMs: CHALLENGE_TTL })
}

export async function solveRootcapChallenge(body: unknown) {
  const key = secret()
  const result = validateChallenge(key, body, { scope: SCOPE, tokenTtlMs: ROOTCAP_TOKEN_TTL })
  if (!result.success || !result.token || !result.expires) return { success: false }
  const challengeToken = (body as { token: string }).token
  const challenge = verifyJWT<TokenPayload>(key, challengeToken)
  if (
    typeof challenge?.seed !== 'string' ||
    !/^[a-f0-9]{64}$/.test(challenge.seed) ||
    typeof challenge.exp !== 'number' ||
    !Number.isSafeInteger(challenge.exp)
  )
    return { success: false }

  try {
    // The challenge seed is unique and stays reserved until both the challenge
    // and its redeem token expire, so solving the same proof cannot mint more tokens.
    await prisma.verification.create({
      data: {
        id: claimId(challenge.seed),
        identifier: IDENTIFIER,
        value: hash(result.token),
        expiresAt: new Date(Math.max(challenge.exp, result.expires)),
      },
    })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')
      return { success: false }
    throw error
  }
  return result
}

export async function consumeRootcapToken(token: string | undefined) {
  const key = secret()
  if (!token || token.length > 4096) return false
  const payload = verifyJWT<TokenPayload>(key, token)
  if (
    !payload ||
    payload.type !== 'redeem' ||
    payload.scope !== SCOPE ||
    typeof payload.seed !== 'string' ||
    !/^[a-f0-9]{64}$/.test(payload.seed) ||
    typeof payload.exp !== 'number' ||
    !Number.isSafeInteger(payload.exp) ||
    payload.exp <= Date.now() ||
    !verifyToken(key, token, { scope: SCOPE })
  )
    return false
  // Atomic across server instances. A successful token can start only one sign-in.
  const result = await prisma.verification.updateMany({
    where: {
      id: claimId(payload.seed),
      identifier: IDENTIFIER,
      value: hash(token),
      expiresAt: { gt: new Date() },
    },
    data: { value: 'consumed' },
  })
  return result.count === 1
}

export async function cleanupRootcapClaims() {
  return prisma.verification.deleteMany({
    where: { identifier: IDENTIFIER, expiresAt: { lte: new Date() } },
  })
}
