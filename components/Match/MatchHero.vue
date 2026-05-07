<script setup lang="ts">
import type { Partido } from '~/types/api';

const props = defineProps<{
  partido: Partido;
}>();

const isFinished = props.partido.estado === 'finished';
const isLive = props.partido.estado === 'playing';
</script>

<template>
  <section class="pro-hero">
    <div class="pro-hero__inner">
      <div class="pro-hero__main">
        <div class="pro-hero__bg" style="background:linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%); z-index:0" />
        <span class="pro-hero__kicker">{{ partido.fase.nombre }} · Mundial 2026</span>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:32px;align-items:center;margin-top:24px;color:#fff">
          <div style="text-align:right">
            <h2 style="font-family:var(--font-display);font-size:48px;line-height:1">{{ partido.local.nombre }}</h2>
          </div>
          <div style="font-family:var(--font-display);font-size:96px;line-height:1">
            <template v-if="isFinished && partido.marcador">{{ partido.marcador.local }}-{{ partido.marcador.visitante }}</template>
            <template v-else>VS</template>
          </div>
          <div style="text-align:left">
            <h2 style="font-family:var(--font-display);font-size:48px;line-height:1">{{ partido.visitante.nombre }}</h2>
          </div>
        </div>
        <div class="pro-hero__meta" style="margin-top:24px">
          <span>{{ new Date(partido.fecha).toLocaleString('es-EC') }}</span>
          <span>{{ partido.sede.nombre }}</span>
          <span v-if="isLive" style="color:#FFD400;font-weight:700">EN VIVO</span>
        </div>
      </div>
    </div>
  </section>
</template>
