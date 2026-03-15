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
    <Navbar title="Terms of Service" showBack />
    
    <div class="legal-content">
      <header class="legal-header">
        <h1>Terms of Service</h1>
        <p class="last-updated">Last Updated: March 15, 2026</p>
      </header>

      <section class="legal-section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using NanoFeed, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>
      </section>

      <section class="legal-section">
        <h2>2. User Conduct</h2>
        <p>You are responsible for your use of the services and for any content you provide. You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.</p>
        <ul>
          <li>No spamming or automated bot activity.</li>
          <li>No impersonating other users or entities.</li>
          <li>No attempting to circumvent account restrictions.</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>3. Content Ownership</h2>
        <p>You retain your rights to any content you submit, post, or display on NanoFeed. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, and distribute such content in connection with providing the services.</p>
      </section>

      <section class="legal-section">
        <h2>4. Account Verification</h2>
        <p>Verification badges are granted at the sole discretion of the project owner. We reserve the right to revoke verification at any time for any reason. If revoked, a 7-day cooldown applies before re-application.</p>
      </section>

      <section class="legal-section">
        <h2>5. Termination</h2>
        <p>We may suspend or terminate your account at any time, with or without notice, if we believe you have violated these terms. Restricted accounts will lose the ability to post and interact with the community.</p>
      </section>

      <section class="legal-section">
        <h2>6. Contact Us</h2>
        <p>If you have any questions about these terms, please contact the project owner at: <a href="mailto:nayanchandradas@hotmail.com">nayanchandradas@hotmail.com</a></p>
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
