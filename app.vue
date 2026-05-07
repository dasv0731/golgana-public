<script setup lang="ts">
import { buildOrganization, buildWebSite, injectSchema } from '~/composables/useSchema';

useHead({
  titleTemplate: (title) => title ? `${title} — Golgana` : 'Golgana — Fútbol con profundidad',
});

injectSchema([buildOrganization(), buildWebSite()]);

const { inject: injectGtm } = useGtm();
const consent = useState<string>('cookieConsent');

watch(consent, (val) => { if (val === 'granted') injectGtm(); });
onMounted(() => { if (consent.value === 'granted') injectGtm(); });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <CookieBanner />
</template>
