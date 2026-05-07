<script setup lang="ts">
import type { Equipo, HeroMetric } from '~/types/api';

defineProps<{
  equipo: Equipo;
  kicker?: string;
  metrics?: HeroMetric[];
}>();
</script>

<template>
  <section class="eq-hero">
    <div class="eq-hero__bg" />
    <div class="eq-hero__inner">
      <div class="eq-hero__left">
        <div class="eq-hero__id-row">
          <div class="eq-hero__crest">
            <img :src="equipo.escudo.src" :alt="equipo.escudo.alt" />
          </div>
          <div>
            <span v-if="kicker" class="eq-hero__kicker">{{ kicker }}</span>
            <h1 class="eq-hero__title">{{ equipo.apodo ?? equipo.nombre }}</h1>
            <div class="eq-hero__meta">
              <span v-if="equipo.dt">DT: {{ equipo.dt.nombre }}</span>
              <span v-if="equipo.fifaRank">FIFA {{ equipo.fifaRank }}°</span>
            </div>
          </div>
        </div>
        <div v-if="metrics?.length" class="eq-hero__metrics-row">
          <div
            v-for="(m, i) in metrics"
            :key="i"
            :class="['eq-hero__metric', m.accent ? 'eq-hero__metric--accent' : '']"
          >
            <span class="eq-hero__metric-label">{{ m.label }}</span>
            <div class="eq-hero__metric-num">{{ m.value }}</div>
            <span v-if="m.caption" class="eq-hero__metric-cap">{{ m.caption }}</span>
          </div>
        </div>
      </div>
      <slot name="aside" />
    </div>
  </section>
</template>

<style>
.eq-hero { position: relative; background: #000; color: #fff; overflow: hidden; }
.eq-hero__bg { position: absolute; inset: 0; background: linear-gradient(135deg, #000 0%, #0a3d20 55%, #067a4a 100%); z-index: 0; }
.eq-hero__inner { position: relative; z-index: 1; max-width: 1440px; margin: 0 auto; padding: 48px 20px 56px; display: grid; gap: 32px; grid-template-columns: 1fr; }
@media (min-width: 992px) { .eq-hero__inner { grid-template-columns: 1.55fr 1fr; padding: 64px 64px 72px; gap: 48px; align-items: stretch; } }
.eq-hero__left { display: flex; flex-direction: column; gap: 32px; }
.eq-hero__id-row { display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: center; }
.eq-hero__crest { width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.18); display: grid; place-items: center; flex-shrink: 0; }
.eq-hero__crest img { width: 70%; height: 70%; object-fit: contain; }
@media (min-width: 992px) { .eq-hero__crest { width: 200px; height: 200px; } }
.eq-hero__kicker { font-family: var(--font-primary); font-weight: 700; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-primary-green); }
.eq-hero__title { font-family: var(--font-display); font-size: clamp(64px, 11vw, 160px); line-height: 0.85; text-transform: uppercase; margin: 12px 0 0; }
.eq-hero__meta { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.55); }
.eq-hero__metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; overflow: hidden; }
.eq-hero__metric { background: rgba(0,0,0,0.45); padding: 18px 16px; }
.eq-hero__metric--accent { background: linear-gradient(135deg, var(--color-primary-green), #016b3d); }
.eq-hero__metric-label { font-family: var(--font-primary); font-weight: 700; font-size: 10px; letter-spacing: 0.14em; color: rgba(255,255,255,0.6); text-transform: uppercase; }
.eq-hero__metric-num { font-family: var(--font-display); font-size: 32px; color: #fff; line-height: 1; margin-top: 8px; }
.eq-hero__metric-cap { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 4px; display: block; }
</style>
