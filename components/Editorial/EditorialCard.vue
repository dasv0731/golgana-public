<script setup lang="ts">
defineProps<{
  kicker: string;
  title: string;
  href: string;
  meta?: string;
  image?: { src: string; alt: string };
  lead?: 'lead' | 'normal';
}>();
</script>

<template>
  <a :href="href" :class="['ed-card', lead === 'lead' ? 'ed-card--lead' : '']">
    <div v-if="image" class="ed-card__img"><img :src="image.src" :alt="image.alt" /></div>
    <div class="ed-card__body">
      <span class="ed-card__kicker">{{ kicker }}</span>
      <h3 class="ed-card__title">{{ title }}</h3>
      <span v-if="meta" class="ed-card__meta">{{ meta }}</span>
    </div>
  </a>
</template>
