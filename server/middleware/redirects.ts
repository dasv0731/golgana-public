export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  // www → apex
  if (url.hostname.startsWith('www.')) {
    const target = `https://${url.hostname.replace('www.', '')}${url.pathname}${url.search}`;
    return sendRedirect(event, target, 301);
  }

  // Sin trailing slash → con trailing slash (excepto /api/* y archivos)
  if (
    !url.pathname.endsWith('/') &&
    !url.pathname.startsWith('/api/') &&
    !url.pathname.startsWith('/_nuxt/') &&
    !url.pathname.includes('.') &&
    url.pathname !== '/'
  ) {
    return sendRedirect(event, `${url.pathname}/${url.search}`, 301);
  }
});
