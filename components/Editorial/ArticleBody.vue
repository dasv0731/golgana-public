<template>
  <div class="prose">
    <slot />
  </div>
</template>

<style>
.prose { max-width: 720px; margin: 0 auto; }
.prose h2 { font-family: var(--font-display); font-size: 32px; margin-top: 48px; }
.prose h3 { font-family: var(--font-display); font-size: 22px; margin-top: 32px; }
.prose p { font-size: 17px; line-height: 1.7; margin-top: 16px; }
.prose img { max-width: 100%; border-radius: 12px; margin: 24px 0; }
.prose blockquote { border-left: 4px solid var(--color-primary-green); padding: 8px 16px; font-style: italic; }
.prose strong { font-weight: 700; }
.prose ul, .prose ol { margin-top: 16px; padding-left: 24px; }
.prose li { font-size: 17px; line-height: 1.7; }
</style>
