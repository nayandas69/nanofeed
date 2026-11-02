---
title: Build and deploy
description: Run production releases on Vercel with tested builds, database migrations, and protected CI/CD.
category: Operations
order: 50
---

# Setup, database, GitHub login, and deployment

## 1. Toolchain

Install Node 24 LTS; `.nvmrc` and `package.json` select major 24. Use npm and commit `package-lock.json`. Run `npm ci`, never `--force` or `--legacy-peer-deps`. Installation applies the version-pinned ESLint compatibility patch, generates Prisma Client, and prepares Nuxt types. See [Upgrade notes](UPGRADES.md) for the patch and dependency audit limits. Build generation does not require a live database.

This app runs Better Auth inside Nuxt with a Prisma adapter and Neon PostgreSQL. It does **not** use managed Neon Auth or a `neon_auth` schema.

## 2. Create the Neon database

1. Create a project in [Neon](https://console.neon.tech), choosing a region near your app.
2. Create separate branches/databases for development, testing, and production. Tests must never use production credentials.
3. Open **Connect**. Copy the pooled connection string (`-pooler` hostname) into `DATABASE_URL`. Prisma's PostgreSQL driver limits each application instance to five connections.
4. Copy the direct connection string (pooling off) into `DIRECT_URL` for migrations. Keep Neon's TLS parameters, including `sslmode=require`; do not disable certificate verification. URL-encode special characters in manually assembled passwords.
5. Copy `.env.example` to `.env` and fill in both URLs. Local PostgreSQL also works: `postgresql://USER:PASSWORD@localhost:5432/nanofeed` for both values.
6. For a **new empty database**, run:

   ```bash
   npm ci
   npm run db:deploy
   ```

This applies all committed migrations, including the owner controls and maintenance countdown migrations. The snapshot ownership migration removes orphaned ownership references and adds an indexed user foreign key with cascading deletion, so deleting an account also deletes its recommendation snapshots. `db:push` is for disposable prototypes only; production uses versioned migrations.

Contributor badges are claimed in Settings by submitting a commit SHA or link. The server checks GitHub's commit author ID against the signed-in GitHub ID and checks that the commit is on the official repository's default branch. Run `npm run db:deploy` before starting the updated application. Existing contributors must claim the badge once. GitHub API outages or rate limits prevent new claims but do not remove claimed badges. `GITHUB_CONTRIBUTORS_TOKEN` is optional and provides a higher API rate limit. GitHub's commit author attribution depends on commit metadata and is not cryptographic proof of authorship. Unknown code fence languages are displayed as plain text.

For future schema changes, use `npm run db:migrate -- --name descriptive_name` against a development database. Review and commit the SQL. Never run `migrate dev` against production.

## 3. Create a GitHub OAuth App

1. Go to [GitHub Developer settings → OAuth Apps](https://github.com/settings/developers), then **New OAuth App**.
2. For development set Homepage URL to `http://localhost:3000` and Authorization callback URL to `http://localhost:3000/api/auth/callback/github`.
3. Copy the Client ID to `GITHUB_CLIENT_ID`, generate a client secret, and set `GITHUB_CLIENT_SECRET`.
4. Use a **separate OAuth App** in production with Homepage URL `https://nanofeed.vercel.app` and callback `https://nanofeed.vercel.app/api/auth/callback/github`. Use one stable origin, including any `www` prefix. Do not use temporary preview domains with production OAuth credentials.
5. Better Auth requests `read:user` and `user:email`. Private GitHub emails are resolved through the user's email list. Accounts without a usable email cannot complete signup.
6. Set `OWNER_GITHUB_ID` to your numeric GitHub ID (the `id` from `https://api.github.com/users/YOUR_USERNAME`), never your username. Leave blank to have no automatically assigned owner. New owner accounts are verified; normal accounts are not.
7. No seed is required for development or production. Sign in with GitHub to create a new account; set `OWNER_GITHUB_ID` before your own sign-in to grant owner access. Existing accounts are migrated rather than recreated.

New usernames use a normalized GitHub login plus numeric ID to avoid collisions. Users can edit them in Settings. Existing usernames and profiles are retained. Account linking by email is disabled: sign-in binds to the GitHub provider's immutable account ID.

## 4. Environment variables

| Variable               | Required          | Purpose                                                      |
| ---------------------- | ----------------- | ------------------------------------------------------------ |
| `DATABASE_URL`         | runtime           | Pooled Neon PostgreSQL URL                                   |
| `DIRECT_URL`           | migrations        | Direct Neon URL; falls back to `DATABASE_URL` locally        |
| `BETTER_AUTH_SECRET`   | runtime           | Random secret of at least 32 characters                      |
| `BETTER_AUTH_URL`      | runtime           | Exact application origin, e.g. `https://nanofeed.vercel.app` |
| `GITHUB_CLIENT_ID`     | runtime           | OAuth App client ID                                          |
| `GITHUB_CLIENT_SECRET` | runtime           | OAuth App client secret                                      |
| `NUXT_PUBLIC_APP_URL`  | runtime           | Same origin; used for public links                           |
| `OWNER_GITHUB_ID`      | optional          | Numeric owner ID                                             |
| `CRON_SECRET`          | scheduled cleanup | Independent random cron secret                               |
| `NITRO_PRESET`         | build             | `node-server` by default; `vercel` for Vercel                |

### CAPTCHA and contributor credentials

| Variable                    | Required | Purpose                                                                             |
| --------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `ROOTCAP_SECRET`            | runtime  | Independent server secret for sign-in verification; at least 32 characters          |
| `GITHUB_CONTRIBUTORS_TOKEN` | optional | GitHub token for a higher rate limit when looking up public repository contributors |

**RootCap:** Generate a new secret locally with `openssl rand -base64 48` and set it as `ROOTCAP_SECRET` in the host's runtime environment, including the Vercel environment for each deployment. Use a separate value from `BETTER_AUTH_SECRET` and `CRON_SECRET`; never expose it as a public variable. RootCap runs on your own app and does not require an account or a token from its demo website. The widget obtains a short-lived verification token automatically; users do not need to create one. Existing sessions remain usable, but every new GitHub sign-in requires a completed challenge. Rotating the secret invalidates pending challenges and tokens. JavaScript, Web Workers, and HTTPS (or localhost for development) are required.

RootCap 1.2.0 clears the widget when its server-issued token expires, when verification is reset, or after a failed sign-in. The server still enforces the GitHub sign-in scope and consumes each successful token only once. In-flight checks can be retried if a deployment interrupts them.

RootCap limits challenge and verification requests together to 60 per minute per client IP. Configure a trusted reverse proxy to overwrite `X-Forwarded-For` and block direct access to the app server; otherwise this limit can be bypassed. Clients sharing an IP also share the limit. Vercel sets this header, but an additional proxy in front of Vercel may cause clients to share the proxy IP.

**GitHub contributors token:** This is optional because the official repository is public. For a higher authenticated API limit, create a fine-grained GitHub token with read access to repository contents and metadata for `nanofeed/nanofeed`. Organization-owned resources can require organization approval. Set `GITHUB_CONTRIBUTORS_TOKEN` in the server environment; keep it private, rotate it before expiration, and never commit it. This token is separate from the GitHub OAuth client secret.

The claim endpoint uses the signed-in account's stored GitHub OAuth token when no shared token is configured, or retries with that token if GitHub responds to the shared token with HTTP 401, 403, or 429. It uses the account token only if it has no stored expiry or has not yet expired. If neither token is available, it makes an unauthenticated request. The OAuth token is selected by the immutable GitHub account binding and never returned to the client. Migrated accounts without a token can sign in again if anonymous requests are limited. A final HTTP 401 produces a sign-in-again message, while HTTP 429 or a response with zero remaining quota produces a rate-limit message; other failures may show the generic temporary-unavailability message. Sanitized server warnings help operators investigate network or provider failures.

Apply `npm run db:deploy` before deploying this release: the new `badge_order` array defaults to empty and preserves existing users and badges. No new OAuth scopes are requested. [GitHub documents separate anonymous and authenticated API limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

Generate each secret separately with `openssl rand -base64 32`. Store values in `.env` locally and the hosting provider's secret store in production. Never expose them with a `NUXT_PUBLIC_` prefix. Old `AUTH_SECRET`, `AUTH_GITHUB_ID`, and `AUTH_GITHUB_SECRET` names are no longer read. Node's production entry point does not automatically read `.env`; use your host's environment injection or `node --env-file=.env .output/server/index.mjs` locally.

## 5. Upgrade an existing database safely

Follow the detailed [existing-user migration runbook](MIGRATION.md). Keep the original database: creating an empty Neon database does not transfer existing users or their content. If changing database hosts, restore and verify a full backup before running the migrations.

The old project used `prisma db push` and had no migration history. The first migration represents its original schema.

1. Create a Neon branch/backup of production and rehearse the upgrade there. Stop writes during the actual cutover because old Auth.js code is incompatible with the new schema.
2. Compare the existing database with `prisma/migrations/20261029000000_baseline/migration.sql`. Resolve drift explicitly; **do not** mark a different schema as matching the baseline.
3. For an existing matching database only, mark the baseline as already applied:

   ```bash
   npx prisma migrate resolve --applied 20261029000000_baseline
   npm run db:deploy
   ```

   Do not run `migrate resolve` on an empty database; use the new-database instructions instead.

4. The transactional upgrade adds Better Auth columns, keeps user IDs/content/follows, and creates missing GitHub account rows from each user's immutable `github_id`. It aborts if an existing GitHub account is bound to a different GitHub ID. Investigate that identity mismatch manually; never repair it by matching email alone.
5. Old sessions and verification tokens are discarded, as are old provider tokens. Users must sign in again. GitHub supplies fresh provider tokens. Deleted/deactivated accounts retain their state until a successful login within the original grace period.
6. Deploy the new app and verify GitHub login, an ordinary account, owner access, post creation, feed pagination, and sign-out. Check the Neon and Vercel logs for errors.
7. If cutover fails, keep traffic stopped and restore the backup/Neon branch **together with** the previous application version. Rolling back code alone will not restore the old auth schema. Do not reset or drop the production database.

## 6. Build and deploy to Vercel

1. Import the repository into Vercel as a Nuxt project. Select Node **24.x**. Connect the GitHub repository.
2. Confirm the production domain is `https://nanofeed.vercel.app`. Set `BETTER_AUTH_URL=https://nanofeed.vercel.app` and `NUXT_PUBLIC_APP_URL=https://nanofeed.vercel.app` without a trailing slash. Set the environment variables above in the Production environment. Set separate values/Neon branch for Preview if used. Prefer a stable staging domain with its own OAuth App.
3. `vercel.json` uses `npm ci` and `NITRO_PRESET=vercel npm run build`. Migrations are deliberately a separate release step and never run during arbitrary preview builds.
4. Apply reviewed migrations with `npm run db:deploy` using the production direct URL, after the backup/cutover preparation above.
5. Deploy. Vercel calls `GET /api/cron/purge-deleted-accounts` daily at 03:00 UTC and sends `Authorization: Bearer CRON_SECRET`. The job deletes accounts whose 30-day grace period has elapsed and independently attempts expired recommendation/rate-limit cleanup. Recommended-feed traffic also triggers expired-snapshot cleanup at most every five minutes across instances. Confirm Cron is enabled for your plan and monitor failures.
6. Verify `GET /api/session`, `/auth/login`, and a complete GitHub login on the actual HTTPS domain. Vercel supplies HTTPS; cookies are HTTP-only and Better Auth handles secure session cookie settings.

### Two GitHub Actions workflows

- **CI** (`ci.yml`): pull requests, pushes to `main`, and reusable calls. Installs the lockfile on Node 24, validates/migrates disposable PostgreSQL, lints, type-checks, runs unit tests, audits dependencies, builds the Node server, runs integration tests, then builds and uploads Vercel output. No production secrets are needed.
- **Production deployment** (`deploy.yml`): manual dispatch from `main`. Calls the complete CI workflow first, then enters the `production` environment, checks the required `traffic_cutover_confirmed` dispatch input, applies migrations, deploys the tested commit SHA through Vercel's REST API, and waits for `READY`. It fails on API errors, build errors, cancellation, or timeout.

Before dispatch, pause production writes, stop the legacy application from serving traffic, and complete the backup/rehearsal steps. Check `traffic_cutover_confirmed` only after that cutover is active. The workflow fails before migrations if the confirmation is false; it records an operator confirmation and does not stop traffic automatically. Keep traffic paused if migration or deployment fails and follow the paired rollback procedure.

Configure GitHub environment `production` with protected branch rules and required reviewers. Set environment secrets `DIRECT_URL` and `VERCEL_TOKEN`; set variables `VERCEL_PROJECT_ID`, `VERCEL_PROJECT_NAME`, and optional `VERCEL_TEAM_ID`. App runtime secrets stay in Vercel. Scope the Vercel token to the intended account/team/project access.

Use one production delivery path. If GitHub Actions owns deployment, disable automatic Git-based production deployments in Vercel so they cannot bypass these gates or race migrations. The REST deployment uses the connected repository and the exact tested SHA. Deployment requires actual provider configuration; adding these files alone does not activate or execute a production deployment.

## 7. Run on a Node host

```bash
npm ci
npm run db:deploy
npm run build
# Inject runtime environment first; use a supervisor/container restart policy.
HOST=0.0.0.0 PORT=3000 node .output/server/index.mjs
```

Put an HTTPS reverse proxy in front of the server and set both app URLs to its public origin. Schedule an authenticated daily GET to the cleanup route yourself. Restrict database network access, monitor application errors and cleanup failures, and keep tested backups.

## 8. Tests and troubleshooting

Use a disposable PostgreSQL database. Run `npm run db:deploy`, `npm run build`, and `npm run test:integration` with its `DATABASE_URL`. The integration server occupies port 3100. OAuth tests simulate GitHub token/profile responses; they test actual Better Auth state, identity persistence, sessions, owner assignment, private email, origin rejection, and reactivation. A real GitHub callback and hosted deployment still require a smoke test with your credentials.

- **OAuth callback mismatch:** verify the exact origin/callback in both GitHub and `BETTER_AUTH_URL`.
- **403 on app writes:** the browser Origin must match `BETTER_AUTH_URL`; do not use a different hostname for the same app.
- **Database TLS/connection error:** use the current Neon strings with TLS; pooled for app traffic, direct for migrations.
- **Existing user cannot log in:** inspect GitHub account bindings and unique emails. Do not enable automatic email linking as a workaround.
- **Expired recommended feed:** refresh; snapshots last 30 minutes. Latest remains chronological.
- **Dependency install conflict:** use Node 24 and a clean `npm ci`; do not bypass peer checks. See [upgrade notes](UPGRADES.md) for the DevTools/TypeScript compatibility pins and scoped glob override. After dependency upgrades on current npm 11, review `npm install-scripts ls` and update only the required version-pinned hook entries.

References: [Better Auth Nuxt integration](https://www.better-auth.com/docs/integrations/nuxt), [GitHub provider](https://www.better-auth.com/docs/authentication/github), [Prisma adapter](https://www.better-auth.com/docs/adapters/prisma), [Neon and Prisma](https://neon.com/docs/guides/prisma), [Vercel deployment API](https://vercel.com/docs/rest-api/reference/endpoints/deployments/create-a-new-deployment).
