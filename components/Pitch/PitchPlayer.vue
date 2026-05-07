<script setup lang="ts">
import type { PlantillaJugador } from '~/types/api';

defineProps<{
  player: PlantillaJugador;
}>();
</script>

<template>
  <div :class="['pp', player.capitan ? 'pp--cap' : '']">
    <div class="pp__num">{{ player.dorsal ?? '?' }}</div>
    <span class="pp__name">{{ player.jugador.nombre }}</span>
  </div>
</template>
