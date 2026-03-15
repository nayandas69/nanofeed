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
    <Navbar title="Privacy Policy" showBack />
    
    <div class="legal-content">
      <header class="legal-header">
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last Updated: March 15, 2026</p>
      </header>

      <section class="legal-section">
        <h2>1. Information We Collect</h2>
        <p>We collect minimal information necessary to provide our micro-social service:</p>
        <ul>
          <li><strong>Account Information</strong>: When you sign in via GitHub, we receive your public profile info (name, username, avatar) and your email address.</li>
          <li><strong>Content</strong>: We store any posts, replies, and reactions you create on the platform.</li>
          <li><strong>Usage Data</strong>: We may collect basic information about how you interact with the site to help us improve performance and security.</li>
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
        <p>We do not sell your personal data. We only share data with third parties when necessary to provide the service (e.g., database hosting on Neon, deployment on Vercel) or as required by law.</p>
      </section>

      <section class="legal-section">
        <h2>4. Security</h2>
        <p>We use industry-standard encryption and security protocols (PostgreSQL with SSL, Auth.js) to protect your data. However, no method of transmission over the internet is 100% secure.</p>
      </section>

      <section class="legal-section">
        <h2>5. Your Rights</h2>
        <p>You have the right to access, update, or request the deletion of your personal data. You can manage your profile settings directly through the application.</p>
      </section>

      <section class="legal-section">
        <h2>6. Contact Information</h2>
        <p>If you have any questions or concerns regarding your privacy, please contact us at: <a href="mailto:nayanchandradas@hotmail.com">nayanchandradas@hotmail.com</a></p>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-legal {
  min-height: 100vh;
  background-color: $color-bg;
}

.legal-content {
  max-width: $content-max-width;
  margin: 0 auto;
  padding: $space-8 $space-6;
  line-height: $line-height-relaxed;
}

.legal-header {
  margin-bottom: $space-8;
  border-bottom: 1px solid $color-border-soft;
  padding-bottom: $space-4;

  h1 {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    margin-bottom: $space-1;
  }

  .last-updated {
    font-size: $font-size-sm;
    color: $color-text-muted;
  }
}

.legal-section {
  margin-bottom: $space-8;

  h2 {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    margin-bottom: $space-3;
    color: $color-accent;
  }

  p {
    margin-bottom: $space-3;
    color: $color-text;
  }

  ul {
    padding-left: $space-5;
    color: $color-text;
    
    li {
      margin-bottom: $space-2;
    }
  }

  a {
    color: $color-accent;
    text-decoration: underline;
    &:hover {
      text-decoration: none;
    }
  }
}
</style>
