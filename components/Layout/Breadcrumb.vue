<script setup lang="ts">
defineProps<{
  crumbs: Array<{ label: string; to?: string }>;
}>();
</script>

<template>
  <nav class="pcrumb" aria-label="Breadcrumb">
    <template v-for="(c, i) in crumbs" :key="i">
      <NuxtLink v-if="c.to" :to="c.to">{{ c.label }}</NuxtLink>
      <span v-else aria-current="page">{{ c.label }}</span>
      <span v-if="i < crumbs.length - 1" class="pcrumb__sep">/</span>
    </template>
  </nav>
</template>
