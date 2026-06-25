/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Public app origin for patient-facing links (mirror SITE_URL in .env). */
  readonly VITE_SITE_URL?: string;
  /** Base URL for CCCD OCR API (default http://localhost:3000). */
  readonly VITE_OCR_CCCD_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
