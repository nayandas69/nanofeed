<!--
  app/pages/settings.vue
  NanoFeed — User Settings Page
-->
<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue'
import UiButton from '../components/ui/Button.vue'
import ProfileSettingsForm from '../components/settings/ProfileSettingsForm.vue'
import { ref } from 'vue'

definePageMeta({
  middleware: 'auth', // Ensure user is logged in
})

const { user, isVerified, isOwner } = useNanoAuth()
const { verificationStatus, submitRequest, isSubmitting, error: verifyError } = useVerification()

const activeTab = ref<'profile' | 'verification'>('profile')

// Provide a default real name and reason structure for the form
const verifyForm = reactive({
  realName: '',
  reason: '',
  email: user.value?.email || ''
})

const submitVerify = async () => {
  const success = await submitRequest(verifyForm)
  if (success) {
    verifyForm.realName = ''
    verifyForm.reason = ''
  }
}

// Cooldown Calculation
const cooldownDays = computed(() => {
  const vStatus = verificationStatus.value as any
  if (!vStatus?.verificationRemovedAt) return 0
  
  const removedAt = new Date(vStatus.verificationRemovedAt)
  const now = new Date()
  const diffTime = now.getTime() - removedAt.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
  if (diffDays < 7) {
    return Math.ceil(7 - diffDays)
  }
  return 0
})

const inCooldown = computed(() => cooldownDays.value > 0)
</script>

<template>
  <div class="page-settings">
    <Navbar title="Settings" showBack />

    <!-- Settings Tabs -->
    <div class="settings-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'profile' }"
        @click="activeTab = 'profile'"
      >
        Profile
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'verification' }"
        @click="activeTab = 'verification'"
      >
        Verification
      </button>
    </div>

    <!-- Profile Tab -->
    <div v-show="activeTab === 'profile'" class="tab-content">
      <ProfileSettingsForm />
    </div>

    <!-- Verification Tab -->
    <div v-show="activeTab === 'verification'" class="tab-content">
      <div class="verification-panel">

        <template v-if="isOwner">
          <div class="status-box verified">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="icon"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg>
            <div class="text-content">
              <h3>Project Owner</h3>
              <p>You have the highest level of administrative privileges.</p>
            </div>
          </div>
        </template>

        <template v-else-if="isVerified">
          <div class="status-box verified">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="icon"><path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10.5 16.5L6.5 12.5L7.9 11.1L10.5 13.7L16.6 7.6L18 9L10.5 16.5Z"/></svg>
            <div class="text-content">
              <h3>You are Verified</h3>
              <p>You have a verified developer badge on your profile.</p>
            </div>
          </div>
        </template>

        <template v-else-if="(verificationStatus as any)?.request?.status === 'PENDING'">
          <div class="status-box pending">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div class="text-content">
              <h3>Application Pending</h3>
              <p>Your verification request is currently being reviewed by administrators.</p>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="status-box none">
            <div class="text-content">
              <h3>Request Verification</h3>
              <p>Let people know you are an authentic developer in the community.</p>
            </div>
          </div>

          <form @submit.prevent="submitVerify" class="verification-form">
            <div v-if="inCooldown" class="cooldown-notice">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Verification removed. You can re-apply in <strong>{{ cooldownDays }} days</strong>.</span>
            </div>

            <div v-if="(verificationStatus as any)?.request?.status === 'REJECTED' && !inCooldown" class="error-notice">
              Your previous request was not approved. You may submit a new one with more details.
            </div>

            <UiInput
              v-model="verifyForm.realName"
              label="Legal Full Name"
              required
              placeholder="e.g. Linus Torvalds"
            />

            <UiInput
              v-model="verifyForm.reason"
              label="Why should you be verified?"
              type="textarea"
              required
              placeholder="Links to your open source projects, portfolio, etc."
            />

            <div v-if="verifyError" class="error-msg">{{ verifyError }}</div>

            <UiButton 
              type="submit" 
              variant="primary" 
              :disabled="!verifyForm.realName || !verifyForm.reason || inCooldown"
              :loading="isSubmitting"
            >
              {{ inCooldown ? 'Cooldown Active' : 'Submit Request' }}
            </UiButton>
          </form>
        </template>

      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-tabs {
  display: flex;
  border-bottom: 1px solid $color-border-soft;
  
  .tab-btn {
    flex: 1;
    padding: $space-3 $space-4;
    background: transparent;
    border: none;
    color: $color-text-muted;
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    cursor: pointer;
    position: relative;
    @include hover-transition(background-color);

    &:hover {
      background-color: $color-surface-2;
    }

    &.active {
      color: $color-text;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background-color: $color-accent;
        border-radius: $radius-full $radius-full 0 0;
      }
    }
  }
}

.verification-panel {
  padding: $space-4;
  display: flex;
  flex-direction: column;
  gap: $space-6;
}

.status-box {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-4;
  border-radius: $radius-md;

  h3 { margin: 0 0 $space-1 0; font-size: $font-size-lg; }
  p { margin: 0; font-size: $font-size-sm; opacity: 0.9; }

  &.verified {
    background-color: rgba($color-success, 0.1);
    color: $color-success;
    border: 1px solid rgba($color-success, 0.2);
  }

  &.pending {
    background-color: rgba($color-warning, 0.1);
    color: $color-warning;
    border: 1px solid rgba($color-warning, 0.2);
  }

  &.none {
    background-color: $color-surface-2;
    color: $color-text;
    border: 1px solid $color-border-soft;
  }
}

.verification-form {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  .error-notice, .cooldown-notice {
    padding: $space-3;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  .error-notice {
    background-color: rgba($color-danger, 0.1);
    color: $color-danger;
  }

  .cooldown-notice {
    background-color: rgba($color-warning, 0.1);
    color: $color-warning;
    border: 1px solid rgba($color-warning, 0.2);
  }
  
  .error-msg {
    color: $color-danger;
    font-size: $font-size-sm;
  }
}
</style>
