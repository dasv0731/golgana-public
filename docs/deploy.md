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
