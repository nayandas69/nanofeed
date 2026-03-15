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

const props = withDefaults(defineProps<Props>(), {
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
        @input="onInput"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        class="nf-input nf-textarea"
        :class="{ 'has-error': error }"
        rows="4"
      />
    </template>
    <template v-else>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="onInput"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        class="nf-input"
        :class="{ 'has-error': error }"
      />
    </template>

    <div v-if="error" class="nf-error">{{ error }}</div>
    <div v-else-if="maxlength" class="nf-hint">
      {{ String(modelValue).length }} / {{ maxlength }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nf-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  width: 100%;
}

.nf-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text;

  .required-mark {
    color: $color-danger;
    margin-left: 2px;
  }
}

.nf-input {
  width: 100%;
  padding: $space-3 $space-4;
  background-color: $color-bg;
  border: 1px solid $color-border-soft;
  border-radius: $radius-md;
  color: $color-text;
  font-size: $font-size-base;
  @include hover-transition(border-color);

  &::placeholder {
    color: $color-text-muted;
  }

  &:focus {
    outline: none;
    border-color: $color-accent;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: $color-surface-2;
  }

  &.has-error {
    border-color: $color-danger;
  }

  &.nf-textarea {
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
  }
}

.nf-error {
  color: $color-danger;
  font-size: $font-size-xs;
}

.nf-hint {
  color: $color-text-muted;
  font-size: $font-size-xs;
  text-align: right;
}
</style>
