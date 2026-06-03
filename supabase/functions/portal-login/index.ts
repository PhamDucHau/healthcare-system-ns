import { clientIp, clientUserAgent, writeAuditLog } from "../_shared/audit.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { sendAccountLockWarningEmail } from "../_shared/login-lock-email.ts";
import {
  ACCESS_TTL_BY_ROLE,
  isPortalType,
  type PortalType,
  portalLoginMessage,
  REFRESH_TTL_SECONDS,
} from "../_shared/portal.ts";
import {
  getRedis,
  loginAttemptKey,
  loginLockKey,
  LOGIN_LOCK_TTL_SECONDS,
  MAX_LOGIN_ATTEMPTS,
} from "../_shared/redis.ts";
import {
  getUserProfileForLogin,
  isProfileActive,
  normalizePortalRole,
  syncRoleToAppMetadata,
} from "../_shared/user-profile.ts";
import { getAdminClient } from "../_shared/supabase-admin.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

async function revokeSession(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) return;

  try {
    await fetch(`${url}/auth/v1/logout?scope=local`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    /* best-effort */
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const ip = clientIp(req);
  const userAgent = clientUserAgent(req);

  try {
    const body = await req.json() as {
      email?: string;
      password?: string;
      portal?: string;
    };
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body.password === "string" ? body.password : "";
    const portalRaw = typeof body.portal === "string" ? body.portal.trim() : "";
    const unifiedMode = !portalRaw || portalRaw === "auto";
    const requestedPortal = unifiedMode ? null : portalRaw;

    if (!email || !EMAIL_RE.test(email)) {
      return jsonResponse({ error: "INVALID_EMAIL" }, 422);
    }
    if (!password) {
      return jsonResponse({ error: "INVALID_CREDENTIALS", message: "Email hoặc mật khẩu không đúng" }, 401);
    }
    if (!unifiedMode && !isPortalType(requestedPortal)) {
      return jsonResponse({ error: "INVALID_PORTAL" }, 422);
    }

    const admin = getAdminClient();
    const redis = getRedis();

    const lock = await redis.get(loginLockKey(email));
    if (lock) {
      const retryAfter = await redis.ttl(loginLockKey(email));
      await writeAuditLog(admin, {
        eventType: "LOGIN_FAILED",
        email,
        ipAddress: ip,
        userAgent,
        metadata: { portal: portalRaw || "unified", reason: "account_locked" },
      });
      return jsonResponse(
        {
          error: "ACCOUNT_LOCKED",
          message: "Tài khoản tạm khóa do đăng nhập sai quá nhiều lần",
          retryAfter: retryAfter > 0 ? retryAfter : LOGIN_LOCK_TTL_SECONDS,
        },
        429,
      );
    }

    const { data: signInData, error: signInError } = await admin.auth
      .signInWithPassword({ email, password });

    if (signInError || !signInData.session || !signInData.user) {
      const attempts = await redis.incr(loginAttemptKey(email));
      await redis.expire(loginAttemptKey(email), LOGIN_LOCK_TTL_SECONDS);

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        await redis.set(loginLockKey(email), "1", { ex: LOGIN_LOCK_TTL_SECONDS });
        await redis.del(loginAttemptKey(email));
        await sendAccountLockWarningEmail(admin, email);
        await writeAuditLog(admin, {
          eventType: "LOGIN_LOCKED",
          email,
          ipAddress: ip,
          userAgent,
          metadata: { portal: portalRaw || "unified", attempts },
        });
        return jsonResponse(
          {
            error: "ACCOUNT_LOCKED",
            message: "Đã khóa 15 phút sau 5 lần sai mật khẩu. Email cảnh báo đã được gửi.",
            retryAfter: LOGIN_LOCK_TTL_SECONDS,
          },
          429,
        );
      }

      await writeAuditLog(admin, {
        eventType: "LOGIN_FAILED",
        email,
        ipAddress: ip,
        userAgent,
        metadata: { portal: portalRaw || "unified", attemptsLeft: MAX_LOGIN_ATTEMPTS - attempts },
      });

      return jsonResponse(
        {
          error: "INVALID_CREDENTIALS",
          message: "Email hoặc mật khẩu không đúng",
          attemptsLeft: MAX_LOGIN_ATTEMPTS - attempts,
        },
        401,
      );
    }

    const session = signInData.session;
    const userId = signInData.user.id;

    const profile = await getUserProfileForLogin(admin, userId, email);

    if (!profile) {
      await revokeSession(session.access_token, session.refresh_token);
      await writeAuditLog(admin, {
        eventType: "LOGIN_WRONG_PORTAL",
        userId,
        email,
        ipAddress: ip,
        userAgent,
        metadata: { portal: portalRaw || "unified", reason: "profile_not_found" },
      });
      return jsonResponse(
        {
          error: "PROFILE_NOT_FOUND",
          message: "Chưa có hồ sơ user. Liên hệ quản trị để được gán role.",
          userRole: null,
          expectedPortal: requestedPortal,
          authUserId: userId,
          hint:
            "So sánh authUserId với user_profiles.user_id trong Supabase. Nếu khác, cập nhật user_id hoặc email cho khớp auth.users.",
        },
        403,
      );
    }

    if (!isProfileActive(profile.status)) {
      await revokeSession(session.access_token, session.refresh_token);
      return jsonResponse(
        {
          error: "ACCOUNT_INACTIVE",
          message: "Tài khoản đã bị khóa hoặc ngưng hoạt động",
          userRole: profile.role,
        },
        403,
      );
    }

    const userRole = normalizePortalRole(profile.role);

    if (!userRole) {
      await revokeSession(session.access_token, session.refresh_token);
      return jsonResponse(
        {
          error: "NO_ROLE",
          message: "Tài khoản chưa được gán role. Liên hệ quản trị.",
          userRole: null,
        },
        403,
      );
    }

    if (!unifiedMode && requestedPortal && userRole !== requestedPortal) {
      await revokeSession(session.access_token, session.refresh_token);
      await writeAuditLog(admin, {
        eventType: "LOGIN_WRONG_PORTAL",
        userId,
        email,
        ipAddress: ip,
        userAgent,
        metadata: {
          portal: requestedPortal,
          userRole,
        },
      });
      return jsonResponse(
        {
          error: "WRONG_PORTAL",
          message: portalLoginMessage(requestedPortal as PortalType),
          userRole,
          expectedPortal: requestedPortal,
        },
        403,
      );
    }

    await redis.del(loginAttemptKey(email));
    await syncRoleToAppMetadata(admin, userId, userRole);

    await writeAuditLog(admin, {
      eventType: "LOGIN_SUCCESS",
      userId,
      email,
      ipAddress: ip,
      userAgent,
      metadata: { portal: unifiedMode ? "unified" : requestedPortal, role: userRole },
    });

    return jsonResponse({
      message: "Đăng nhập thành công",
      portal: userRole,
      role: userRole,
      accessExpiresIn: ACCESS_TTL_BY_ROLE[userRole],
      refreshExpiresIn: REFRESH_TTL_SECONDS,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        expires_at: session.expires_at,
        token_type: session.token_type,
      },
    });
  } catch (err) {
    console.error("[portal-login]", err instanceof Error ? err.name : "error");
    return jsonResponse({ error: "LOGIN_FAILED" }, 500);
  }
});
