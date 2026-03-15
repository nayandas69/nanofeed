<!--
  app/pages/auth/error.vue
  NanoFeed — Auth.js Error Redirect Target
-->
<script setup lang="ts">
import UiButton from '../../components/ui/Button.vue'

definePageMeta({
  layout: 'blank',
})

const route = useRoute()
const errorType = computed(() => route.query.error as string)

const errorMessage = computed(() => {
  switch (errorType.value) {
    case 'AccessDenied':
      return 'Access Denied. Did you cancel the sign-in?'
    case 'Configuration':
      return 'There is a problem with the server configuration.'
    case 'Verification':
      return 'The verification token has expired or has already been used.'
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'EmailCreateAccount':
    case 'Callback':
    case 'OAuthAccountNotLinked':
    case 'EmailSignin':
    case 'CredentialsSignin':
    case 'SessionRequired':
    default:
      return 'An unexpected authentication error occurred.'
  }
})
</script>

<template>
  <div class="page-auth-error">
    <div class="error-container">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
      </div>
      
      <h1>Sign In Failed</h1>
      <p class="error-msg">{{ errorMessage }}</p>
      
      <p class="technical" v-if="errorType">
        Error Code: <code>{{ errorType }}</code>
      </p>

      <NuxtLink to="/auth/login">
        <UiButton variant="primary" size="lg">Try Again</UiButton>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-auth-error {
  @include flex-center;
  min-height: 100vh;
  padding: $space-4;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $space-4;
  max-width: 400px;
  
  .icon {
    color: $color-danger;
  }

  h1 {
    font-size: $font-size-2xl;
    margin: 0;
  }

  .error-msg {
    font-size: $font-size-lg;
    color: $color-text-muted;
    margin: 0;
  }

  .technical {
    font-size: $font-size-sm;
    color: $color-text-muted;
    background-color: $color-surface-2;
    padding: $space-2 $space-4;
    border-radius: $radius-md;
    
    code {
      font-family: $font-mono;
      color: $color-danger;
    }
  }
  
  a {
    margin-top: $space-4;
  }
}
</style>
