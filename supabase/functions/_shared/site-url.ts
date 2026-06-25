/** Public app origin for links in emails (no trailing slash). Set SITE_URL in supabase/functions/.env or Supabase secrets. */
export function getSiteUrl(): string {
  const raw =
    Deno.env.get("SITE_URL") ??
    Deno.env.get("VITE_SITE_URL") ??
    Deno.env.get("SUPABASE_SITE_URL") ??
    "http://localhost:8080";
  return raw.replace(/\/$/, "");
}
