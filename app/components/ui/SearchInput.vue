<!--
  app/components/ui/SearchInput.vue
  NanoFeed — Global Search Input component
-->
<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  placeholder?: string
  initialValue?: string
  compact?: boolean
  noRedirect?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
}>()

const router = useRouter()
const localQuery = ref(props.modelValue || props.initialValue || '')
const isFocused = ref(false)

// Sync with modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== undefined) localQuery.value = newVal
  },
)

watch(localQuery, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleSearch = () => {
  const q = localQuery.value.trim()
  emit('search', q)

  if (!props.noRedirect && q) {
    router.push({
      path: '/search',
      query: { q },
    })
  }
}

const clearSearch = () => {
  localQuery.value = ''
}
</script>

<template>
  <div class="nf-search-input" :class="{ 'is-focused': isFocused, 'is-compact': compact }">
    <div class="search-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </div>

    <input
      v-model="localQuery"
      type="text"
      :placeholder="placeholder || 'Search NanoFeed'"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keyup.enter="handleSearch"
    />

    <button v-if="localQuery" class="clear-btn" aria-label="Clear search" @click="clearSearch">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  </div>
</template>

<style src="~/assets/scss/components/ui/SearchInput.scss" lang="scss" scoped></style>
