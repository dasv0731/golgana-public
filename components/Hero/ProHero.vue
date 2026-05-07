<script setup lang="ts">
defineProps<{
  kicker?: string;
  title: string;
  lead?: string;
  meta?: string[];
  bgGradient?: string;
}>();
</script>

<template>
  <section class="pro-hero">
    <div class="pro-hero__inner">
      <div class="pro-hero__main">
        <div
          class="pro-hero__bg"
          :style="bgGradient ? `background:${bgGradient}; z-index:0` : ''"
        />
        <span v-if="kicker" class="pro-hero__kicker">{{ kicker }}</span>
        <h1 class="pro-hero__title" v-html="title" />
        <p v-if="lead" class="pro-hero__lead">{{ lead }}</p>
        <div v-if="meta?.length" class="pro-hero__meta">
          <span v-for="m in meta" :key="m">{{ m }}</span>
        </div>
        <slot name="main-extra" />
      </div>
      <aside v-if="$slots.aside" class="pro-hero__side">
        <slot name="aside" />
      </aside>
    </div>
  </section>
</template>
