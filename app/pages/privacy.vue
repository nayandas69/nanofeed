<!--
  app/pages/privacy.vue
  NanoFeed — Privacy Policy
-->
<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue'

useSeoMeta({
  title: 'Privacy Policy',
})
</script>

<template>
  <div class="page-legal">
    <Navbar title="Privacy Policy" show-back />

    <div class="legal-content">
      <header class="legal-header">
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last Updated: October 29, 2026</p>
      </header>

      <section class="legal-section">
        <h2>1. Information We Collect</h2>
        <p>We collect minimal information necessary to provide our micro-social service:</p>
        <ul>
          <li>
            <strong>Account Information</strong>: When you sign in via GitHub, we receive your
            public profile info (name, username, avatar) and your email address.
          </li>
          <li>
            <strong>Content</strong>: We store any posts, replies, and reactions you create on the
            platform.
          </li>
          <li>
            <strong>Usage Data</strong>: We may collect basic information about how you interact
            with the site to help us improve performance and security.
          </li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>2. How We Use Your Data</h2>
        <p>Your information is used solely to:</p>
        <ul>
          <li>Maintain your user profile.</li>
          <li>Allow you to post and interact with other users.</li>
          <li>Facilitate the account verification process.</li>
          <li>Inform you about account-related updates or moderation actions.</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>3. Data Sharing</h2>
        <p>
          We do not sell your personal data. We only share data with third parties when necessary to
          provide the service (e.g., database hosting on Neon, deployment on Vercel) or as required
          by law.
        </p>
      </section>

      <section class="legal-section">
        <h2>4. Security</h2>
        <p>
          The For you feed uses your follows and recent post/reaction hashtags to rank visible
          content. For signed-in users, short-lived feed snapshots store post identifiers and
          ranking explanations and expire after 30 minutes. Expired snapshots are cleaned up during
          feed requests, at most once every five minutes, with daily cleanup as a fallback. Guest
          recommendations do not create stored snapshots. We do not send these signals to an
          external recommendation service. Choose Latest to view posts chronologically.
        </p>
        <p>
          We use industry-standard encryption and security protocols (PostgreSQL with SSL, Better
          Auth) to protect your data. However, no method of transmission over the internet is 100%
          secure.
        </p>
      </section>

      <section class="legal-section">
        <h2>5. Your Rights & Account Lifecycle</h2>
        <p>
          You have the right to access, update, deactivate, or request the deletion of your personal
          data through your application settings.
        </p>
        <ul>
          <li>
            <strong>Deactivation</strong>: Instantly hides your profile and content from the public
            without deleting your data. Logging back in will securely and automatically restore your
            account.
          </li>
          <li>
            <strong>Account Deletion</strong>: Scheduling an account for deletion initiates a strict
            30-day grace period. During these 30 days, your content is hidden, and you can cancel
            the deletion simply by logging back in. After the 30-day window expires, your account
            and all associated data are permanently and irreversibly purged from our servers.
          </li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>6. Contact Information</h2>
        <p>
          If you have any questions or concerns regarding your privacy, please contact us at:
          <a href="mailto:nayanchandradas@hotmail.com">nayanchandradas@hotmail.com</a>
        </p>
      </section>
    </div>
  </div>
</template>

<style src="~/assets/scss/pages/privacy.scss" lang="scss" scoped></style>
