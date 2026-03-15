<!--
  app/layouts/blank.vue
  NanoFeed — Blank layout for auth pages
-->
<template>
  <div class="nf-blank-layout">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.nf-blank-layout {
  min-height: 100vh;
  background-color: $color-bg;
}
</style>
