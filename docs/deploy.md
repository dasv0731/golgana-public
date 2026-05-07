# Deploy to AWS Amplify Hosting

Last updated: 2026-05-07.

## One-time setup

1. **Connect repo**:
   - AWS Amplify Console → "New app" → "Host web app"
   - Choose GitHub provider
   - Select repo: `dasv0731/golgana-public`
   - Branch: `main`
   - Auto-detect framework: Nuxt 3

2. **App settings**:
   - Build spec is auto-detected from `amplify.yml` at repo root
   - Confirm output directory: `.amplify-hosting`

3. **Environment variables** (Amplify Console → App settings → Environment variables):
   ```
   NUXT_PUBLIC_SITE_URL=https://golgana.net
   NUXT_PUBLIC_GTM_ID=<actual GTM container ID>
   NUXT_PUBLIC_GA4_ID=<actual GA4 measurement ID>
   NUXT_USE_BACKEND=false
   NUXT_REVALIDATE_SECRET=<random 32-character secret>
   ```
   Leave `NUXT_CMS_API_URL` and `NUXT_CMS_API_KEY` unset until backend is ready.

4. **Custom domain**:
   - Amplify Console → Domain management → Add domain
   - Add `golgana.net` (apex) and `www.golgana.net`
   - Validate via DNS (Amplify will provide CNAME records to add to Route 53 or current DNS)
   - SSL via ACM is automatic
   - The middleware in `server/middleware/redirects.ts` handles `www → apex` 301

5. **Trigger first deployment**:
   - Push commits to `main`
   - Amplify auto-deploys
   - Watch build logs for any errors
   - Build typically takes 4-6 min

## Smoke-test post-deploy

Replace `<amplify-url>` with the temporary `*.amplifyapp.com` URL Amplify provides:

```bash
# Home renders
curl -s -o /dev/null -w "home: %{http_code}\n" https://<amplify-url>/

# OG image generates
curl -s -o /dev/null -w "og: %{http_code}\n" https://<amplify-url>/api/og/edicion/mundial-2026.png

# Sitemap renders with all URLs
curl -s https://<amplify-url>/sitemap.xml | grep -c "<loc>"
# Expected: 89+

# Robots.txt + llms.txt accessible
curl -s -o /dev/null -w "robots: %{http_code}\n" https://<amplify-url>/robots.txt
curl -s -o /dev/null -w "llms: %{http_code}\n" https://<amplify-url>/llms.txt
```

## Verify CWV in production

After custom domain is active, run Lighthouse against the production URLs:
```
npx lhci autorun --collect.url=https://golgana.net/ --collect.url=https://golgana.net/torneos/mundial/2026/
```

Production CWV should be significantly better than local (edge caching, image optimization).

## Rolling forward

- Push to `main` → auto-deploy
- Manual deploys: Amplify Console → "Run last build"
- Rollback: Amplify Console → Hosting environments → previous build → "Promote"

## Search Console + Bing + IndexNow

### Google Search Console

1. Go to https://search.google.com/search-console
2. Add property → choose "Domain" type → enter `golgana.net`
3. Verify via DNS TXT record (Amplify or Route 53):
   - GSC will provide a TXT record like `google-site-verification=...`
   - Add it as a TXT record on `golgana.net`
   - Click "Verify" in GSC
4. Submit sitemap:
   - Sitemaps → "Add a new sitemap" → enter `sitemap.xml` (relative to domain)
   - GSC fetches `https://golgana.net/sitemap.xml`
5. Wait 24-48h for first indexing data

### Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters
2. Click "Add a site" → option "Import from Google Search Console"
3. Sign in with the same Google account that owns GSC
4. Select `golgana.net` → import settings (verifies automatically)

### IndexNow

The site already has an IndexNow key file at `public/<KEY>.txt` (committed). The `robots.txt` references it.

Test IndexNow ping post-deploy:
```bash
KEY=$(cat public/*.txt | tail -1)  # or look it up
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"golgana.net\",
    \"key\": \"$KEY\",
    \"keyLocation\": \"https://golgana.net/$KEY.txt\",
    \"urlList\": [
      \"https://golgana.net/torneos/mundial/2026/\",
      \"https://golgana.net/selecciones/ecuador/\"
    ]
  }"
```
Expected: `200 OK` or `202 Accepted`.

The key in `public/` should remain stable. Save it in 1Password / team vault for reference.

## OG Image + Social Preview Validation

After deployment, validate OG images render correctly across major platforms.

### Facebook / Meta Sharing Debugger
1. Go to https://developers.facebook.com/tools/debug/
2. Test these URLs (scrape new each time):
   - `https://golgana.net/torneos/mundial/2026/`
   - `https://golgana.net/selecciones/ecuador/`
   - `https://golgana.net/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan-j1/`
