<script setup lang="ts">
const props = defineProps<{ code: string; language: string }>()
const html = ref('')
const copyStatus = ref('Copy')
let generation = 0
async function highlight() {
  const current = ++generation
  html.value = ''
  try {
    const shiki = await import('shiki/bundle/full')
    const language = props.language.toLowerCase()
    const lang = Object.hasOwn(shiki.bundledLanguages, language)
      ? (language as keyof typeof shiki.bundledLanguages)
      : 'text'
    const result = await shiki.codeToHtml(props.code, { lang, theme: 'github-dark' })
    if (current === generation) html.value = result
  } catch {
    // The plain text fallback remains readable if a grammar cannot be loaded.
  }
}
onMounted(highlight)
watch(() => [props.code, props.language], highlight)
async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copyStatus.value = 'Copied'
  } catch {
    copyStatus.value = 'Copy failed'
  }
}
</script>

<template>
  <div class="code-block" @click.stop>
    <div class="code-toolbar">
      <span>{{ language }}</span
      ><button type="button" @click="copy">{{ copyStatus }}</button>
    </div>
    <!-- Shiki escapes code before emitting its own highlighting markup. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="html" v-html="html" />
    <pre v-else><code>{{ code }}</code></pre>
  </div>
</template>

<style src="~/assets/scss/components/post/CodeBlock.scss" lang="scss" scoped></style>
