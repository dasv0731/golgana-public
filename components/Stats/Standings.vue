<script setup lang="ts">
import type { GrupoStanding } from '~/types/api';

defineProps<{
  rows: GrupoStanding[];
  showFifa?: boolean;
}>();
</script>

<template>
  <table class="ptable">
    <thead>
      <tr>
        <th>#</th>
        <th>Selección</th>
        <th class="num">PJ</th>
        <th class="num">G</th>
        <th class="num">E</th>
        <th class="num">P</th>
        <th class="num">DG</th>
        <th class="num">Pts</th>
        <th>Forma</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.seleccion.slug">
        <td><strong style="color:var(--color-primary-green)">{{ row.posicion }}</strong></td>
        <td>
          <NuxtLink :to="`/selecciones/${row.seleccion.slug}/`">
            <strong>{{ row.seleccion.nombre }}</strong>
          </NuxtLink>
        </td>
        <td class="num">{{ row.pj }}</td>
        <td class="num">{{ row.g }}</td>
        <td class="num">{{ row.e }}</td>
        <td class="num">{{ row.p }}</td>
        <td class="num">{{ row.dg > 0 ? '+' : '' }}{{ row.dg }}</td>
        <td class="num"><strong>{{ row.pts }}</strong></td>
        <td>
          <span class="streak">
            <span
              v-for="(f, i) in row.forma"
              :key="i"
              :class="`streak__b streak__b--${f === 'W' ? 'w' : f === 'D' ? 'd' : 'l'}`"
            >{{ f === 'W' ? 'G' : f === 'D' ? 'E' : 'P' }}</span>
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
