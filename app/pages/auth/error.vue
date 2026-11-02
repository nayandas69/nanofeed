<!--
  app/pages/auth/error.vue
  NanoFeed — Better Auth Error Redirect Target
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-shield-alert"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>

      <h1>Sign In Failed</h1>
      <p class="error-msg">{{ errorMessage }}</p>

      <p v-if="errorType" class="technical">
        Error Code: <code>{{ errorType }}</code>
      </p>

      <NuxtLink to="/auth/login">
        <UiButton variant="primary" size="lg">Try Again</UiButton>
      </NuxtLink>
    </div>
  </div>
</template>

<style src="~/assets/scss/pages/auth/error.scss" lang="scss" scoped></style>
