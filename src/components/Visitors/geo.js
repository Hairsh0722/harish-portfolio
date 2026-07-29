// Approximate location via a free, no-key geo-IP service (ipwho.is).
// Best-effort only: resolves to null on any failure/timeout so logging a
// visit never blocks or breaks. We deliberately keep only the coarse
// location + network org — the raw IP address is NOT stored anywhere.
export async function lookupGeo(timeoutMs = 2500) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch("https://ipwho.is/", { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const d = await res.json();
    if (!d || d.success === false) return null;
    return {
      city: d.city || "",
      region: d.region || "",
      country: d.country || "",
      countryCode: d.country_code || "",
      // Network operator / company — a useful hint (e.g. a corporate network).
      org: (d.connection && (d.connection.org || d.connection.isp)) || "",
    };
  } catch (_) {
    return null;
  }
}
