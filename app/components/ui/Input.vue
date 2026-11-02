<!--
  app/components/ui/Input.vue
  NanoFeed — Reusable Input Component
-->
<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string | null
  disabled?: boolean
  required?: boolean
  maxlength?: number
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  maxlength: undefined,
  type: 'text',
  placeholder: '',
  error: null,
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

// Generate unique ID for label binding
const id = useId()
</script>

<template>
  <div class="nf-input-wrapper">
    <label v-if="label" :for="id" class="nf-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>

    <template v-if="type === 'textarea'">
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        class="nf-input nf-textarea"
        :class="{ 'has-error': error }"
        rows="4"
        @input="onInput"
      />
    </template>
    <template v-else>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        class="nf-input"
        :class="{ 'has-error': error }"
        @input="onInput"
      />
    </template>

    <div v-if="error" class="nf-error">{{ error }}</div>
    <div v-else-if="maxlength" class="nf-hint">
      {{ String(modelValue).length }} / {{ maxlength }}
    </div>
  </div>
</template>

<style src="~/assets/scss/components/ui/Input.scss" lang="scss" scoped></style>
