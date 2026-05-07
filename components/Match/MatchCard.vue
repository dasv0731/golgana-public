<script setup lang="ts">
import type { Partido } from '~/types/api';

defineProps<{
  partido: Partido;
  cols?: 3 | 4 | 6 | 12;
  variant?: 'default' | 'dark' | 'green';
}>();
</script>

<template>
  <a
    :href="`/torneos/mundial/2026/grupos/${partido.grupo?.slug ?? 'na'}/${partido.slug}/`"
    :class="['tile', cols ? `b-c${cols}` : '', variant === 'dark' ? 'tile--dark' : '', variant === 'green' ? 'tile--green' : '']"
  >
    <span class="tile__kicker">{{ partido.fase.nombre }} · {{ new Date(partido.fecha).toLocaleString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</span>
    <div class="pmatch" style="margin-top:12px">
      <div class="pmatch__teams">
        <div class="pmatch__team"><strong>{{ partido.local.nombre }}</strong></div>
        <div class="pmatch__center">
          <template v-if="partido.estado === 'finished' && partido.marcador">
            {{ partido.marcador.local }}-{{ partido.marcador.visitante }}
          </template>
          <template v-else>VS</template>
        </div>
        <div class="pmatch__team"><strong>{{ partido.visitante.nombre }}</strong></div>
      </div>
    </div>
  </a>
</template>
