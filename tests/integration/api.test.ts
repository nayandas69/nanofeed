import { spawn, type ChildProcess } from 'node:child_process'
import { createHash, createHmac, randomUUID } from 'node:crypto'
import { signJWT, verifyJWT } from 'rootcap'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import prisma from '../../server/db/prisma'
import { SNAPSHOT_CLEANUP_INTERVAL, SNAPSHOT_CLEANUP_KEY } from '../../server/utils/snapshotCleanup'
import { errorMessage } from '../../app/utils/errors'

const base = 'http://localhost:3100'
let server: ChildProcess
let logs = ''
const fixture = `api-${randomUUID()}`
const userIds: string[] = []
const captchaClaimIds: string[] = []
let cookie = ''
let viewer = ''
let author = ''
let visible = ''
let hidden = ''
let snapshot: string | null = null
const headers = () => ({ cookie, origin: base, 'content-type': 'application/json' })
const cookieFor = async (userId: string) => {
  const token = randomUUID()
  await prisma.session.create({
    data: { userId, token, expiresAt: new Date(Date.now() + 3600_000) },
  })
  const signature = createHmac('sha256', process.env.BETTER_AUTH_SECRET!)
    .update(token)
    .digest('base64')
  return `better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`
}

beforeAll(async () => {
  if (!process.env.DATABASE_URL) throw new Error('Use a disposable test DATABASE_URL')
  for (const name of ['viewer', 'author', 'inactive']) {
    const user = await prisma.user.create({
      data: {
        githubId: `${fixture}-${name}`,
        username: `${fixture}-${name}`,
        email: `${fixture}-${name}@example.test`,
        displayName: name,
        avatar: 'https://example.test/avatar.png',
        isActive: name !== 'inactive',
      },
    })
    userIds.push(user.id)
  }
  viewer = userIds[0]!
  author = userIds[1]!
  cookie = await cookieFor(viewer)
  const post = await prisma.post.create({
    data: {
      authorId: author,
      content: `${fixture} visible #typescript`,
      hashtags: {
        connectOrCreate: { where: { tag: 'typescript' }, create: { tag: 'typescript' } },
      },
    },
  })
  visible = post.id
  hidden = (
    await prisma.post.create({
      data: { authorId: author, content: `${fixture} hidden`, hidden: true },
    })
  ).id
  await prisma.post.createMany({
    data: [
      { authorId: userIds[2]!, content: `${fixture} inactive` },
      { authorId: author, content: `${fixture} quote`, repostOfId: hidden },
      { authorId: author, content: `${fixture} reply`, parentId: hidden },
    ],
  })
  await prisma.follow.create({ data: { followerId: viewer, followingId: author } })
  server = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '3100', HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout?.on('data', (data) => {
    logs += String(data)
  })
  server.stderr?.on('data', (data) => {
    logs += String(data)
  })
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${base}/api/session`)).ok) return
    } catch {
      /* wait for listening */
    }
    if (server.exitCode !== null) throw new Error(`Server exited: ${logs}`)
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`Server did not become ready: ${logs}`)
})
afterAll(async () => {
  server?.kill('SIGTERM')
  await prisma.recommendationSnapshot.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
  await prisma.rateLimit.deleteMany({ where: { key: `post:${viewer}` } })
  await prisma.verification.deleteMany({ where: { id: { in: captchaClaimIds } } })
  await prisma.$disconnect()
})

describe('built production HTTP server', () => {
  it('requires a valid, scoped and single-use RootCap proof for sign-in', async () => {
    const signIn = (token?: string) =>
      fetch(`${base}/api/auth/sign-in/social`, {
        method: 'POST',
        headers: {
          origin: base,
          'content-type': 'application/json',
          ...(token ? { 'x-rootcap-token': token } : {}),
        },
        body: JSON.stringify({ provider: 'github', callbackURL: '/' }),
      })
    expect((await signIn()).status).toBe(403)
    expect((await signIn('invalid')).status).toBe(403)

    const challengeResponse = await fetch(`${base}/api/rootcap/api/challenge?scope=github-sign-in`)
    expect(challengeResponse.status).toBe(200)
    const challenge = (await challengeResponse.json()) as {
      token: string
      challenges: { s: string; d: number }[]
    }
    const payload = verifyJWT<{ seed: string }>(process.env.ROOTCAP_SECRET!, challenge.token)!
    captchaClaimIds.push(`rootcap:${createHash('sha256').update(payload.seed).digest('hex')}`)
    const solutions = challenge.challenges.map(({ s, d }) => {
      let nonce = 0
      while (true) {
        const digest = createHash('sha256').update(`${s}${nonce}`).digest()
        let zeroBits = 0
        for (const byte of digest) {
          if (byte === 0) zeroBits += 8
          else {
            zeroBits += Math.clz32(byte) - 24
            break
          }
        }
        if (zeroBits >= d) return nonce
        nonce++
      }
    })
    const verify = (body: unknown) =>
      fetch(`${base}/api/rootcap/api/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: base },
        body: JSON.stringify(body),
      })
    expect((await verify({ padding: 'x'.repeat(20_000) })).status).toBe(413)
    expect((await verify({ token: challenge.token, solutions: [] })).status).toBe(403)
    expect(
      (
        await verify({
          token: challenge.token,
          solutions: [solutions[0]! + 0.5, ...solutions.slice(1)],
        })
      ).status,
    ).toBe(403)
    const verified = await verify({ token: challenge.token, solutions })
    expect(verified.status).toBe(200)
    const { token } = (await verified.json()) as { token: string }
    expect((await verify({ token: challenge.token, solutions })).status).toBe(403)

    const wrongScope = signJWT(process.env.ROOTCAP_SECRET!, {
      seed: payload.seed,
      type: 'redeem',
      scope: 'other',
      exp: Date.now() + 60_000,
    })
    expect((await signIn(wrongScope)).status).toBe(403)
    const expired = signJWT(process.env.ROOTCAP_SECRET!, {
      seed: payload.seed,
      type: 'redeem',
      scope: 'github-sign-in',
      exp: Date.now() - 1,
    })
    expect((await signIn(expired)).status).toBe(403)
    const results = await Promise.all([signIn(token), signIn(token)])
    expect(results.map((response) => response.status).sort()).toEqual([200, 403])
    const successful = results.find((response) => response.status === 200)!
    expect(new URL((await successful.json()).url).hostname).toBe('github.com')
    expect((await signIn(token)).status).toBe(403)
    expect((await verify({ token: challenge.token, solutions })).status).toBe(403)
  })
  it('rate limits RootCap requests through the shared database', async () => {
    const address = '192.0.2.55'
    const digest = createHmac('sha256', process.env.ROOTCAP_SECRET!).update(address).digest('hex')
    const key = `rootcap:${digest}`
    try {
      await prisma.rateLimit.deleteMany({ where: { key } })
      const requests = Array.from({ length: 61 }, () =>
        fetch(`${base}/api/rootcap/api/challenge`, { headers: { 'x-forwarded-for': address } }),
      )
      const responses = await Promise.all(requests)
      expect(responses.filter((response) => response.status === 200)).toHaveLength(60)
      const blocked = responses.find((response) => response.status === 429)
      expect(blocked?.headers.get('retry-after')).toBeTruthy()
    } finally {
      await prisma.rateLimit.deleteMany({ where: { key } })
    }
  })
  it('counts only visible unread notifications consistently with the notification list', async () => {
    const posts = await prisma.post.findMany({
      where: { content: { startsWith: fixture } },
      select: { id: true },
    })
    await prisma.notification.createMany({
      data: [
        ...posts.map((post) => ({
          userId: viewer,
          senderId: author,
          type: 'REACTION' as const,
          postId: post.id,
          message: fixture,
        })),
        { userId: viewer, senderId: author, type: 'ACCOUNT_STATUS', message: fixture },
        {
          userId: viewer,
          senderId: author,
          type: 'REACTION',
          postId: visible,
          message: fixture,
          read: true,
        },
        { userId: author, senderId: viewer, type: 'ACCOUNT_STATUS', message: fixture },
      ],
    })
    const check = async (expected: number) => {
      const listResponse = await fetch(`${base}/api/notifications`, { headers: headers() })
      const countResponse = await fetch(`${base}/api/notifications/unread-count`, {
        headers: headers(),
      })
      expect(listResponse.status).toBe(200)
      expect(countResponse.status).toBe(200)
      const list = await listResponse.json()
      expect(list.notifications.filter((row: { read: boolean }) => !row.read)).toHaveLength(
        expected,
      )
      expect((await countResponse.json()).count).toBe(expected)
      expect(list.meta.unreadTotal).toBe(expected)
      const firstPage = await (
        await fetch(`${base}/api/notifications?limit=1`, { headers: headers() })
      ).json()
      expect(firstPage.meta.unreadTotal).toBe(expected)
    }
    try {
      // Hidden posts, inactive authors, and replies/quotes of hidden posts do not count.
      await check(2)
      await prisma.post.update({ where: { id: visible }, data: { hidden: true } })
      await check(1)
      await prisma.post.update({ where: { id: visible }, data: { hidden: false } })
      await prisma.user.update({ where: { id: author }, data: { deletionRequestedAt: new Date() } })
      await check(1)
    } finally {
      await prisma.post.update({ where: { id: visible }, data: { hidden: false } })
      await prisma.user.update({ where: { id: author }, data: { deletionRequestedAt: null } })
      await prisma.notification.deleteMany({ where: { message: fixture } })
    }
  })
  it('publishes Markdown docs publicly with server-rendered content and proper missing-page status', async () => {
    const overview = await fetch(`${base}/docs`)
    expect(overview.status).toBe(200)
    expect(await overview.text()).toContain('A solid foundation.')
    for (const slug of [
      'using-nanofeed',
      'connecting',
      'conversations',
      'contributing',
      'roadmap',
      'account',
      'troubleshooting',
      'getting-started',
      'neon',
      'github-auth',
      'migration',
      'deployment',
      'recommendations',
      'upgrades',
      'writing',
    ]) {
      const response = await fetch(`${base}/docs/${slug}`)
      expect(response.status).toBe(200)
      const html = await response.text()
      expect(html).toContain('class="docs-prose"')
      expect(html).toContain('View Markdown')
      expect(html).toContain(`rel="canonical"`)
      expect(html).not.toContain('Guide not found')
    }
    expect((await fetch(`${base}/docs/missing-guide`)).status).toBe(404)
  })
  it('hydrates authenticated SSR and rejects missing/forged sessions and non-owner access', async () => {
    const response = await fetch(`${base}/api/session`, { headers: headers() })
    expect(response.status).toBe(200)
    expect((await response.json()).user.id).toBe(viewer)
    expect(response.headers.get('cache-control')).toContain('no-store')
    const page = await fetch(`${base}/`, { headers: headers() })
    expect(page.status).toBe(200)
    expect(await page.text()).toContain('Your developer circle')
    expect((await fetch(`${base}/api/users/me`)).status).toBe(401)
    expect(
      (
        await fetch(`${base}/api/users/me`, {
          headers: { cookie: 'better-auth.session_token=forged' },
        })
      ).status,
    ).toBe(401)
    expect((await fetch(`${base}/api/dashboard/stats`, { headers: headers() })).status).toBe(403)
  })
  it('excludes hidden authors/posts and hidden reply/repost targets from every feed', async () => {
    for (const filter of ['recommended', 'latest', 'following']) {
      const response = await fetch(`${base}/api/feed?filter=${filter}`, { headers: headers() })
      expect(response.status).toBe(200)
      const { data } = await response.json()
      const fixturePosts = data.posts.filter((post: { content: string }) =>
        post.content.startsWith(fixture),
      )
      expect(fixturePosts.map((post: { id: string }) => post.id)).toEqual([visible])
      if (filter === 'recommended') {
        snapshot = data.snapshot
        expect(fixturePosts[0].recommendationReason).toBeTruthy()
      }
    }
    expect((await fetch(`${base}/api/feed?filter=following`)).status).toBe(401)
    expect((await fetch(`${base}/api/feed?filter=invalid`)).status).toBe(400)
    expect((await fetch(`${base}/api/posts/${hidden}`)).status).toBe(404)
    const search = await (await fetch(`${base}/api/search?q=${fixture}`)).json()
    expect(search.data.posts.map((post: { id: string }) => post.id)).toEqual([visible])
  })
  it('binds recommendation snapshots to the viewer and rechecks moderation on pagination', async () => {
    expect(snapshot).toBeTruthy()
    expect((await fetch(`${base}/api/feed?snapshot=${snapshot}`)).status).toBe(400)
    expect(
      (
        await fetch(`${base}/api/feed?snapshot=${snapshot}`, {
          headers: { cookie: await cookieFor(author) },
        })
      ).status,
    ).toBe(410)
    await prisma.post.update({ where: { id: visible }, data: { hidden: true } })
    const response = await fetch(`${base}/api/feed?snapshot=${snapshot}`, { headers: headers() })
    const { data } = await response.json()
    expect(data.posts.some((post: { id: string }) => post.id === visible)).toBe(false)
    await prisma.post.update({ where: { id: visible }, data: { hidden: false } })
    await prisma.recommendationSnapshot.update({
      where: { id: snapshot! },
      data: { expiresAt: new Date(0) },
    })
    expect(
      (await fetch(`${base}/api/feed?snapshot=${snapshot}`, { headers: headers() })).status,
    ).toBe(410)
  })
  it('never persists guest recommendations and cleans expired snapshots on a shared five-minute cadence', async () => {
    await prisma.rateLimit.deleteMany({ where: { key: SNAPSHOT_CLEANUP_KEY } })
    const expired = await prisma.recommendationSnapshot.create({
      data: { userId: viewer, posts: [], expiresAt: new Date(0) },
    })
    const responses = await Promise.all(
      Array.from({ length: 4 }, () => fetch(`${base}/api/feed?pageSize=1`)),
    )
    for (const response of responses) {
      expect(response.status).toBe(200)
      const { data } = await response.json()
      expect(data).toMatchObject({ snapshot: null, hasMore: false, page: 1 })
      expect(data.posts).toHaveLength(1)
      expect(data.total).toBe(1)
    }
    expect(await prisma.recommendationSnapshot.findUnique({ where: { id: expired.id } })).toBeNull()
    const before = await prisma.recommendationSnapshot.count()
    await fetch(`${base}/api/feed`)
    expect(await prisma.recommendationSnapshot.count()).toBe(before)
    expect(await prisma.rateLimit.count({ where: { key: SNAPSHOT_CLEANUP_KEY } })).toBe(1)
    const deferred = await prisma.recommendationSnapshot.create({
      data: { userId: viewer, posts: [], expiresAt: new Date(0) },
    })
    await fetch(`${base}/api/feed`)
    expect(
      await prisma.recommendationSnapshot.findUnique({ where: { id: deferred.id } }),
    ).not.toBeNull()
    await prisma.rateLimit.update({
      where: { key: SNAPSHOT_CLEANUP_KEY },
      data: { lastRequest: BigInt(Date.now() - SNAPSHOT_CLEANUP_INTERVAL - 1000) },
    })
    await fetch(`${base}/api/feed`)
    expect(
      await prisma.recommendationSnapshot.findUnique({ where: { id: deferred.id } }),
    ).toBeNull()
    expect((await fetch(`${base}/api/feed?page=2`)).status).toBe(400)
    expect((await fetch(`${base}/api/feed?filter=latest&pageSize=1&page=2`)).status).toBe(200)
  })
  it('keeps ranked pages stable when new posts and engagement arrive', async () => {
    await prisma.post.createMany({
      data: [1, 2, 3].map((i) => ({ authorId: author, content: `${fixture} pagination ${i}` })),
    })
    const first = await (await fetch(`${base}/api/feed?pageSize=1`, { headers: headers() })).json()
    const url = `${base}/api/feed?pageSize=1&page=2&snapshot=${first.data.snapshot}`
    const before = await (await fetch(url, { headers: headers() })).json()
    const newest = await prisma.post.create({
      data: { authorId: author, content: `${fixture} arrived later` },
    })
    await prisma.reaction.create({ data: { userId: viewer, postId: newest.id } })
    const after = await (await fetch(url, { headers: headers() })).json()
    expect(after.data.posts.map((post: { id: string }) => post.id)).toEqual(
      before.data.posts.map((post: { id: string }) => post.id),
    )
    expect(after.data.posts[0].id).not.toBe(first.data.posts[0].id)
    expect(after.data.posts[0].id).not.toBe(newest.id)
  })
  it('enforces origin, immutable auth identity, and restricted account writes', async () => {
    expect(
      (
        await fetch(`${base}/api/posts/create`, {
          method: 'POST',
          headers: { ...headers(), origin: 'https://evil.example' },
          body: JSON.stringify({ content: 'bad' }),
        })
      ).status,
    ).toBe(403)
    expect(
      (
        await fetch(`${base}/api/auth/update-user`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({ githubId: '900001', role: 'OWNER' }),
        })
      ).status,
    ).toBe(404)
    await prisma.reaction.create({ data: { userId: viewer, postId: visible } })
    const notificationCount = await prisma.notification.count({
      where: { senderId: viewer, postId: visible },
    })
    await prisma.user.update({ where: { id: viewer }, data: { isRestricted: true } })
    expect(
      (
        await fetch(`${base}/api/posts/create`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({ content: 'blocked' }),
        })
      ).status,
    ).toBe(403)
    expect(
      (await fetch(`${base}/api/posts/${visible}/repost`, { method: 'POST', headers: headers() }))
        .status,
    ).toBe(403)
    expect(
      (await fetch(`${base}/api/posts/${visible}/react`, { method: 'POST', headers: headers() }))
        .status,
    ).toBe(403)
    expect(await prisma.reaction.count({ where: { userId: viewer, postId: visible } })).toBe(1)
    await prisma.reaction.deleteMany({ where: { userId: viewer, postId: visible } })
    expect(
      (await fetch(`${base}/api/posts/${visible}/react`, { method: 'POST', headers: headers() }))
        .status,
    ).toBe(403)
    expect(await prisma.reaction.count({ where: { userId: viewer, postId: visible } })).toBe(0)
    expect(await prisma.notification.count({ where: { senderId: viewer, postId: visible } })).toBe(
      notificationCount,
    )
    await prisma.user.update({ where: { id: viewer }, data: { isRestricted: false } })
  })
  it('exposes report groups beyond the first page and preserves useful owner lifecycle errors', async () => {
    await prisma.report.createMany({
      data: Array.from({ length: 21 }, (_, i) => ({
        reporterId: viewer,
        reportedUserId: author,
        reason: 'SPAM' as const,
        notes: `${fixture} moderation ${i}`,
      })),
    })
    await prisma.user.update({ where: { id: author }, data: { role: 'OWNER' } })
    try {
      const ownerHeaders = { cookie: await cookieFor(author) }
      const url = `${base}/api/dashboard/reports?q=${fixture}&pageSize=20`
      const first = await (await fetch(`${url}&page=1`, { headers: ownerHeaders })).json()
      const second = await (await fetch(`${url}&page=2`, { headers: ownerHeaders })).json()
      expect(first.data.total).toBe(21)
      expect(first.data.reports).toHaveLength(20)
      expect(second.data.reports).toHaveLength(1)
      expect(first.data.reports.map((report: { id: string }) => report.id)).not.toContain(
        second.data.reports[0].id,
      )
      const deletion = await fetch(`${base}/api/users/delete`, {
        method: 'POST',
        headers: { ...ownerHeaders, origin: base, 'content-type': 'application/json' },
        body: '{}',
      })
      expect(deletion.status).toBe(403)
      expect(errorMessage({ data: await deletion.json() }, 'Fallback')).toBe(
        'The project owner account cannot be deleted',
      )
    } finally {
      await prisma.user.update({ where: { id: author }, data: { role: 'USER' } })
    }
  })
  it('limits concurrent posting atomically across requests', async () => {
    await prisma.user.update({ where: { id: viewer }, data: { isRestricted: false } })
    await prisma.rateLimit.deleteMany({ where: { key: `post:${viewer}` } })
    await prisma.verification.deleteMany({ where: { id: { in: captchaClaimIds } } })
    const responses = await Promise.all(
      Array.from({ length: 7 }, (_, i) =>
        fetch(`${base}/api/posts/create?attempt=${i}`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({ content: `${fixture} concurrent ${i}` }),
        }),
      ),
    )
    expect(responses.filter((response) => response.status === 201)).toHaveLength(5)
    expect(responses.filter((response) => response.status === 429)).toHaveLength(2)
  })
  it('denies deactivated sessions and serves the cron through GET with secret protection', async () => {
    await prisma.user.update({ where: { id: viewer }, data: { isActive: false } })
    expect((await fetch(`${base}/api/users/me`, { headers: headers() })).status).toBe(401)
    expect((await fetch(`${base}/api/cron/purge-deleted-accounts`)).status).toBe(403)
    expect(
      (
        await fetch(`${base}/api/cron/purge-deleted-accounts`, {
          headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
        })
      ).status,
    ).toBe(200)
  })
  it('grants verification only for an approved request, including concurrent reviews', async () => {
    await prisma.user.update({ where: { id: author }, data: { role: 'OWNER' } })
    const ownerHeaders = {
      cookie: await cookieFor(author),
      origin: base,
      'content-type': 'application/json',
    }
    const request = () =>
      prisma.verificationRequest.create({
        data: {
          userId: viewer,
          realName: 'Test User',
          email: 'test@example.test',
          reason: fixture,
        },
      })
    const review = (action: 'verify-user' | 'reject-user', requestId: string) =>
      fetch(`${base}/api/dashboard/${action}`, {
        method: 'POST',
        headers: ownerHeaders,
        body: JSON.stringify({ requestId }),
      })
    try {
      await prisma.user.update({ where: { id: viewer }, data: { verified: false } })
      const rejected = await request()
      expect((await review('reject-user', rejected.id)).status).toBe(200)
      expect((await prisma.user.findUniqueOrThrow({ where: { id: viewer } })).verified).toBe(false)
      expect((await review('verify-user', rejected.id)).status).toBe(409)

      const accepted = await request()
      expect((await review('verify-user', accepted.id)).status).toBe(200)
      expect((await prisma.user.findUniqueOrThrow({ where: { id: viewer } })).verified).toBe(true)
      expect((await review('reject-user', accepted.id)).status).toBe(409)

      await prisma.user.update({ where: { id: viewer }, data: { verified: false } })
      const raced = await request()
      const results = await Promise.all([
        review('verify-user', raced.id),
        review('reject-user', raced.id),
      ])
      expect(results.map((result) => result.status).sort()).toEqual([200, 409])
      const reviewed = await prisma.verificationRequest.findUniqueOrThrow({
        where: { id: raced.id },
      })
      const user = await prisma.user.findUniqueOrThrow({ where: { id: viewer } })
      expect(user.verified).toBe(reviewed.status === 'ACCEPTED')
    } finally {
      await prisma.user.update({ where: { id: author }, data: { role: 'USER' } })
      await prisma.user.update({ where: { id: viewer }, data: { verified: false } })
      await prisma.verificationRequest.deleteMany({ where: { userId: viewer } })
    }
  })
  it('enforces owner site controls for verification and maintenance on the real API', async () => {
    await prisma.user.update({ where: { id: author }, data: { role: 'OWNER' } })
    await prisma.user.update({ where: { id: viewer }, data: { isActive: true } })
    const ownerCookie = await cookieFor(author)
    const ownerHeaders = { cookie: ownerCookie, origin: base, 'content-type': 'application/json' }
    const settings = {
      verificationRequestsEnabled: false,
      maintenanceEnabled: true,
      maintenanceMessage: 'Back soon',
      maintenanceEndsAt: '2030-01-01T00:00:00.000Z',
    }
    try {
      expect(
        (
          await fetch(`${base}/api/dashboard/settings`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(settings),
          })
        ).status,
      ).toBe(403)
      expect(
        (
          await fetch(`${base}/api/dashboard/settings`, {
            method: 'PUT',
            headers: ownerHeaders,
            body: JSON.stringify(settings),
          })
        ).status,
      ).toBe(200)
      expect(await (await fetch(`${base}/api/site/settings`)).json()).toMatchObject(settings)
      expect(
        (
          await fetch(`${base}/api/verification/request`, {
            method: 'POST',
            headers: headers(),
            body: '{}',
          })
        ).status,
      ).toBe(403)
      for (const path of [
        '/api/feed',
        `/api/posts/${visible}`,
        '/api/notifications',
        `/api/users/${fixture}-author/follow`,
      ]) {
        expect((await fetch(`${base}${path}`, { headers: headers() })).status).toBe(503)
      }
      expect((await fetch(`${base}/api/session`, { headers: headers() })).status).toBe(200)
      expect((await fetch(`${base}/api/rootcap/api/challenge`)).status).toBe(200)
      expect(
        (
          await fetch(`${base}/api/rootcap/api/verify`, {
            method: 'POST',
            headers: { origin: base, 'content-type': 'application/json' },
            body: '{}',
          })
        ).status,
      ).toBe(403)
      expect(
        (await fetch(`${base}/api/users/${fixture}-viewer`, { headers: headers() })).status,
      ).toBe(200)
      expect(
        (await fetch(`${base}/api/users/${fixture}-author`, { headers: headers() })).status,
      ).toBe(503)
      expect((await fetch(`${base}/api/users/${fixture}-viewer`)).status).toBe(503)
      expect(
        (await fetch(`${base}/api/contributors/${fixture}-author`, { headers: headers() })).status,
      ).toBe(503)
      const invalid = await fetch(`${base}/api/dashboard/settings`, {
        method: 'PUT',
        headers: ownerHeaders,
        body: JSON.stringify({ ...settings, maintenanceEndsAt: 'invalid' }),
      })
      expect(invalid.status).toBe(400)
      expect((await (await fetch(`${base}/api/site/settings`)).json()).maintenanceEndsAt).toBe(
        settings.maintenanceEndsAt,
      )
      const { maintenanceEndsAt: _, ...legacySettings } = settings
      expect(
        (
          await fetch(`${base}/api/dashboard/settings`, {
            method: 'PUT',
            headers: ownerHeaders,
            body: JSON.stringify(legacySettings),
          })
        ).status,
      ).toBe(200)
      expect((await (await fetch(`${base}/api/site/settings`)).json()).maintenanceEndsAt).toBe(
        settings.maintenanceEndsAt,
      )
      expect(
        (
          await fetch(`${base}/api/dashboard/settings`, {
            method: 'PUT',
            headers: ownerHeaders,
            body: JSON.stringify({ ...settings, maintenanceEndsAt: '2020-01-01T00:00:00.000Z' }),
          })
        ).status,
      ).toBe(200)
      expect((await fetch(`${base}/api/feed`, { headers: headers() })).status).toBe(503)
      expect(
        (
          await fetch(`${base}/api/dashboard/settings`, {
            method: 'PUT',
            headers: ownerHeaders,
            body: JSON.stringify({ ...settings, maintenanceEndsAt: null }),
          })
        ).status,
      ).toBe(200)
      expect((await (await fetch(`${base}/api/site/settings`)).json()).maintenanceEndsAt).toBeNull()
    } finally {
      await prisma.siteSettings.deleteMany()
      await prisma.user.update({ where: { id: author }, data: { role: 'USER' } })
    }
    expect((await fetch(`${base}/api/posts/${visible}`, { headers: headers() })).status).toBe(200)
  })
})

