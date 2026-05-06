# golgana-public

Frontend público de [golgana.net](https://golgana.net) — plataforma editorial de fútbol con cobertura especial del **Mundial 2026**.

## Stack

- **Framework**: Nuxt 3 SSR + Vue 3 + TypeScript
- **Renderer**: Nitro preset `aws-amplify`
- **Backend (separado)**: AWS Amplify + DynamoDB (en desarrollo paralelo)
- **Hosting**: AWS Amplify Hosting
- **Editorial**: `@nuxt/content` v3 (markdown)
- **Analytics**: GTM + GA4 con consent gate

## Estado

📅 **Target launch**: 2026-06-09 (2 días antes del kickoff del Mundial 2026)

🚧 **Fase actual**: Foundation — repo bootstrap.

## Documentación

- 📄 **Spec de diseño**: [`docs/superpowers/specs/2026-05-06-golgana-public-frontend-design.md`](docs/superpowers/specs/2026-05-06-golgana-public-frontend-design.md)
- 📋 **Plan de implementación** (36 tareas, 5 fases): [`docs/superpowers/plans/2026-05-06-golgana-public-frontend-mvp.md`](docs/superpowers/plans/2026-05-06-golgana-public-frontend-mvp.md)
- 🎯 **Spec SEO maestra**: vive en repositorio separado (`Golgana front/2026-04-23-golgana-seo-architecture-design.md`)

## Setup local

```bash
nvm use            # Node 20 LTS
npm install
cp .env.example .env
npm run dev
```

## Roadmap

| Fase | Semana | Foco |
|---|---|---|
| S1 | 5–12 may | Foundation: repo bootstrap, CSS migration, types/api.ts, content-loader, layout |
| S2 | 13–19 may | Templates Mundial: Home, Torneo hub, Edición, Grupo |
| S3 | 20–26 may | Selección + 8 sub-páginas, Partido (3 estados), 44 selecciones básicas |
| S4 | 27 may–2 jun | Editorial via @nuxt/content, OG images, Sitemap, robots/llms, redirects |
| S5 | 3–8 jun | QA, Lighthouse CI, Search Console, Amplify deploy |
| 🚀 | 9 jun | **Launch** |

## Submódulos

- 🎲 **Polla Mundialista**: [polla.golgana.net](https://polla.golgana.net) — predicciones del Mundial. Repos separados: `polla-backend`, `polla-app`, `polla-public`.
- 🏆 **Fase 2 post-Mundial** (julio+): LigaPro Serie A/B + Copa Ecuador + clubes ecuatorianos.

## Licencia

Propietario. Todos los derechos reservados.
