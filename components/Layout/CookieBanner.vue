<script setup lang="ts">
const consent = useState<'unknown' | 'granted' | 'denied'>('cookieConsent', () => 'unknown');

onMounted(() => {
  const stored = localStorage.getItem('cookie-consent');
  if (stored === 'granted' || stored === 'denied') consent.value = stored;
});

const grant = () => {
  consent.value = 'granted';
  localStorage.setItem('cookie-consent', 'granted');
};
const deny = () => {
  consent.value = 'denied';
  localStorage.setItem('cookie-consent', 'denied');
};
</script>

<template>
  <div
    v-if="consent === 'unknown'"
    style="position:fixed;bottom:24px;left:24px;right:24px;max-width:560px;background:#0a0a0a;color:#fff;padding:20px 24px;border-radius:12px;z-index:1000;box-shadow:0 16px 48px rgba(0,0,0,0.4)"
  >
    <p style="margin:0;font-size:14px;line-height:1.5">
      Usamos cookies para analítica de uso (GA4) y mejorar la experiencia. Puedes aceptar o rechazar.
    </p>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button @click="deny" style="padding:8px 16px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:8px;cursor:pointer">Rechazar</button>
      <button @click="grant" style="padding:8px 16px;background:var(--color-primary-green);color:#fff;border:0;border-radius:8px;cursor:pointer">Aceptar</button>
    </div>
  </div>
</template>
