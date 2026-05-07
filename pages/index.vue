<template>
  <div>
    <LayoutBreadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Test' }]" />
    <main class="pro-container" style="padding:48px 0">
      <TileBentoGrid>
        <Tile :cols="6" kicker="Test" title="Tile básico">Contenido</Tile>
        <Tile :cols="6" variant="dark" title="Dark tile" />
        <Tile :cols="6" variant="green" title="Green tile" />
        <Tile :cols="6" kicker="Linked" title="Linked tile" href="/torneos/mundial/" />
      </TileBentoGrid>
    </main>
  </div>
</template>
