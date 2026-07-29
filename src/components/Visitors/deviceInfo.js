// Lightweight, dependency-free environment sniffing for the visit log.
// Coarse on purpose — enough to answer "phone or laptop, which browser,
// what language/timezone" without a UA-parsing library.
export function deviceInfo() {
  const ua = (navigator.userAgent || "").toString();

  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Unknown";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua)) browser = "Safari";

  const isTablet = /ipad/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua));
  const isMobile = !isTablet && /mobi|iphone|ipod/i.test(ua);
  const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  const w = window.screen ? window.screen.width : 0;
  const h = window.screen ? window.screen.height : 0;

  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (_) {
    /* ignore */
  }

  return {
    device,
    os,
    browser,
    screen: w && h ? `${w}×${h}` : "",
    lang: navigator.language || "",
    tz,
  };
}
