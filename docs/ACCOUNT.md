---
title: Account and privacy
description: Manage your profile, request verification, understand restrictions, and deactivate or delete your account.
category: Use NanoFeed
order: 2
---

# Account and privacy

NanoFeed uses GitHub sign-in. Always return with the same GitHub account. The official source is [nanofeed/nanofeed](https://github.com/nanofeed/nanofeed).

## Profile and identity

Open **Settings → Profile** to update your display name, username, avatar, and bio. Your GitHub identity is bound using its numeric account ID. Editing your NanoFeed profile does not change that binding. Email and GitHub ID are shown as account information and cannot be edited in the profile form.

## Badges and verification

Profiles show every earned badge: Project Owner for the owner role, Verified Developer for verified accounts, and Verified Contributor for a successful contribution claim. In **Settings → Verification → Badge display**, use the up/down buttons and save your preferred order. Profiles show all earned badges in that order; posts, replies, search results, and follower/following lists show only the first badge. Without a saved preference, eligible badges appear in Owner, Developer, Contributor order; this is a default priority, not a record of which badge was earned first. Newly earned badges not in a saved order appear after the saved eligible badges, using the default order. Badges you no longer qualify for are hidden automatically. A badge is not a substitute for the platform's moderation rules.

For **Verified Developer**, open **Settings → Verification**, provide the requested details and a reason of at least 20 characters, and submit. The owner reviews requests; approval is not automatic. You can have only one pending request. The owner can close new developer applications; after verification is removed, a seven-day waiting period applies before reapplying.

For **Verified Contributor**, enter a commit SHA (at least seven hexadecimal characters) or a commit link from `https://github.com/nanofeed/nanofeed/commit/` in the same tab. The server checks that GitHub attributes the commit to the GitHub ID connected to your NanoFeed account and that it is on the official repository's default branch. A matching claim grants the badge automatically; a mismatch does not. GitHub attribution relies on commit metadata and is not cryptographic proof of authorship. Both owners and ordinary users can claim it. Claims are limited to five attempts per account per minute; wait a minute if you see a too-many-attempts message.

Existing contributors need to claim once. Your settings update after a successful claim; other viewers see current badges when they refresh author data. No six-hour contributor lookup is needed for posts or profiles. If GitHub reports expired authorization, sign out and sign in with GitHub again. Wait before retrying a rate-limit error. The contributor claim is separate from the owner-reviewed developer request.

For illustrated steps and the meaning of each badge, see [Badges and verification](BADGES.md).

## Restrictions and moderation

The owner can review reports and apply account restrictions. Read the restriction banner for your account's status. Restricted accounts cannot submit posts through the composer. Verification does not remove moderation requirements.

## Take a break

Find **Deactivate Account** in the account controls in Settings. Read the confirmation and type `deactivate` to confirm. Your profile and posts are hidden and you are signed out. Signing in again restores the account automatically.

## Delete your account

1. Open Settings and find **Delete My Account**.
2. Read the warning, wait for the confirmation timer, and type `delete my account`.
3. Confirm the request. You are signed out and a **30-day grace period** starts.
4. To cancel, sign in again with the same GitHub account **before the 30 days expire**. A pending deletion can also be cancelled with the Settings control when available.

After the grace period, sign-in cannot restore the account. Permanent removal is performed by the installation's scheduled cleanup job; an operator must keep that job running. Do not rely on a delayed cleanup run to extend the cancellation period.

## Understand what you share

Posts and public profile fields are visible to other people using the platform. Avoid posting passwords, tokens, private connection strings, or personal information you do not want public. See the site's [Privacy Policy](https://nanofeed.vercel.app/privacy) and [Terms](https://nanofeed.vercel.app/terms).

For sign-in problems, read [Troubleshooting](TROUBLESHOOTING.md). Operators should follow [Build and deploy](DEPLOYMENT.md) for database backups and the scheduled account cleanup configuration.
