<!--
  app/layouts/default.vue
  NanoFeed — Main App Shell
-->
<script setup lang="ts">
import Sidebar from '../components/layout/Sidebar.vue'
import MobileNav from '../components/layout/MobileNav.vue'
import RestrictionBanner from '../components/layout/RestrictionBanner.vue'
import PostComposeModal from '../components/post/PostComposeModal.vue'
</script>

<template>
  <div class="nf-app-shell">
    <Sidebar />
    
    <main class="nf-main-content">
      <RestrictionBanner />
      <slot />
    </main>
    
    <MobileNav />
    
    <PostComposeModal />
  </div>
</template>

<style lang="scss" scoped>
.nf-app-shell {
  display: flex;
  min-height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
}

.nf-main-content {
  flex: 1;
  min-width: 0; // Essential for preventing text overflow from blowing out flex children
  overflow: hidden; // Safety net: prevent any animated element from escaping the column
  border-left: 1px solid $color-border-soft;
  border-right: 1px solid $color-border-soft;
  // Account for mobile nav at bottom on small screens
  @include max-sm {
    padding-bottom: 76px; // 60px nav + 16px buffer
    border-left: none;
    border-right: none;
  }
}
</style>
