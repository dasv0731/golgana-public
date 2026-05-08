<script setup lang="ts">
/**
 * Bandera de selección/equipo · port del componente <app-team-flag> de polla-app.
 *
 * Prioridad:
 *  1. crestUrl (escudo personalizado del admin) si carga sin error.
 *  2. flag-icons SVG via clases `fi fis fi-<iso2>` (lipis/flag-icons).
 *
 * Tamaño en px (default 32). Devuelve un span/img inline.
 *
 * Uso:
 *   <TeamFlag :flag-code="'ec'" :name="equipo.nombre" :size="56" />
 *   <TeamFlag :flag-code="flagCode(slug)" :name="..." :crest-url="..." />
 */
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  flagCode: string | null | undefined;
  crestUrl?: string | null;
  name?: string | null;
  size?: number;
  /** Borde redondo en px. 4 default (banderas casi cuadradas). 50 para círculo. */
  rounded?: number;
}>(), {
  crestUrl: null,
  name: null,
  size: 32,
  rounded: 4,
});

const crestFailed = ref(false);
watch(() => props.crestUrl, () => { crestFailed.value = false; });

function onCrestError() { crestFailed.value = true; }
</script>

<template>
  <img
    v-if="crestUrl && !crestFailed"
    :src="crestUrl"
    :alt="(name ?? '') + ' escudo'"
    :width="size"
    :height="size"
    class="tflag tflag--crest"
    :style="{
      borderRadius: rounded + 'px',
    }"
    @error="onCrestError"
  />
  <span
    v-else-if="flagCode"
    class="fi fis tflag tflag--svg"
    :class="`fi-${flagCode.toLowerCase()}`"
    :style="{
      width: size + 'px',
      height: size + 'px',
      borderRadius: rounded + 'px',
    }"
    :aria-label="(name ?? '') + ' bandera'"
    :title="name ?? ''"
  />
  <span
    v-else
    class="tflag tflag--placeholder"
    :style="{
      width: size + 'px',
      height: size + 'px',
      borderRadius: rounded + 'px',
    }"
    :aria-label="(name ?? '') + ' bandera no disponible'"
  />
</template>

<style scoped>
.tflag {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
.tflag--crest {
  object-fit: contain;
  background: var(--color-primary-white);
}
.tflag--svg {
  /* La librería flag-icons aplica background-image SVG con clase .fi-XX. */
  background-size: cover;
  background-position: center;
}
.tflag--placeholder {
  background: rgba(0, 0, 0, 0.08);
  border: 1px dashed rgba(0, 0, 0, 0.15);
}
</style>
