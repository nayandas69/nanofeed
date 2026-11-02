<!--
  app/pages/terms.vue
  NanoFeed — Terms of Service
-->
<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue'

useSeoMeta({
  title: 'Terms of Service',
})
</script>

<template>
  <div class="page-legal">
    <Navbar title="Terms of Service" show-back />

    <div class="legal-content">
      <header class="legal-header">
        <h1>Terms of Service</h1>
        <p class="last-updated">Last Updated: March 15, 2026</p>
      </header>

      <section class="legal-section">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using NanoFeed, you agree to be bound by these Terms of Service. If you do
          not agree to all of these terms, do not use our services.
        </p>
      </section>

      <section class="legal-section">
        <h2>2. User Conduct</h2>
        <p>
          You are responsible for your use of the services and for any content you provide. You
          agree not to post content that is illegal, harmful, threatening, abusive, harassing,
          defamatory, or otherwise objectionable.
        </p>
        <ul>
          <li>No spamming or automated bot activity.</li>
          <li>No impersonating other users or entities.</li>
          <li>No attempting to circumvent account restrictions.</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>3. Content Ownership</h2>
        <p>
          You retain your rights to any content you submit, post, or display on NanoFeed. By
          submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use,
          copy, and distribute such content in connection with providing the services.
        </p>
      </section>

      <section class="legal-section">
        <h2>4. Account Verification</h2>
        <p>
          Verification badges are granted at the sole discretion of the project owner. We reserve
          the right to revoke verification at any time for any reason. If revoked, a 7-day cooldown
          applies before re-application.
        </p>
      </section>

      <section class="legal-section">
        <h2>5. Account Lifecycle</h2>
        <p>
          You have full control over the visibility and existence of your account through the
          application settings.
        </p>
        <ul>
          <li>
            <strong>Deactivation</strong>: You may temporarily deactivate your account to hide your
            profile and content. You can reactivate your account anytime by logging back in.
          </li>
          <li>
            <strong>Deletion</strong>: Requesting account deletion starts a 30-day grace period,
            during which your account is deactivated and hidden. If you do not log in within 30
            days, your account and all its data will be permanently deleted without the possibility
            of recovery.
          </li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>6. Termination</h2>
        <p>
          We may suspend or terminate your account at any time, with or without notice, if we
          believe you have violated these terms. Restricted accounts will lose the ability to post
          and interact with the community. Account deletion or deactivation cannot be used to
          circumvent a restriction.
        </p>
      </section>

      <section class="legal-section">
        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about these terms, please contact the project owner at:
          <a href="mailto:nayanchandradas@hotmail.com">nayanchandradas@hotmail.com</a>
        </p>
      </section>
    </div>
  </div>
</template>

<style src="~/assets/scss/pages/terms.scss" lang="scss" scoped></style>
