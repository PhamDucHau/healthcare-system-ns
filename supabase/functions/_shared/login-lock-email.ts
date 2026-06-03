import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.1";

/** AC4: gửi email cảnh báo qua Supabase Auth (reset link) khi khóa tài khoản */
export async function sendAccountLockWarningEmail(
  admin: SupabaseClient,
  email: string,
): Promise<void> {
  const siteUrl = Deno.env.get("SITE_URL") ??
    Deno.env.get("SUPABASE_SITE_URL") ??
    "http://localhost:5173";

  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl.replace(/\/$/, "")}/forgot-password`,
  });

  if (error) {
    console.error("[login-lock-email]", error.message);
  }
}
