<script setup lang="ts">
import type { PlantillaJugador } from '~/types/api';

defineProps<{
  formation: string;
  titulares: PlantillaJugador[];
}>();
</script>

<template>
  <div class="pitch">
    <div class="pitch__mid" />
    <div class="pitch__circle" />
    <div class="pitch__rows">
      <slot />
    </div>
  </div>
</template>
