<script setup lang="ts">
const props = defineProps<{ html: string }>()
const contentRoot = ref<HTMLElement | null>(null)
const copyStatus = ref('')

async function highlightCode() {
  await nextTick()
  const blocks = contentRoot.value?.querySelectorAll<HTMLElement>('.docs-code-block')
  if (!blocks?.length) return
  try {
    const shiki = await import('shiki/bundle/full')
    await Promise.all(
      Array.from(blocks, async (block) => {
        const pre = block.querySelector('pre')
        const code = pre?.querySelector('code')
        if (!pre || !code) return
        const language =
          block.querySelector('.code-toolbar span')?.textContent?.toLowerCase() || 'text'
        const lang = Object.hasOwn(shiki.bundledLanguages, language)
          ? (language as keyof typeof shiki.bundledLanguages)
          : 'text'
        const highlighted = await shiki.codeToHtml(code.textContent || '', {
          lang,
          theme: 'github-dark',
        })
        if (pre.isConnected) pre.outerHTML = highlighted
      }),
    )
  } catch {
    // Keep the original escaped code if highlighting is unavailable.
  }
}
onMounted(highlightCode)
watch(() => props.html, highlightCode)

async function copyCode(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return
  const button = target.closest<HTMLButtonElement>('button.copy-code')
  const code = button?.closest('.docs-code-block')?.querySelector('pre code')
  if (!button || !code || button.disabled) return
  button.disabled = true
  copyStatus.value = ''
  try {
    await navigator.clipboard.writeText(code.textContent || '')
    button.textContent = 'Copied'
    copyStatus.value = 'Code copied to clipboard.'
  } catch {
    button.textContent = 'Retry copy'
    copyStatus.value = 'Clipboard unavailable. Select the code and copy it manually.'
  } finally {
    button.disabled = false
  }
}
</script>

<template>
  <div>
    <!-- Repository Markdown only; raw HTML and unsafe URLs are disabled by the compiler. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div ref="contentRoot" class="docs-prose" @click="copyCode" v-html="html" />
    <p role="status" class="copy-status">{{ copyStatus }}</p>
  </div>
</template>

<style src="~/assets/scss/components/docs/Content.scss" lang="scss" scoped></style>