it('persists badge order and returns current entitlements across author/profile/follow APIs', async () => {
  const authorCookie = await cookieFor(author)
  const username = `${fixture}-author`
  const authorHeaders = { ...headers(), cookie: authorCookie }
  const order = ['contributor', 'verified', 'owner']
  expect(
    (
      await fetch(`${base}/api/users/badge-order`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', origin: base },
        body: JSON.stringify({ badgeOrder: [] }),
      })
    ).status,
  ).toBe(401)
  expect(
    (
      await fetch(`${base}/api/users/badge-order`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ badgeOrder: ['owner'] }),
      })
    ).status,
  ).toBe(400)
  await prisma.user.update({
    where: { id: author },
    data: { role: 'OWNER', verified: true, contributorCommit: 'a'.repeat(40) },
  })
  try {
    const saved = await fetch(`${base}/api/users/badge-order`, {
      method: 'PATCH',
      headers: authorHeaders,
      body: JSON.stringify({ badgeOrder: order, userId: viewer }),
    })
    expect(saved.status).toBe(200)
    expect((await prisma.user.findUniqueOrThrow({ where: { id: author } })).badgeOrder).toEqual(
      order,
    )
    expect((await prisma.user.findUniqueOrThrow({ where: { id: viewer } })).badgeOrder).toEqual([])
    const profile = await (
      await fetch(`${base}/api/users/${username}`, { headers: headers() })
    ).json()
    expect(profile.data).toMatchObject({ badgeOrder: order, contributorCommit: 'a'.repeat(40) })
    const following = await (
      await fetch(`${base}/api/users/${fixture}-viewer/following`, { headers: headers() })
    ).json()
    expect(following.data.find((u: { id: string }) => u.id === author)).toMatchObject({
      badgeOrder: order,
      contributorCommit: 'a'.repeat(40),
    })
    const feed = await (
      await fetch(`${base}/api/feed?filter=latest`, { headers: headers() })
    ).json()
    expect(
      feed.data.posts.find((p: { authorId: string }) => p.authorId === author).author,
    ).toMatchObject({ badgeOrder: order, contributorCommit: 'a'.repeat(40) })
    const detail = await (
      await fetch(`${base}/api/posts/${visible}`, { headers: headers() })
    ).json()
    expect(detail.data.author).toMatchObject({
      badgeOrder: order,
      contributorCommit: 'a'.repeat(40),
    })
    const me = await (await fetch(`${base}/api/users/me`, { headers: authorHeaders })).json()
    expect(me.data.badgeOrder).toEqual(order)
    expect(me.data).not.toHaveProperty('accessToken')
    const settingsHtml = await (await fetch(`${base}/settings`, { headers: authorHeaders })).text()
    expect(settingsHtml).toContain('value="author"')
    expect(settingsHtml).toContain('aria-label="Move Verified Contributor up"')

    await prisma.user.update({
      where: { id: author },
      data: { role: 'USER', verified: false, contributorCommit: null },
    })
    expect(
      (
        await fetch(`${base}/api/users/badge-order`, {
          method: 'PATCH',
          headers: authorHeaders,
          body: JSON.stringify({ badgeOrder: ['contributor'] }),
        })
      ).status,
    ).toBe(400)
  } finally {
    await prisma.user.update({
      where: { id: author },
      data: { role: 'USER', verified: false, contributorCommit: null, badgeOrder: [] },
    })
  }
})
