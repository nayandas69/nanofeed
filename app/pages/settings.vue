<!--
  app/pages/settings.vue
  NanoFeed — User Settings Page
-->
<script setup lang="ts">
import Navbar from '../components/layout/Navbar.vue'
import UiButton from '../components/ui/Button.vue'
import ProfileSettingsForm from '../components/settings/ProfileSettingsForm.vue'
import BadgeSettingsForm from '../components/settings/BadgeSettingsForm.vue'
import { ref } from 'vue'

definePageMeta({
  middleware: 'auth',
})

const { user, isVerified, isOwner } = useNanoAuth()
const {
  verificationStatus,
  submitRequest,
  isSubmitting,
  error: verifyError,
  refreshStatus,
} = useVerification()

const contributorCommit = ref('')
const contributorSubmitting = ref(false)
const contributorMessage = ref('')
const contributorError = ref('')
const submitContributor = async () => {
  contributorSubmitting.value = true
  contributorError.value = ''
  contributorMessage.value = ''
  try {
    await $fetch('/api/verification/contributor', {
      method: 'POST',
      body: { commit: contributorCommit.value },
    })
    contributorMessage.value = 'Your contributor badge has been granted.'
    await Promise.all([refreshStatus(), refreshNuxtData('current-user-profile')])
  } catch (error: unknown) {
    contributorError.value =
      (error as { data?: { statusMessage?: string } }).data?.statusMessage ||
      'Could not verify the commit. Please try again.'
  } finally {
    contributorSubmitting.value = false
  }
}

const activeTab = ref<'profile' | 'verification'>('profile')

// Provide a default real name and reason structure for the form
const verifyForm = reactive({
  realName: '',
  reason: '',
  email: user.value?.email || '',
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
  const vStatus = verificationStatus.value
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
    <Navbar title="Settings" show-back />

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
        <BadgeSettingsForm />
        <section class="contributor-panel" aria-labelledby="contributor-title">
          <h2 id="contributor-title">Verified Contributor</h2>
          <p>
            Submit a commit you authored on the default branch of nanofeed/nanofeed using the GitHub
            account connected to NanoFeed.
          </p>
          <p v-if="verificationStatus?.contributor" role="status">
            You have the Verified Contributor badge.
          </p>
          <form v-else @submit.prevent="submitContributor">
            <label for="contributor-commit">Commit SHA or GitHub link</label>
            <input
              id="contributor-commit"
              v-model="contributorCommit"
              required
              maxlength="150"
              autocomplete="off"
            />
            <UiButton
              type="submit"
              :loading="contributorSubmitting"
              :disabled="contributorSubmitting"
              >Verify contribution</UiButton
            >
          </form>
          <p v-if="contributorMessage" role="status">{{ contributorMessage }}</p>
          <p v-if="contributorError" role="alert">{{ contributorError }}</p>
        </section>
        <template v-if="isOwner">
          <div class="status-box verified">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon"
            >
              <path
                d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"
              />
            </svg>
            <div class="text-content">
              <h3>Project Owner</h3>
              <p>You have the highest level of administrative privileges.</p>
            </div>
          </div>
        </template>

        <template v-else-if="isVerified">
          <div class="status-box verified">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon"
            >
              <path
                d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM10.5 16.5L6.5 12.5L7.9 11.1L10.5 13.7L16.6 7.6L18 9L10.5 16.5Z"
              />
            </svg>
            <div class="text-content">
              <h3>You are Verified</h3>
              <p>You have a verified developer badge on your profile.</p>
            </div>
          </div>
        </template>

        <template v-else-if="verificationStatus?.request?.status === 'PENDING'">
          <div class="status-box pending">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div class="text-content">
              <h3>Application Pending</h3>
              <p>Your verification request is currently being reviewed by administrators.</p>
            </div>
          </div>
        </template>

        <template v-else-if="verificationStatus && !verificationStatus.requestsEnabled">
          <div class="status-box pending">
            <div class="text-content">
              <h3>Applications closed</h3>
              <p>Verification requests are currently closed. Please check back later.</p>
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

          <form class="verification-form" @submit.prevent="submitVerify">
            <div v-if="inCooldown" class="cooldown-notice">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span
                >Verification removed. You can re-apply in
                <strong>{{ cooldownDays }} days</strong>.</span
              >
            </div>

            <div
              v-if="verificationStatus?.request?.status === 'REJECTED' && !inCooldown"
              class="error-notice"
            >
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

<style src="~/assets/scss/pages/settings.scss" lang="scss" scoped></style>
