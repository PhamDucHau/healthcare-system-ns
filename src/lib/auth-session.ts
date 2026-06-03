import { portalLogout } from "@/lib/portal-auth-api";
import { supabase } from "@/lib/supabase";

let isClearingSession = false;

/** Xóa token Supabase trong localStorage + signOut local */
export async function clearAuthStorage(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    /* best-effort */
  }

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("sb-") || key.includes("supabase.auth"))) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }

  const url = import.meta.env.VITE_SUPABASE_URL;
  if (url) {
    try {
      const ref = new URL(url).hostname.split(".")[0];
      localStorage.removeItem(`sb-${ref}-auth-token`);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Token hết hạn / không hợp lệ: xóa session và về /home để đăng nhập lại.
 */
export async function clearAuthAndRedirectHome(): Promise<never> {
  if (!isClearingSession) {
    isClearingSession = true;
    await clearAuthStorage();
    window.location.replace("/home");
  }

  return new Promise(() => {
    /* redirect in progress */
  }) as never;
}

export function isUnauthorizedError(
  status: number,
  code?: string,
): boolean {
  return status === 401 || code === "UNAUTHORIZED";
}

/** Đăng xuất: revoke session + xóa token local → trang chủ */
export async function logoutAndRedirectTo(landingPath = "/"): Promise<void> {
  if (isClearingSession) return;
  isClearingSession = true;
  try {
    await portalLogout();
  } catch {
    /* vẫn xóa local */
  }
  await clearAuthStorage();
  window.location.replace(landingPath);
}
