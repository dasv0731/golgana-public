<script setup lang="ts">
const route = useRoute();
const isActive = (path: string) => route.path.startsWith(path);
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink to="/" class="site-header__logo">
        <img src="/logo-golgana.png" alt="Golgana" />
      </NuxtLink>
      <nav class="site-header__nav">
        <NuxtLink to="/" :class="{ 'is-active': route.path === '/' }">Inicio</NuxtLink>
        <NuxtLink to="/torneos/mundial/2026/" :class="{ 'is-active': isActive('/torneos/mundial') }">Mundial 2026</NuxtLink>
        <NuxtLink to="/selecciones/" :class="{ 'is-active': isActive('/selecciones') }">Selecciones</NuxtLink>
        <NuxtLink to="/noticias/" :class="{ 'is-active': isActive('/noticias') }">Noticias</NuxtLink>
      </nav>
    </div>
  </header>
</template>
