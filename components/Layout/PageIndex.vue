<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; href: string }>;
  active?: string;
}>();
</script>

<template>
  <nav class="pindex">
    <div class="pindex__inner">
      <a
        v-for="item in items"
        :key="item.href"
        :href="item.href"
        :class="{ 'is-active': active === item.href }"
      >{{ item.label }}</a>
    </div>
  </nav>
</template>
