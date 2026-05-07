import ExcelJS from 'exceljs';
import { resolve } from 'node:path';

interface Column {
  name: string;
  type: string;
  required: boolean;
  description: string;
  fk?: string; // "SheetName.slug"
}

interface Sheet {
  name: string;
  group: 'torneos' | 'selecciones' | 'partidos' | 'editorial' | 'jugadores' | 'plantillas' | 'estadios';
  description: string;
  columns: Column[];
}

const GROUP_COLORS: Record<Sheet['group'], string> = {
  torneos: 'FF02CC74',     // green Golgana
  selecciones: 'FFFFD400',  // yellow Ecuador
  partidos: 'FF067A4A',     // dark green
  editorial: 'FF6F2DA8',    // purple
  jugadores: 'FF1B0096',    // navy blue
  plantillas: 'FFFF8200',   // orange
  estadios: 'FF888888',     // grey
};

const SHEETS: Sheet[] = [
  // ============ TORNEOS ============
  {
    name: 'Torneos',
    group: 'torneos',
    description: '1 fila por torneo evergreen (Mundial, LigaPro)',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: 'ID unico: mundial, liga-pro-serie-a' },
      { name: 'nombre', type: 'text', required: true, description: 'Nombre completo' },
      { name: 'nombre_corto', type: 'text', required: true, description: 'Display name' },
      { name: 'tipo', type: 'enum(mundial|liga|copa-nacional|continental)', required: true, description: 'Categoria' },
      { name: 'organizador_nombre', type: 'text', required: true, description: 'FIFA, ConmebolFA, etc.' },
      { name: 'organizador_sitio', type: 'url', required: false, description: 'Sitio oficial' },
      { name: 'fundacion', type: 'int', required: false, description: 'Ano fundacion' },
      { name: 'edicion_actual_slug', type: 'slug FK', required: true, description: 'Edicion vigente', fk: 'Ediciones.slug' },
      { name: 'seo_title', type: 'text', required: true, description: 'HTML title' },
      { name: 'seo_description', type: 'text', required: true, description: 'Meta description' },
      { name: 'seo_og_title', type: 'text', required: false, description: '' },
      { name: 'seo_og_description', type: 'text', required: false, description: '' },
      { name: 'seo_canonical', type: 'url', required: false, description: 'Canonical override' },
      { name: 'seo_noindex', type: 'bool', required: false, description: 'true para excluir' },
    ],
  },
  {
    name: 'Torneos_Campeones',
    group: 'torneos',
    description: 'Palmares historico (FK->Torneos)',
    columns: [
      { name: 'torneo_slug', type: 'slug FK', required: true, description: '', fk: 'Torneos.slug' },
      { name: 'ano', type: 'int', required: true, description: 'Ano del titulo' },
      { name: 'campeon_slug', type: 'slug FK', required: true, description: 'Campeon', fk: 'Selecciones.slug' },
      { name: 'subcampeon_slug', type: 'slug FK', required: false, description: 'Subcampeon', fk: 'Selecciones.slug' },
    ],
  },
  {
    name: 'Torneos_FAQ',
    group: 'torneos',
    description: 'Preguntas frecuentes por torneo',
    columns: [
      { name: 'torneo_slug', type: 'slug FK', required: true, description: '', fk: 'Torneos.slug' },
      { name: 'orden', type: 'int', required: true, description: '1, 2, 3...' },
      { name: 'pregunta', type: 'text', required: true, description: '' },
      { name: 'respuesta', type: 'text', required: true, description: '' },
    ],
  },
  {
    name: 'Torneos_EdicionesPrevias',
    group: 'torneos',
    description: 'Historico de ediciones por torneo',
    columns: [
      { name: 'torneo_slug', type: 'slug FK', required: true, description: '', fk: 'Torneos.slug' },
      { name: 'edicion_slug', type: 'slug FK', required: true, description: '', fk: 'Ediciones.slug' },
    ],
  },
  // ============ EDICIONES ============
  {
    name: 'Ediciones',
    group: 'torneos',
    description: 'Edicion/temporada de un torneo (Mundial 2026, LigaPro temporada-2026)',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: '2026 (Mundial) o temporada-2026 (liga)' },
      { name: 'torneo_slug', type: 'slug FK', required: true, description: '', fk: 'Torneos.slug' },
      { name: 'ano', type: 'int', required: true, description: '' },
      { name: 'fecha_inicio', type: 'iso-datetime', required: true, description: '2026-06-11T14:00:00-04:00' },
      { name: 'fecha_fin', type: 'iso-datetime', required: true, description: '' },
      { name: 'estado', type: 'enum(upcoming|ongoing|finished)', required: true, description: '' },
      { name: 'formato_tipo', type: 'enum(grupos|liga|eliminatoria)', required: true, description: '' },
      { name: 'formato_descripcion', type: 'text', required: true, description: 'Texto explicativo del formato' },
      { name: 'campeon_slug', type: 'slug FK', required: false, description: 'Cuando termine', fk: 'Selecciones.slug' },
      { name: 'seo_title', type: 'text', required: true, description: '' },
      { name: 'seo_description', type: 'text', required: true, description: '' },
    ],
  },
  {
    name: 'Ediciones_Fases',
    group: 'torneos',
    description: 'Fases por edicion (grupos, octavos, cuartos, semis, final)',
    columns: [
      { name: 'edicion_slug', type: 'slug FK', required: true, description: '', fk: 'Ediciones.slug' },
      { name: 'slug', type: 'enum(grupos|octavos|cuartos|semifinales|final|jornada-N)', required: true, description: '' },
      { name: 'nombre', type: 'text', required: true, description: 'Fase de grupos / J1' },
      { name: 'tipo', type: 'enum(grupos|eliminatoria|jornada)', required: true, description: '' },
      { name: 'fecha_inicio', type: 'iso-datetime', required: true, description: '' },
      { name: 'fecha_fin', type: 'iso-datetime', required: true, description: '' },
      { name: 'orden', type: 'int', required: true, description: '1=grupos, 2=octavos...' },
    ],
  },
  {
    name: 'Ediciones_Participantes',
    group: 'torneos',
    description: 'Selecciones que disputan una edicion',
    columns: [
      { name: 'edicion_slug', type: 'slug FK', required: true, description: '', fk: 'Ediciones.slug' },
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
    ],
  },
  {
    name: 'Ediciones_FAQ',
    group: 'torneos',
    description: 'FAQs especificos de la edicion',
    columns: [
      { name: 'edicion_slug', type: 'slug FK', required: true, description: '', fk: 'Ediciones.slug' },
      { name: 'orden', type: 'int', required: true, description: '' },
      { name: 'pregunta', type: 'text', required: true, description: '' },
      { name: 'respuesta', type: 'text', required: true, description: '' },
    ],
  },
  // ============ SEDES (estadios del Mundial) ============
  {
    name: 'Sedes',
    group: 'estadios',
    description: '16 sedes del Mundial 2026',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: 'metlife-stadium' },
      { name: 'nombre', type: 'text', required: true, description: 'MetLife Stadium' },
      { name: 'ciudad', type: 'text', required: true, description: '' },
      { name: 'pais', type: 'enum(USA|CAN|MEX)', required: true, description: '' },
      { name: 'capacidad', type: 'int', required: true, description: '' },
      { name: 'imagen_src', type: 'url', required: false, description: 'Path/URL de foto' },
      { name: 'imagen_alt', type: 'text', required: false, description: '' },
      { name: 'edicion_slug', type: 'slug FK', required: true, description: '', fk: 'Ediciones.slug' },
    ],
  },
  // ============ GRUPOS ============
  {
    name: 'Grupos',
    group: 'torneos',
    description: 'Grupos de la fase de grupos',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: 'grupo-d' },
      { name: 'edicion_slug', type: 'slug FK', required: true, description: '', fk: 'Ediciones.slug' },
      { name: 'letra', type: 'enum(A-L)', required: true, description: '' },
      { name: 'analisis', type: 'markdown', required: false, description: 'Texto editorial del grupo' },
      { name: 'seo_title', type: 'text', required: true, description: '' },
      { name: 'seo_description', type: 'text', required: true, description: '' },
    ],
  },
  {
    name: 'Grupos_Selecciones',
    group: 'torneos',
    description: 'Que selecciones estan en cada grupo',
    columns: [
      { name: 'grupo_slug', type: 'slug FK', required: true, description: '', fk: 'Grupos.slug' },
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'orden', type: 'int', required: false, description: '1=cabeza de serie' },
    ],
  },
  {
    name: 'Grupos_Standings',
    group: 'torneos',
    description: 'Tabla del grupo (en vivo / final)',
    columns: [
      { name: 'grupo_slug', type: 'slug FK', required: true, description: '', fk: 'Grupos.slug' },
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'posicion', type: 'int', required: true, description: '1-4' },
      { name: 'pj', type: 'int', required: true, description: 'Partidos jugados' },
      { name: 'g', type: 'int', required: true, description: 'Ganados' },
      { name: 'e', type: 'int', required: true, description: 'Empatados' },
      { name: 'p', type: 'int', required: true, description: 'Perdidos' },
      { name: 'gf', type: 'int', required: true, description: 'Goles a favor' },
      { name: 'gc', type: 'int', required: true, description: 'Goles en contra' },
      { name: 'dg', type: 'int', required: true, description: 'Dif (puede ser negativa)' },
      { name: 'pts', type: 'int', required: true, description: '' },
      { name: 'forma', type: 'text', required: false, description: 'W,D,W,L,W (ultimos 5)' },
    ],
  },
  {
    name: 'Grupos_Partidos',
    group: 'torneos',
    description: 'Partidos del grupo',
    columns: [
      { name: 'grupo_slug', type: 'slug FK', required: true, description: '', fk: 'Grupos.slug' },
      { name: 'partido_slug', type: 'slug FK', required: true, description: '', fk: 'Partidos.slug' },
    ],
  },
  // ============ SELECCIONES ============
  {
    name: 'Selecciones',
    group: 'selecciones',
    description: '48 selecciones del Mundial',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: 'ecuador, inglaterra' },
      { name: 'nombre', type: 'text', required: true, description: '' },
      { name: 'nombre_oficial', type: 'text', required: true, description: '' },
      { name: 'apodo', type: 'text', required: false, description: 'La Tri' },
      { name: 'pais', type: 'text', required: true, description: 'ISO: EC, GB-ENG' },
      { name: 'ciudad_sede', type: 'text', required: false, description: 'Sede federacion' },
      { name: 'fundacion', type: 'int', required: false, description: 'Ano' },
      { name: 'escudo_src', type: 'url', required: true, description: '' },
      { name: 'escudo_alt', type: 'text', required: true, description: '' },
      { name: 'color_primario', type: 'text', required: true, description: 'Hex: #FFD400' },
      { name: 'color_secundario', type: 'text', required: true, description: 'Hex' },
      { name: 'estadio_slug', type: 'slug FK', required: false, description: 'Estadio principal', fk: 'Estadios.slug' },
      { name: 'dt_nombre', type: 'text', required: true, description: '' },
      { name: 'dt_nacionalidad', type: 'text', required: true, description: '' },
      { name: 'dt_foto_src', type: 'url', required: false, description: '' },
      { name: 'dt_desde', type: 'iso-date', required: false, description: '' },
      { name: 'red_twitter', type: 'url', required: false, description: '' },
      { name: 'red_instagram', type: 'url', required: false, description: '' },
      { name: 'red_facebook', type: 'url', required: false, description: '' },
      { name: 'red_web', type: 'url', required: false, description: '' },
      { name: 'fifa_rank', type: 'int', required: false, description: '' },
      { name: 'valor_plantilla_monto', type: 'int', required: false, description: '' },
      { name: 'valor_plantilla_moneda', type: 'enum(EUR|USD)', required: false, description: '' },
      { name: 'nivel', type: 'enum(Premium|Estandar|Basico)', required: true, description: '' },
      { name: 'seo_title', type: 'text', required: true, description: '' },
      { name: 'seo_description', type: 'text', required: true, description: '' },
    ],
  },
  {
    name: 'Selecciones_CuerpoTecnico',
    group: 'selecciones',
    description: 'Staff tecnico de la seleccion',
    columns: [
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'orden', type: 'int', required: true, description: '' },
      { name: 'rol', type: 'text', required: true, description: 'DT, Asistente, Medico' },
      { name: 'nombre', type: 'text', required: true, description: '' },
      { name: 'nacionalidad', type: 'text', required: false, description: '' },
    ],
  },
  {
    name: 'Selecciones_StatsDestacadas',
    group: 'selecciones',
    description: 'Las 4 metricas del hero de seleccion (renamed from EstadisticasDestacadas: Excel 31-char limit)',
    columns: [
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'orden', type: 'int', required: true, description: '1-4' },
      { name: 'label', type: 'text', required: true, description: 'Valor plantilla' },
      { name: 'value', type: 'text', required: true, description: 'EUR 480M (libre formato)' },
      { name: 'caption', type: 'text', required: false, description: '' },
      { name: 'accent', type: 'bool', required: false, description: 'true=verde' },
    ],
  },
  {
    name: 'Selecciones_Rivalidades',
    group: 'selecciones',
    description: 'Rivalidades entre selecciones',
    columns: [
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: 'Quien tiene la rivalidad', fk: 'Selecciones.slug' },
      { name: 'rival_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'tipo_rivalidad', type: 'text', required: false, description: 'Vecino regional, etc.' },
    ],
  },
  {
    name: 'Selecciones_FAQ',
    group: 'selecciones',
    description: 'FAQs de seleccion',
    columns: [
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'orden', type: 'int', required: true, description: '' },
      { name: 'pregunta', type: 'text', required: true, description: '' },
      { name: 'respuesta', type: 'text', required: true, description: '' },
    ],
  },
  {
    name: 'Selecciones_EstadiosSecundarios',
    group: 'selecciones',
    description: 'Estadios secundarios usados por la seleccion',
    columns: [
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'estadio_slug', type: 'slug FK', required: true, description: '', fk: 'Estadios.slug' },
      { name: 'uso', type: 'text', required: false, description: 'Algunos partidos eliminatorias' },
    ],
  },
  {
    name: 'Selecciones_Idolos',
    group: 'selecciones',
    description: 'Hall of fame de la seleccion',
    columns: [
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'orden', type: 'int', required: true, description: '' },
      { name: 'nombre', type: 'text', required: true, description: '' },
      { name: 'era', type: 'text', required: true, description: '1953-1972' },
      { name: 'rol', type: 'text', required: true, description: 'Delantero' },
      { name: 'logros', type: 'text', required: true, description: '' },
      { name: 'jugador_slug', type: 'slug FK', required: false, description: 'Si tiene perfil', fk: 'Jugadores.slug' },
    ],
  },
  {
    name: 'Selecciones_Hitos',
    group: 'selecciones',
    description: 'Timeline historia de la seleccion',
    columns: [
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'ano', type: 'int', required: true, description: '' },
      { name: 'evento', type: 'text', required: true, description: '' },
      { name: 'orden', type: 'int', required: false, description: '' },
    ],
  },
  {
    name: 'Selecciones_Titulos',
    group: 'selecciones',
    description: 'Palmares de la seleccion',
    columns: [
      { name: 'seleccion_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'competicion', type: 'text', required: true, description: '' },
      { name: 'ano', type: 'int', required: true, description: '' },
      { name: 'resultado', type: 'text', required: true, description: 'Campeon / Cuartos / etc.' },
    ],
  },
  // ============ ESTADIOS ============
  {
    name: 'Estadios',
    group: 'estadios',
    description: 'Todos los estadios (seleccion + club)',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: 'atahualpa, george-capwell' },
      { name: 'nombre', type: 'text', required: true, description: '' },
      { name: 'ciudad', type: 'text', required: true, description: '' },
      { name: 'pais', type: 'text', required: true, description: 'EC, BR, etc.' },
      { name: 'capacidad', type: 'int', required: true, description: '' },
      { name: 'altitud', type: 'int', required: false, description: 'metros' },
      { name: 'inauguracion', type: 'int', required: false, description: 'Ano' },
      { name: 'descripcion', type: 'markdown', required: false, description: 'Texto largo' },
    ],
  },
  // ============ PLANTILLAS ============
  {
    name: 'Plantillas',
    group: 'plantillas',
    description: 'Convocatorias de seleccion o plantillas de club',
    columns: [
      { name: 'id', type: 'text', required: true, description: 'ecuador-2026' },
      { name: 'equipo_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'edicion_slug', type: 'slug FK', required: false, description: 'Para selecciones al Mundial', fk: 'Ediciones.slug' },
      { name: 'temporada', type: 'text', required: false, description: 'Para club: temporada-2026' },
    ],
  },
  {
    name: 'Plantillas_Jugadores',
    group: 'plantillas',
    description: 'Jugadores en una plantilla',
    columns: [
      { name: 'plantilla_id', type: 'text FK', required: true, description: '', fk: 'Plantillas.id' },
      { name: 'jugador_slug', type: 'slug FK', required: true, description: '', fk: 'Jugadores.slug' },
      { name: 'dorsal', type: 'int', required: false, description: '' },
      { name: 'posicion', type: 'enum(POR|DEF|MED|DEL)', required: true, description: '' },
      { name: 'posicion_detalle', type: 'text', required: false, description: 'Volante defensivo' },
      { name: 'capitan', type: 'bool', required: false, description: '' },
      { name: 'titular', type: 'bool', required: false, description: '' },
      { name: 'estado', type: 'enum(disponible|lesionado|suspendido)', required: false, description: '' },
    ],
  },
  {
    name: 'Plantillas_CuerpoTecnico',
    group: 'plantillas',
    description: 'Staff tecnico para una plantilla especifica',
    columns: [
      { name: 'plantilla_id', type: 'text FK', required: true, description: '', fk: 'Plantillas.id' },
      { name: 'orden', type: 'int', required: true, description: '' },
      { name: 'rol', type: 'text', required: true, description: '' },
      { name: 'nombre', type: 'text', required: true, description: '' },
      { name: 'nacionalidad', type: 'text', required: false, description: '' },
    ],
  },
  {
    name: 'Plantillas_Altas',
    group: 'plantillas',
    description: 'Llegadas en ventana actual',
    columns: [
      { name: 'plantilla_id', type: 'text FK', required: true, description: '', fk: 'Plantillas.id' },
      { name: 'jugador_slug', type: 'slug FK', required: true, description: '', fk: 'Jugadores.slug' },
      { name: 'desde', type: 'iso-date', required: true, description: '' },
      { name: 'tipo', type: 'enum(fichaje|cesion|subida-cantera)', required: true, description: '' },
    ],
  },
  {
    name: 'Plantillas_Bajas',
    group: 'plantillas',
    description: 'Salidas en ventana actual',
    columns: [
      { name: 'plantilla_id', type: 'text FK', required: true, description: '', fk: 'Plantillas.id' },
      { name: 'jugador_slug', type: 'slug FK', required: true, description: '', fk: 'Jugadores.slug' },
      { name: 'hacia', type: 'text', required: true, description: 'Club destino o "fin contrato"' },
      { name: 'tipo', type: 'enum(venta|cesion-saliente|fin-de-contrato|retiro)', required: true, description: '' },
    ],
  },
  // ============ JUGADORES ============
  {
    name: 'Jugadores',
    group: 'jugadores',
    description: 'Perfil de jugador (cubre club + seleccion)',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: 'moises-caicedo' },
      { name: 'nombre', type: 'text', required: true, description: 'Display' },
      { name: 'nombre_completo', type: 'text', required: true, description: 'Legal' },
      { name: 'apodo', type: 'text', required: false, description: 'Nino Moi' },
      { name: 'fecha_nacimiento', type: 'iso-date', required: true, description: '' },
      { name: 'nacionalidad', type: 'text', required: true, description: '' },
      { name: 'altura', type: 'int', required: false, description: 'cm' },
      { name: 'peso', type: 'int', required: false, description: 'kg' },
      { name: 'pie_dominante', type: 'enum(izquierdo|derecho|ambidiestro)', required: false, description: '' },
      { name: 'posicion', type: 'enum(POR|DEF|MED|DEL)', required: true, description: '' },
      { name: 'club_actual_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'seleccion_slug', type: 'slug FK', required: false, description: '', fk: 'Selecciones.slug' },
      { name: 'valor_mercado_monto', type: 'int', required: false, description: '' },
      { name: 'valor_mercado_moneda', type: 'text', required: false, description: 'EUR' },
      { name: 'valor_mercado_fecha', type: 'iso-date', required: false, description: '' },
      { name: 'valor_mercado_fuente', type: 'text', required: false, description: 'Transfermarkt' },
      { name: 'red_twitter', type: 'url', required: false, description: '' },
      { name: 'red_instagram', type: 'url', required: false, description: '' },
      { name: 'red_facebook', type: 'url', required: false, description: '' },
      { name: 'retirado', type: 'bool', required: false, description: '' },
      { name: 'nivel', type: 'enum(Premium|Estandar|Basico)', required: true, description: '' },
      { name: 'seo_title', type: 'text', required: true, description: '' },
      { name: 'seo_description', type: 'text', required: true, description: '' },
    ],
  },
  {
    name: 'Jugadores_Trayectoria',
    group: 'jugadores',
    description: 'Clubes/cesiones por jugador',
    columns: [
      { name: 'jugador_slug', type: 'slug FK', required: true, description: '', fk: 'Jugadores.slug' },
      { name: 'orden', type: 'int', required: true, description: 'Cronologico ascendente' },
      { name: 'club_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'desde', type: 'iso-date', required: true, description: '' },
      { name: 'hasta', type: 'iso-date', required: false, description: 'Vacio = aun ahi' },
      { name: 'tipo', type: 'enum(cantera|profesional|cesion)', required: true, description: '' },
      { name: 'partidos', type: 'int', required: false, description: '' },
      { name: 'goles', type: 'int', required: false, description: '' },
      { name: 'titulos', type: 'text', required: false, description: 'Comma-separated' },
      { name: 'notas', type: 'text', required: false, description: '' },
    ],
  },
  {
    name: 'Jugadores_Estadisticas',
    group: 'jugadores',
    description: 'Stats por temporada',
    columns: [
      { name: 'jugador_slug', type: 'slug FK', required: true, description: '', fk: 'Jugadores.slug' },
      { name: 'temporada', type: 'text', required: true, description: '2025-2026' },
      { name: 'competicion_slug', type: 'slug FK', required: true, description: '', fk: 'Torneos.slug' },
      { name: 'equipo_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'pj', type: 'int', required: true, description: '' },
      { name: 'goles', type: 'int', required: true, description: '' },
      { name: 'asistencias', type: 'int', required: true, description: '' },
      { name: 'amarillas', type: 'int', required: false, description: '' },
      { name: 'rojas', type: 'int', required: false, description: '' },
    ],
  },
  {
    name: 'Jugadores_Titulos',
    group: 'jugadores',
    description: 'Titulos individuales',
    columns: [
      { name: 'jugador_slug', type: 'slug FK', required: true, description: '', fk: 'Jugadores.slug' },
      { name: 'competicion_slug', type: 'slug FK', required: true, description: '', fk: 'Torneos.slug' },
      { name: 'ano', type: 'int', required: true, description: '' },
      { name: 'equipo_slug', type: 'slug FK', required: true, description: 'Con que equipo', fk: 'Selecciones.slug' },
      { name: 'rol_final', type: 'enum(titular|suplente|no-convocado)', required: false, description: '' },
    ],
  },
  {
    name: 'Jugadores_FAQ',
    group: 'jugadores',
    description: 'FAQs por jugador',
    columns: [
      { name: 'jugador_slug', type: 'slug FK', required: true, description: '', fk: 'Jugadores.slug' },
      { name: 'orden', type: 'int', required: true, description: '' },
      { name: 'pregunta', type: 'text', required: true, description: '' },
      { name: 'respuesta', type: 'text', required: true, description: '' },
    ],
  },
  // ============ PARTIDOS ============
  {
    name: 'Partidos',
    group: 'partidos',
    description: 'Partidos del Mundial (104)',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: 'ecuador-vs-uzbekistan-j1' },
      { name: 'edicion_slug', type: 'slug FK', required: true, description: '', fk: 'Ediciones.slug' },
      { name: 'fase_slug', type: 'slug', required: true, description: 'grupos|octavos|...' },
      { name: 'fase_nombre', type: 'text', required: true, description: 'Fase de grupos / J1' },
      { name: 'grupo_slug', type: 'slug FK', required: false, description: 'Solo si grupos', fk: 'Grupos.slug' },
      { name: 'local_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'visitante_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'fecha', type: 'iso-datetime', required: true, description: '' },
      { name: 'zona_horaria', type: 'text', required: true, description: 'America/New_York' },
      { name: 'sede_slug', type: 'slug FK', required: true, description: '', fk: 'Sedes.slug' },
      { name: 'estado', type: 'enum(scheduled|playing|finished|postponed)', required: true, description: '' },
      { name: 'marcador_local', type: 'int', required: false, description: 'Solo si finished' },
      { name: 'marcador_visitante', type: 'int', required: false, description: '' },
      { name: 'arbitro_nombre', type: 'text', required: false, description: '' },
      { name: 'arbitro_nacionalidad', type: 'text', required: false, description: '' },
      { name: 'transmision', type: 'text', required: false, description: 'Comma-separated: FOX, Telemundo' },
      { name: 'previa_texto', type: 'markdown', required: false, description: '' },
      { name: 'previa_autor_slug', type: 'slug FK', required: false, description: '', fk: 'Autores.slug' },
      { name: 'previa_fecha', type: 'iso-datetime', required: false, description: '' },
      { name: 'cronica_texto', type: 'markdown', required: false, description: '' },
      { name: 'cronica_autor_slug', type: 'slug FK', required: false, description: '', fk: 'Autores.slug' },
      { name: 'cronica_fecha', type: 'iso-datetime', required: false, description: '' },
      { name: 'nivel', type: 'enum(Premium|Estandar|Basico)', required: true, description: '' },
      { name: 'seo_title', type: 'text', required: true, description: '' },
      { name: 'seo_description', type: 'text', required: true, description: '' },
    ],
  },
  {
    name: 'Partidos_Goleadores',
    group: 'partidos',
    description: 'Goles de un partido',
    columns: [
      { name: 'partido_slug', type: 'slug FK', required: true, description: '', fk: 'Partidos.slug' },
      { name: 'minuto', type: 'int', required: true, description: '' },
      { name: 'jugador_slug', type: 'slug FK', required: true, description: '', fk: 'Jugadores.slug' },
      { name: 'equipo_slug', type: 'slug FK', required: true, description: '', fk: 'Selecciones.slug' },
      { name: 'tipo', type: 'enum(gol|penal|autogol|tiro-libre)', required: true, description: '' },
      { name: 'asistente_slug', type: 'slug FK', required: false, description: '', fk: 'Jugadores.slug' },
    ],
  },
  {
    name: 'Partidos_Alineaciones',
    group: 'partidos',
    description: 'Header de alineacion (1 por equipo por partido)',
    columns: [
      { name: 'partido_slug', type: 'slug FK', required: true, description: '', fk: 'Partidos.slug' },
      { name: 'equipo_lado', type: 'enum(local|visitante)', required: true, description: '' },
      { name: 'formacion', type: 'text', required: true, description: '4-3-3' },
      { name: 'dt_nombre', type: 'text', required: true, description: '' },
      { name: 'oficial', type: 'bool', required: true, description: 'false=probable, true=confirmada' },
    ],
  },
  {
    name: 'Partidos_Alineaciones_Jugadores',
    group: 'partidos',
    description: 'Jugadores de cada alineacion',
    columns: [
      { name: 'partido_slug', type: 'slug FK', required: true, description: '', fk: 'Partidos.slug' },
      { name: 'equipo_lado', type: 'enum(local|visitante)', required: true, description: '' },
      { name: 'jugador_slug', type: 'slug FK', required: true, description: '', fk: 'Jugadores.slug' },
      { name: 'dorsal', type: 'int', required: false, description: '' },
      { name: 'posicion', type: 'enum(POR|DEF|MED|DEL)', required: true, description: '' },
      { name: 'es_titular', type: 'bool', required: true, description: 'true=XI, false=banco' },
      { name: 'capitan', type: 'bool', required: false, description: '' },
    ],
  },
  {
    name: 'Partidos_MinutoAMinuto',
    group: 'partidos',
    description: 'Eventos del partido (post-match)',
    columns: [
      { name: 'partido_slug', type: 'slug FK', required: true, description: '', fk: 'Partidos.slug' },
      { name: 'minuto', type: 'int', required: true, description: '' },
      { name: 'tipo', type: 'enum(gol|amarilla|roja|cambio|lesion|falta-clave|inicio-tiempo|fin-tiempo)', required: true, description: '' },
      { name: 'equipo_slug', type: 'slug FK', required: false, description: '', fk: 'Selecciones.slug' },
      { name: 'jugador_slug', type: 'slug FK', required: false, description: '', fk: 'Jugadores.slug' },
      { name: 'detalle', type: 'text', required: false, description: '' },
    ],
  },
  {
    name: 'Partidos_Stats',
    group: 'partidos',
    description: 'Stats por equipo por partido (1 fila por lado)',
    columns: [
      { name: 'partido_slug', type: 'slug FK', required: true, description: '', fk: 'Partidos.slug' },
      { name: 'equipo_lado', type: 'enum(local|visitante)', required: true, description: '' },
      { name: 'posesion', type: 'int', required: false, description: '%' },
      { name: 'remates', type: 'int', required: false, description: '' },
      { name: 'remates_arco', type: 'int', required: false, description: '' },
      { name: 'faltas', type: 'int', required: false, description: '' },
      { name: 'corners_a_favor', type: 'int', required: false, description: '' },
      { name: 'amarillas', type: 'int', required: false, description: '' },
      { name: 'rojas', type: 'int', required: false, description: '' },
      { name: 'pases_completos', type: 'int', required: false, description: '' },
      { name: 'pases_intentados', type: 'int', required: false, description: '' },
    ],
  },
  {
    name: 'Partidos_H2H',
    group: 'partidos',
    description: 'Resumen H2H del partido',
    columns: [
      { name: 'partido_slug', type: 'slug FK', required: true, description: '', fk: 'Partidos.slug' },
      { name: 'total_enfrentamientos', type: 'int', required: true, description: '' },
      { name: 'victorias_local', type: 'int', required: true, description: '' },
      { name: 'empates', type: 'int', required: true, description: '' },
      { name: 'victorias_visitante', type: 'int', required: true, description: '' },
    ],
  },
  {
    name: 'Partidos_H2H_Detalle',
    group: 'partidos',
    description: 'Ultimos enfrentamientos historicos',
    columns: [
      { name: 'partido_slug', type: 'slug FK', required: true, description: '', fk: 'Partidos.slug' },
      { name: 'orden', type: 'int', required: true, description: '1=mas reciente' },
      { name: 'fecha', type: 'iso-date', required: true, description: '' },
      { name: 'competicion', type: 'text', required: true, description: '' },
      { name: 'resultado', type: 'text', required: true, description: '2-1 (Ecuador)' },
    ],
  },
  {
    name: 'Partidos_Imagenes',
    group: 'partidos',
    description: 'Galeria del partido',
    columns: [
      { name: 'partido_slug', type: 'slug FK', required: true, description: '', fk: 'Partidos.slug' },
      { name: 'orden', type: 'int', required: true, description: '' },
      { name: 'src', type: 'url', required: true, description: '' },
      { name: 'alt', type: 'text', required: true, description: '' },
      { name: 'credito', type: 'text', required: false, description: 'AFP, EFE, etc.' },
    ],
  },
  // ============ EDITORIAL ============
  {
    name: 'Articulos',
    group: 'editorial',
    description: 'Metadata de articulos (cuerpo va en .md)',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: '2026-05-15-ecuador-arranca-en-atlanta' },
      { name: 'titulo', type: 'text', required: true, description: '' },
      { name: 'subtitulo', type: 'text', required: false, description: '' },
      { name: 'kicker', type: 'text', required: true, description: 'Previa, Analisis (display)' },
      { name: 'categoria', type: 'enum(previa|cronica|analisis|entrevista|historia|reportaje)', required: true, description: '' },
      { name: 'autor_slug', type: 'slug FK', required: true, description: '', fk: 'Autores.slug' },
      { name: 'fecha_publicacion', type: 'iso-datetime', required: true, description: '' },
      { name: 'fecha_actualizacion', type: 'iso-datetime', required: false, description: '' },
      { name: 'imagen_hero_src', type: 'url', required: true, description: '' },
      { name: 'imagen_hero_alt', type: 'text', required: true, description: '' },
      { name: 'lead', type: 'text', required: true, description: 'Bajada' },
      { name: 'tiempo_lectura', type: 'int', required: true, description: 'Minutos' },
      { name: 'seo_title', type: 'text', required: true, description: '' },
      { name: 'seo_description', type: 'text', required: true, description: '' },
    ],
  },
  {
    name: 'Articulos_Tags',
    group: 'editorial',
    description: 'Tags de cada articulo',
    columns: [
      { name: 'articulo_slug', type: 'slug FK', required: true, description: '', fk: 'Articulos.slug' },
      { name: 'tag_slug', type: 'slug FK', required: true, description: '', fk: 'Temas.slug' },
    ],
  },
  {
    name: 'Articulos_EntidadesMencionadas',
    group: 'editorial',
    description: 'Caja "En este articulo" (relaciones polimorficas)',
    columns: [
      { name: 'articulo_slug', type: 'slug FK', required: true, description: '', fk: 'Articulos.slug' },
      { name: 'tipo', type: 'enum(torneo|edicion|seleccion|equipo|jugador|partido)', required: true, description: '' },
      { name: 'entidad_slug', type: 'slug', required: true, description: 'Slug en la sheet del tipo' },
    ],
  },
  {
    name: 'Temas',
    group: 'editorial',
    description: 'Clusters editoriales / tags',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: 'mundial-2026' },
      { name: 'nombre', type: 'text', required: true, description: '' },
      { name: 'descripcion', type: 'text', required: true, description: '2-3 lineas' },
      { name: 'seo_title', type: 'text', required: true, description: '' },
      { name: 'seo_description', type: 'text', required: true, description: '' },
    ],
  },
  {
    name: 'Autores',
    group: 'editorial',
    description: 'Autores que firman articulos',
    columns: [
      { name: 'slug', type: 'slug', required: true, description: 'redaccion, juan-perez' },
      { name: 'nombre', type: 'text', required: true, description: '' },
      { name: 'bio', type: 'text', required: false, description: '' },
      { name: 'foto_src', type: 'url', required: false, description: '' },
      { name: 'email', type: 'email', required: false, description: '' },
      { name: 'red_twitter', type: 'url', required: false, description: '' },
    ],
  },
];

