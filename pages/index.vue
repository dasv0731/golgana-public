<script setup lang="ts">
const { data: ecuador } = await useFetch('/api/selecciones/ecuador');
</script>

<template>
  <div>
    <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Test' }]" />
    <ProHero
      kicker="FIFA World Cup · USA · Canadá · México"
      title="Mundial<br>2026"
      lead="48 selecciones. 16 sedes. 104 partidos en 39 días."
      :meta="['11 jun – 19 jul', '48 equipos']"
      bg-gradient="linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%)"
    />
    <EquipoHero
      v-if="ecuador"
      :equipo="ecuador"
      kicker="Selección de Ecuador · Grupo D"
      :metrics="ecuador.estadisticasDestacadas"
    />
  </div>
</template>