3. Verify:
   - OG title matches `<title>` of the page (or `og:title` override)
   - OG description appears
   - 1200×630 image renders correctly (no cut-off text, branding visible)
4. If issues: adjust `server/utils/og-templates.ts` and redeploy

### Twitter / X Card Validator
1. Go to https://cards-dev.twitter.com/validator (or equivalent)
2. Test 2-3 URLs
3. Verify `summary_large_image` card renders with the same OG image
4. The `useSeo` composable already sets `twitterCard: 'summary_large_image'`

### LinkedIn Post Inspector
1. Go to https://www.linkedin.com/post-inspector/
2. Test 2-3 URLs
3. Verify image loads in LinkedIn previews

### Common issues
- **Image not refreshing:** Force re-scrape via Facebook debugger ("Scrape Again" button)
- **Text cut off:** Adjust font sizes in `server/utils/og-templates.ts` and redeploy
- **Image broken (404):** Check that `/api/og/[type]/[slug].png` returns 200 in production (test with curl)

## Pre-launch checklist (target: 2026-06-09)

Before announcing the site publicly, run through this list:

### Technical
- [ ] All 250+ URLs return 200 (no 404 unless intentional)
- [ ] Schema validation passes for 8 templates: `npx tsx scripts/validate-schema.ts` returns 0 errors
- [ ] Sitemap.xml generates: `curl https://golgana.net/sitemap.xml | grep -c "<loc>"` returns 89+
- [ ] robots.txt accessible at https://golgana.net/robots.txt
- [ ] llms.txt accessible at https://golgana.net/llms.txt
- [ ] IndexNow key file accessible at https://golgana.net/<key>.txt
- [ ] Lighthouse CI passes (or warnings within tolerance): `npx lhci autorun`
- [ ] All security headers present: `curl -I https://golgana.net/`
- [ ] 301 redirect www → apex working: `curl -I https://www.golgana.net/`
- [ ] 301 no-trailing-slash → with-slash working
- [ ] OG images render in Facebook/Twitter/LinkedIn debuggers
- [ ] Cookie banner appears on first visit
- [ ] GTM/GA4 fire only after consent grant

### Content
- [ ] Acerca de page has team editorial info, fuentes, contact
- [ ] All 4 institucionales render (acerca-de, contacto, privacidad, terminos)
- [ ] At least 15 articles in `content/noticias/` covering Mundial 2026
- [ ] Selección Ecuador has all 8 sub-pages with real content
- [ ] Plantilla has 26 jugadores filled in
- [ ] At least 3 partidos Premium (Ecuador J1, J2, J3) with previa text
- [ ] 12 grupos all have selecciones lists (D Premium, others stubs OK)
- [ ] 16 sedes confirmed in `2026.json`
- [ ] 22 campeones in `mundial.json` palmarés

### SEO setup
- [ ] Search Console verified (DNS TXT) + sitemap submitted
- [ ] Bing Webmaster imported from GSC
- [ ] IndexNow ping tested (returns 200/202)
- [ ] GTM container ID set in Amplify env vars
- [ ] GA4 measurement ID set in Amplify env vars

### Operational
- [ ] Custom domain `golgana.net` (apex) + `www.golgana.net` (CNAME) configured
- [ ] SSL via ACM active (HTTPS enforced)
- [ ] Amplify deployment successful (latest commit on main)
- [ ] Manual smoke-test of 5 key URLs after each deploy

### Launch day
- [ ] Tag launch commit:
  ```
  git tag -a launch-2026-06-09 -m "MVP launch — Mundial 2026"
  git push origin launch-2026-06-09
  ```
- [ ] Announce: social media, email list (when ready)
- [ ] Monitor first 48h:
  - GA4 RealTime — traffic flows
  - GSC Index Coverage — URLs being indexed
  - CloudFront/Amplify logs — no 5xx errors
  - Lighthouse on production URLs — CWV holding

## Post-launch monitoring

### Week 1
- Daily check of GSC Index Coverage
- Daily check of GA4 organic sessions
- Tag with `monitor-w1-<date>` if any major fixes deploy

### Month 1
- Weekly Lighthouse runs
- Review top 50 GSC queries for content gaps
- Add 5-10 new articles per week in `content/noticias/`

### Phase 2 (post-Mundial, July+)
- Add LigaPro Serie A, Serie B, Copa Ecuador
- Add 7 club pages (Emelec, Barcelona SC, etc.)
- Integrate real CMS backend (`NUXT_USE_BACKEND=true`)
