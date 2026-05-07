<script setup lang="ts">
defineProps<{
  cells: Array<{ num: string; label: string; emphasized?: boolean }>;
  variant?: 'default' | 'dark';
}>();
</script>

<template>
  <div :class="['stat-row', variant === 'dark' ? 'stat-row--dark' : '']">
    <div v-for="(c, i) in cells" :key="i" class="stat-row__cell">
      <span class="stat-row__num">
        <em v-if="c.emphasized">{{ c.num }}</em>
        <template v-else>{{ c.num }}</template>
      </span>
      <span class="stat-row__label">{{ c.label }}</span>
    </div>
  </div>
</template>
