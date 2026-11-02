<script setup lang="ts">
import { maintenanceCountdown } from '../../utils/maintenanceCountdown'

const props = defineProps<{ message: string; endsAt?: string | Date | null }>()
const { user, isOwner } = useNanoAuth()
const now = ref<number | null>(null)
const countdown = computed(() =>
  props.endsAt && now.value !== null ? maintenanceCountdown(props.endsAt, now.value) : null,
)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
const pad = (value: number) => String(value).padStart(2, '0')
</script>

<template>
  <div class="maintenance-screen">
    <div class="maintenance-shell">
      <div class="brand">
        <span class="brand-mark">n<span>f</span></span> nanofeed
      </div>
      <main class="maintenance-card">
        <div class="illustration" aria-hidden="true">
          <span class="orbit orbit-one" /><span class="orbit orbit-two" />
          <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
            <path
              d="M20 44 43 21M38 13a10 10 0 0 0 12 13L29 47a7 7 0 1 1-10-10l21-21a10 10 0 0 0-2-3Z"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="23" cy="42" r="2" fill="currentColor" />
          </svg>
        </div>
        <div class="eyebrow"><span /> Scheduled maintenance</div>
        <h1>We’ll be back soon.</h1>
        <p class="message">{{ message }}</p>
        <div v-if="countdown && !countdown.expired" class="countdown-area">
          <p class="caption">Estimated time remaining</p>
          <div class="countdown" aria-label="Estimated time remaining">
            <div>
              <strong>{{ pad(countdown.days) }}</strong
              ><span>days</span>
            </div>
            <b>:</b>
            <div>
              <strong>{{ pad(countdown.hours) }}</strong
              ><span>hours</span>
            </div>
            <b>:</b>
            <div>
              <strong>{{ pad(countdown.minutes) }}</strong
              ><span>minutes</span>
            </div>
            <b>:</b>
            <div>
              <strong>{{ pad(countdown.seconds) }}</strong
              ><span>seconds</span>
            </div>
          </div>
        </div>
        <p v-else-if="countdown?.expired" class="estimate">
          The estimated time has passed. We’re still working on it.
        </p>
        <p v-else-if="!endsAt" class="estimate">We’ll share an update as soon as we can.</p>
        <nav class="actions" aria-label="Available pages">
          <NuxtLink
            v-if="user"
            class="primary"
            :to="`/profile/${encodeURIComponent(user.username)}`"
            >View my profile <span aria-hidden="true">→</span></NuxtLink
          >
          <NuxtLink v-else class="primary" to="/auth/login"
            >Sign in <span aria-hidden="true">→</span></NuxtLink
          >
          <NuxtLink v-if="isOwner" class="secondary" to="/dashboard">Owner dashboard</NuxtLink>
        </nav>
        <p class="note">Thanks for your patience while we make things better.</p>
      </main>
      <footer>Made for the developer circle <span>✦</span></footer>
    </div>
  </div>
</template>

<style src="~/assets/scss/components/maintenance/MaintenanceScreen.scss" lang="scss" scoped></style>
