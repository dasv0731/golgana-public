<script setup lang="ts">
defineProps<{
  cols?: 3 | 4 | 6 | 8 | 12;
  variant?: 'default' | 'dark' | 'green';
  href?: string;
  kicker?: string;
  title?: string;
}>();
</script>

<template>
  <component
    :is="href ? 'a' : 'article'"
    :href="href"
    :class="[
      'tile',
      cols ? `b-c${cols}` : '',
      variant === 'dark' ? 'tile--dark' : '',
      variant === 'green' ? 'tile--green' : '',
    ]"
  >
    <span v-if="kicker" class="tile__kicker">{{ kicker }}</span>
    <h3 v-if="title" class="tile__title">{{ title }}</h3>
    <slot />
  </component>
</template>
