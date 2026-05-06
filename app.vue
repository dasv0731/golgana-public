<script setup lang="ts">
import { buildOrganization, buildWebSite, injectSchema } from '~/composables/useSchema';

useHead({
  titleTemplate: (title) => title ? `${title} — Golgana` : 'Golgana — Fútbol con profundidad',
});

injectSchema([buildOrganization(), buildWebSite()]);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
