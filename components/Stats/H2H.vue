<script setup lang="ts">
import type { H2HResumen } from '~/types/api';

defineProps<{
  h2h: H2HResumen;
  localName: string;
  visitanteName: string;
}>();
</script>

<template>
  <div class="h2h">
    <div class="h2h__head">
      <strong>{{ localName }}</strong>
      <span>{{ h2h.totalEnfrentamientos }} enfrentamientos</span>
      <strong>{{ visitanteName }}</strong>
    </div>
    <div class="h2h__bar">
      <span class="h2h__bar-l" :style="{ flex: h2h.victoriasLocal }">{{ h2h.victoriasLocal }}</span>
      <span class="h2h__bar-d" :style="{ flex: h2h.empates }">{{ h2h.empates }}</span>
      <span class="h2h__bar-v" :style="{ flex: h2h.victoriasVisitante }">{{ h2h.victoriasVisitante }}</span>
    </div>
  </div>
</template>
