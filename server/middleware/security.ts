export default defineEventHandler((event) => {
  setHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  setHeader(event, 'X-Content-Type-Options', 'nosniff');
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin');
  setHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  setHeader(
    event,
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com",
  );
});