async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Golgana';
  wb.created = new Date();

  // Index sheet
  const indexSheet = wb.addWorksheet('_Indice', {
    properties: { tabColor: { argb: 'FF000000' } },
  });
  indexSheet.columns = [
    { header: 'Sheet', key: 'sheet', width: 38 },
    { header: 'Grupo', key: 'group', width: 14 },
    { header: 'Descripcion', key: 'desc', width: 60 },
    { header: 'Columnas', key: 'cols', width: 12 },
  ];
  indexSheet.getRow(1).font = { bold: true };
  indexSheet.views = [{ state: 'frozen', ySplit: 1 }];

  for (const sheet of SHEETS) {
    const ws = wb.addWorksheet(sheet.name, {
      properties: { tabColor: { argb: GROUP_COLORS[sheet.group] } },
    });

    // Row 1: column names (header)
    ws.getRow(1).values = sheet.columns.map((c) => c.name);
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: GROUP_COLORS[sheet.group] },
    };

    // Row 2: type indicator
    ws.getRow(2).values = sheet.columns.map((c) => c.type + (c.required ? ' *' : ''));
    ws.getRow(2).font = { italic: true, size: 10, color: { argb: 'FF666666' } };

    // Row 3: description
    ws.getRow(3).values = sheet.columns.map((c) => c.description);
    ws.getRow(3).font = { size: 9, color: { argb: 'FF888888' } };
    ws.getRow(3).alignment = { wrapText: true, vertical: 'top' };

    // Set column widths
    sheet.columns.forEach((col, i) => {
      const width = Math.max(15, Math.min(35, col.name.length + col.description.length / 4));
      ws.getColumn(i + 1).width = width;
    });

    // Freeze first 3 rows
    ws.views = [{ state: 'frozen', ySplit: 3 }];

    // Add to index
    indexSheet.addRow({
      sheet: sheet.name,
      group: sheet.group,
      desc: sheet.description,
      cols: sheet.columns.length,
    });
  }

  // Color index rows by group
  for (let i = 2; i <= SHEETS.length + 1; i++) {
    const row = indexSheet.getRow(i);
    const group = SHEETS[i - 2].group;
    row.getCell('group').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: GROUP_COLORS[group] },
    };
    row.getCell('group').font = { color: { argb: 'FFFFFFFF' }, bold: true };
  }

  // Add legend at top of index sheet (insert rows)
  indexSheet.spliceRows(1, 0, ['Plantilla DB Golgana - leyenda de colores']);
  indexSheet.spliceRows(2, 0, ['Sheet', 'Grupo', 'Descripcion', 'Columnas']);
  indexSheet.spliceRows(3, 0, ['', '', '', '']);
  indexSheet.getRow(1).font = { bold: true, size: 14 };
  indexSheet.getRow(2).font = { bold: true };
  indexSheet.views = [{ state: 'frozen', ySplit: 2 }];

  // Output
  const outputPath = resolve(process.cwd(), 'docs/db-template.xlsx');
  await wb.xlsx.writeFile(outputPath);
  console.log(`Generated: ${outputPath}`);
  console.log(`Total sheets: ${SHEETS.length + 1} (1 index + ${SHEETS.length} entity)`);
  console.log(`Total columns across all sheets: ${SHEETS.reduce((acc, s) => acc + s.columns.length, 0)}`);
}

generate().catch((err) => { console.error(err); process.exit(1); });
