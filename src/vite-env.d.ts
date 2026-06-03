/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Override Edge Functions base URL (e.g. http://127.0.0.1:54321/functions/v1). */
  readonly VITE_SUPABASE_FUNCTIONS_URL?: string;
  /** Base URL for CCCD OCR API (default http://localhost:3000). */
  readonly VITE_OCR_CCCD_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
