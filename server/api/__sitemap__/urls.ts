import { getDynamicSitemapUrls } from '~/server/utils/sitemap-urls';

// `defineSitemapEventHandler` is auto-imported in server context by @nuxtjs/sitemap
export default defineSitemapEventHandler(async () => {
  return await getDynamicSitemapUrls();
});
