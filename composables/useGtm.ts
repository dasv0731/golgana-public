export function useGtm() {
  const config = useRuntimeConfig();
  const consent = useState<string>('cookieConsent');

  const inject = () => {
    if (!config.public.gtmId || consent.value !== 'granted') return;
    if (typeof window === 'undefined') return;
    if (document.getElementById('gtm-script')) return;

    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${config.public.gtmId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  };

  return { inject };
}
