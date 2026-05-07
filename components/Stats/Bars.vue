<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; value: number; max?: number }>;
}>();

const computeWidth = (val: number, max?: number) => {
  const m = max ?? 100;
  return `${Math.min(100, (val / m) * 100)}%`;
};
</script>

<template>
  <div class="bars">
    <div v-for="(it, i) in items" :key="i" class="bar">
      <span class="bar__label">{{ it.label }}</span>
      <div class="bar__track">
        <div class="bar__fill" :style="{ width: computeWidth(it.value, it.max) }" />
      </div>
      <span class="bar__val">{{ it.value }}{{ it.max ? '' : '%' }}</span>
    </div>
  </div>
</template>
