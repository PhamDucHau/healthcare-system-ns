import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
  );
}

// Intercept PostgREST 401s: sign out and redirect to login.
// Auth-endpoint 401s (/auth/v1/) are intentionally excluded to avoid loops.
let _redirecting = false;

const fetchWithAuthGuard: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await globalThis.fetch(input, init);

  if (
    response.status === 401 &&
    !_redirecting &&
    typeof input === "string" &&
    input.includes("/rest/v1/")
  ) {
    _redirecting = true;
    // Fire-and-forget — page is about to unload anyway
    supabase.auth.signOut().finally(() => {
      window.location.href = "/login";
    });
  }

  return response;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: { fetch: fetchWithAuthGuard },
});
