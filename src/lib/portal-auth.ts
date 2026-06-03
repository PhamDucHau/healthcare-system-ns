import type { Session } from "@supabase/supabase-js";
import {
  isPortalType,
  type PortalType,
  PORTAL_CONFIG,
} from "@/types/portal";

export function getSessionRole(session: Session | null): PortalType | null {
  if (!session) return null;

  const appRole = session.user.app_metadata?.role;
  if (typeof appRole === "string" && isPortalType(appRole)) {
    return appRole;
  }

  try {
    const payload = JSON.parse(
      atob(session.access_token.split(".")[1] ?? ""),
    ) as { user_role?: string };
    if (payload.user_role && isPortalType(payload.user_role)) {
      return payload.user_role;
    }
  } catch {
    /* ignore */
  }

  return null;
}

export function homePathForRole(role: PortalType | null): string {
  if (role && PORTAL_CONFIG[role]) return PORTAL_CONFIG[role].homePath;
  return PORTAL_CONFIG.patient.homePath;
}

export function loginPathForPortal(portal: PortalType): string {
  return PORTAL_CONFIG[portal].loginPath;
}

export function loginPathForRole(role: PortalType | null): string {
  if (role && PORTAL_CONFIG[role]) return PORTAL_CONFIG[role].loginPath;
  return PORTAL_CONFIG.patient.loginPath;
}
