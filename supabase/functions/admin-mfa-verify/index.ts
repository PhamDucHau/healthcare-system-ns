import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { clientIp, clientUserAgent, writeAuditLog } from "../_shared/audit.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import {
  ACCESS_TTL_BY_ROLE,
  REFRESH_TTL_SECONDS,
} from "../_shared/portal.ts";
import {
  adminMfaAttemptKey,
  adminMfaSessionKey,
  ADMIN_MFA_TTL_SECONDS,
  getRedis,
  MAX_MFA_ATTEMPTS,
} from "../_shared/redis.ts";
import { getAdminClient } from "../_shared/supabase-admin.ts";

const OTP_RE = /^\d{6}$/;

type PendingMfa = {
  email: string;
  password: string;
  portal: string;
  userId: string;
};

function getAnonClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new Error("Supabase anon credentials not configured");
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const ip = clientIp(req);
  const userAgent = clientUserAgent(req);

  try {
    const body = await req.json() as { mfaToken?: string; otp?: string };
    const mfaToken = typeof body.mfaToken === "string" ? body.mfaToken.trim() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!mfaToken) {
      return jsonResponse({ error: "INVALID_MFA_TOKEN" }, 422);
    }
    if (!OTP_RE.test(otp)) {
      return jsonResponse({ error: "INVALID_OTP", message: "OTP không hợp lệ" }, 422);
    }

    const redis = getRedis();

    const sessionJson = await redis.get(adminMfaSessionKey(mfaToken));
    if (!sessionJson) {
      return jsonResponse({
        error: "MFA_TOKEN_EXPIRED",
        message: "Phiên MFA đã hết hạn. Vui lòng đăng nhập lại.",
      }, 410);
    }

    const pending: PendingMfa = JSON.parse(sessionJson);
    const admin = getAdminClient();
    const anonClient = getAnonClient();

    // Xác minh OTP qua Supabase (admin client, như forgot-password-verify-otp)
    const { error: verifyError } = await admin.auth.verifyOtp({
      email: pending.email,
      token: otp,
      type: "email",
    });

    if (verifyError) {
      const attempts = await redis.incr(adminMfaAttemptKey(mfaToken));
      await redis.expire(adminMfaAttemptKey(mfaToken), ADMIN_MFA_TTL_SECONDS);

      await writeAuditLog(admin, {
        eventType: "ADMIN_MFA_FAILED",
        userId: pending.userId,
        email: pending.email,
        ipAddress: ip,
        userAgent,
        metadata: { attempts },
      });

      if (attempts >= MAX_MFA_ATTEMPTS) {
        await redis.del(adminMfaSessionKey(mfaToken));
        await redis.del(adminMfaAttemptKey(mfaToken));
        return jsonResponse({
          error: "MFA_LOCKED",
          message: "Nhập sai OTP quá nhiều lần. Vui lòng đăng nhập lại.",
        }, 429);
      }

      return jsonResponse({
        error: "INVALID_OTP",
        message: "Mã OTP không đúng",
        attemptsLeft: MAX_MFA_ATTEMPTS - attempts,
      }, 400);
    }

    // OTP đúng — sign in lại với password để lấy session chuẩn
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: pending.email,
      password: pending.password,
    });

    if (signInError || !signInData?.session) {
      console.error("[admin-mfa-verify] re-signin error:", signInError?.message);
      return jsonResponse({ error: "SESSION_CREATE_FAILED", message: "Không thể tạo phiên đăng nhập" }, 500);
    }

    await redis.del(adminMfaSessionKey(mfaToken));
    await redis.del(adminMfaAttemptKey(mfaToken));

    await writeAuditLog(admin, {
      eventType: "ADMIN_MFA_SUCCESS",
      userId: pending.userId,
      email: pending.email,
      ipAddress: ip,
      userAgent,
      metadata: { portal: pending.portal },
    });

    const newSession = signInData.session;
    return jsonResponse({
      message: "Đăng nhập thành công",
      portal: "admin",
      role: "admin",
      accessExpiresIn: ACCESS_TTL_BY_ROLE["admin"],
      refreshExpiresIn: REFRESH_TTL_SECONDS,
      session: {
        access_token: newSession.access_token,
        refresh_token: newSession.refresh_token,
        expires_in: newSession.expires_in,
        expires_at: newSession.expires_at,
        token_type: newSession.token_type,
      },
    });
  } catch (err) {
    console.error("[admin-mfa-verify]", err instanceof Error ? err.name : "error");
    return jsonResponse({ error: "MFA_VERIFY_FAILED" }, 500);
  }
});
