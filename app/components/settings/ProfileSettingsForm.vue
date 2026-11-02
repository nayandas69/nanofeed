<!--
  app/components/settings/ProfileSettingsForm.vue
  NanoFeed — Edit Profile Settings
-->
<script setup lang="ts">
import UiInput from '../ui/Input.vue'
import UiButton from '../ui/Button.vue'
import AvatarUploader from './AvatarUploader.vue'
import AccountDangerZone from './AccountDangerZone.vue'
import { validateDisplayName, validateUsername, validateBio } from '../../utils/validation'
import type { UpdateUserInput } from '#shared/types/user'
import { USERNAME_MAX_LENGTH, BIO_MAX_LENGTH } from '../../utils/constants'

const { user, updateProfile, isLoading, error: apiError, ready } = useUser()
await ready
const router = useRouter()

// Form State
const formData = reactive({
  displayName: '',
  username: '',
  avatar: '',
  bio: '',
})

// Validation State
const errors = reactive({
  displayName: null as string | null,
  username: null as string | null,
  bio: null as string | null,
  submit: null as string | null,
})

// Initialize form when user data loads
watchEffect(() => {
  if (user.value) {
    formData.displayName = user.value.displayName || ''
    formData.username = user.value.username || ''
    formData.avatar = user.value.avatar || ''
    formData.bio = user.value.bio || ''
  }
})

// Has changes?
const isDirty = computed(() => {
  if (!user.value) return false
  return (
    formData.displayName !== user.value.displayName ||
    formData.username !== user.value.username ||
    formData.avatar !== user.value.avatar ||
    (formData.bio || '') !== (user.value.bio || '')
  )
})

const onSubmit = async () => {
  // Clear previous errors
  errors.displayName = null
  errors.username = null
  errors.submit = null

  // Validate all fields client-side first
  errors.displayName = validateDisplayName(formData.displayName)
  errors.username = validateUsername(formData.username)
  errors.bio = validateBio(formData.bio)

  if (errors.displayName || errors.username || errors.bio) return

  // Build payload (only send changed fields)
  const payload: UpdateUserInput = {}
  if (formData.displayName !== user.value?.displayName) payload.displayName = formData.displayName
  if (formData.username !== user.value?.username) payload.username = formData.username
  if (formData.avatar !== user.value?.avatar) payload.avatar = formData.avatar
  if (formData.bio !== (user.value?.bio || '')) payload.bio = formData.bio

  try {
    await updateProfile(payload)
    if (!apiError.value) {
      // Success! Nav to profile
      router.push(`/profile/${user.value?.username}`)
    } else {
      errors.submit = String(apiError.value)
    }
  } catch {
    errors.submit = 'An unexpected error occurred building the profile.'
  }
}
</script>

<template>
  <div v-if="user" class="nf-profile-settings">
    <form class="settings-form" @submit.prevent="onSubmit">
      <!-- Avatar -->
      <div class="form-section">
        <h3 class="section-title">Profile Picture</h3>
        <AvatarUploader v-model="formData.avatar" :github-id="user.githubId" />
      </div>

      <div class="divider" />

      <!-- General Info -->
      <div class="form-section">
        <h3 class="section-title">Public Identity</h3>

        <UiInput
          v-model="formData.displayName"
          label="Display Name"
          :error="errors.displayName"
          required
        />

        <UiInput
          v-model="formData.username"
          label="Username"
          :error="errors.username"
          :maxlength="USERNAME_MAX_LENGTH"
          required
        />

        <UiInput
          v-model="formData.bio"
          label="Bio"
          type="textarea"
          :error="errors.bio"
          :maxlength="BIO_MAX_LENGTH"
          placeholder="Tell the world about yourself..."
        />
      </div>

      <div class="divider" />

      <!-- Immutable Info -->
      <div class="form-section immutable-section">
        <h3 class="section-title">Account Information</h3>
        <p class="info-text">
          These fields are tied to your GitHub account and cannot be changed here.
        </p>

        <div class="immutable-fields">
          <div class="field-row">
            <span class="label">Email:</span>
            <span class="value">{{ user.email }}</span>
          </div>
          <div class="field-row">
            <span class="label">GitHub ID:</span>
            <span class="value">{{ user.githubId }}</span>
          </div>
        </div>
      </div>

      <!-- Errors & Submit -->
      <div class="submit-section">
        <div v-if="errors.submit" class="submit-error">
          {{ errors.submit }}
        </div>

        <div class="actions">
          <NuxtLink :to="`/profile/${user.username}`">
            <UiButton type="button" variant="ghost">Cancel</UiButton>
          </NuxtLink>
          <UiButton type="submit" variant="primary" :disabled="!isDirty" :loading="isLoading">
            Save Changes
          </UiButton>
        </div>
      </div>
    </form>

    <div class="divider section-divider" />

    <!-- Danger Zone (Account Lifecycle) -->
    <div class="form-section danger-section">
      <div class="danger-header">
        <h3 class="section-title">Account Management</h3>
        <p class="info-text">
          Manage your account status. These actions affect your visibility and access to NanoFeed.
        </p>
      </div>
      <AccountDangerZone />
    </div>
  </div>
  <div v-else class="loading-state">
    <div class="spinner" />
  </div>
</template>

<style src="~/assets/scss/components/settings/ProfileSettingsForm.scss" lang="scss" scoped></style>
