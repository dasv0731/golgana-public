<script setup lang="ts">
defineProps<{
  cols?: 3 | 4 | 6 | 8 | 12;
  href?: string;
  kicker?: string;
  title: string;
  meta?: string;
  image: { src: string; alt: string };
  wide?: boolean;
}>();
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    :class="['media-tile', wide ? 'media-tile--wide' : '', cols ? `b-c${cols}` : '']"
  >
    <img :src="image.src" :alt="image.alt" />
    <div class="media-tile__body">
      <span v-if="kicker" class="media-tile__kicker">{{ kicker }}</span>
      <h3 class="media-tile__title">{{ title }}</h3>
      <span v-if="meta" class="media-tile__meta">{{ meta }}</span>
    </div>
  </component>
</template>
