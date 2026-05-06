<script setup lang="ts">
useHead({
  titleTemplate: (title) => title ? `${title} — Golgana` : 'Golgana — Fútbol con profundidad',
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
