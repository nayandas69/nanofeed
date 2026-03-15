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
  'search': [value: string]
}>()

const router = useRouter()
const localQuery = ref(props.modelValue || props.initialValue || '')
const isFocused = ref(false)

// Sync with modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) localQuery.value = newVal
})

watch(localQuery, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleSearch = () => {
  const q = localQuery.value.trim()
  emit('search', q)
  
  if (!props.noRedirect && q) {
    router.push({
      path: '/search',
      query: { q }
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
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    </div>
    
    <input 
      v-model="localQuery"
      type="text" 
      :placeholder="placeholder || 'Search NanoFeed'"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keyup.enter="handleSearch"
    />

    <button v-if="localQuery" class="clear-btn" @click="clearSearch" aria-label="Clear search">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.nf-search-input {
  display: flex;
  align-items: center;
  gap: $space-2;
  background-color: $color-surface-2;
  border: 1px solid transparent;
  padding: 0 $space-4;
  height: 42px;
  border-radius: $radius-full;
  @include hover-transition(all);
  width: 100%;

  &:hover {
    background-color: $color-surface-3;
  }

  &.is-focused {
    background-color: $color-bg;
    border-color: $color-accent;
    box-shadow: 0 0 0 1px $color-accent;
  }

  &.is-compact {
    height: 36px;
    padding: 0 $space-3;
  }

  .search-icon {
    color: $color-text-muted;
    @include flex-center;
  }

  input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: $color-text;
    font-size: $font-size-sm;
    height: 100%;
    width: 100%;

    &::placeholder {
      color: $color-text-muted;
    }
  }

  .clear-btn {
    @include flex-center;
    color: $color-bg;
    background-color: $color-accent;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    @include hover-transition(opacity);

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
