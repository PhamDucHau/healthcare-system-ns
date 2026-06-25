import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import {
  clientIp,
  clientUserAgent,
  writeAuditLog,
} from "../_shared/audit.ts";
import { PERMISSIONS, isAuthContext, requirePermission, requireStaffPortalRole } from "../_shared/rbac.ts";
import { generateTempPassword } from "../_shared/temp-password.ts";
import { syncRoleToAppMetadata } from "../_shared/user-profile.ts";
import { emailExists, signOutAllSessions } from "../_shared/supabase-admin.ts";
import type { PortalType } from "../_shared/portal.ts";

type UserStatus = "active" | "inactive" | "locked";

type ListBody = { action: "list"; search?: string; page?: number; limit?: number };
type GetBody = { action: "get"; userId: string };
type CreateBody = {
  action: "create";
  fullName: string;
  email: string;
  phone?: string;
  roleId: string;
  facilityId?: string | null;
  specialty?: string | null;
  status?: UserStatus;
};
type UpdateBody = {
  action: "update";
  userId: string;
  fullName?: string;
  phone?: string;
  roleId?: string;
  facilityId?: string | null;
  specialty?: string | null;
  status?: UserStatus;
};
type DeleteBody = { action: "delete"; userId: string };
type ResetPasswordBody = { action: "reset_password"; userId: string };
type FacilitiesBody = { action: "facilities" };
type CreateWalkinPatientBody = {
  action: "create_walkin_patient";
  fullName: string;
  email?: string;
  phone?: string;
};

type RequestBody =
  | ListBody
  | GetBody
  | CreateBody
  | CreateWalkinPatientBody
  | UpdateBody
  | DeleteBody
  | ResetPasswordBody
  | FacilitiesBody;

async function resolvePortalRole(
  admin: ReturnType<typeof import("../_shared/supabase-admin.ts").getAdminClient>,
  roleId: string,
): Promise<PortalType | null> {
  const { data } = await admin
    .from("roles")
    .select("portal_role")
    .eq("id", roleId)
    .maybeSingle();
  const pr = data?.portal_role;
  if (pr === "patient" || pr === "doctor" || pr === "admin") return pr;
  return null;
}

async function sendTempPasswordEmail(email: string): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) return;

  try {
    await fetch(`${url}/auth/v1/recover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify({ email }),
    });
  } catch (err) {
    console.warn("[sendTempPasswordEmail]", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "INVALID_JSON" }, 400);
  }

  const ip = clientIp(req);
  const ua = clientUserAgent(req);

  if (body.action === "facilities") {
    const auth = await requirePermission(req, PERMISSIONS.FACILITIES_READ);
    if (!isAuthContext(auth)) return auth;
    const { data, error } = await auth.admin.from("facilities").select("id, name, code").order("name");
    if (error) return jsonResponse({ error: "DB_ERROR", message: error.message }, 500);
    return jsonResponse({ facilities: data ?? [] });
  }

  if (body.action === "list") {
    const auth = await requirePermission(req, PERMISSIONS.USERS_READ);
    if (!isAuthContext(auth)) return auth;

    const page = Math.max(1, body.page ?? 1);
    const limit = Math.min(100, Math.max(1, body.limit ?? 20));
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const search = body.search?.trim();

    let query = auth.admin
      .from("user_profiles")
      .select(
        "user_id, email, full_name, phone, role, status, specialty, facility_id, role_id, updated_at, facilities(name), roles(id, name, slug, portal_role)",
        { count: "exact" },
      )
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }

    const { data, error, count } = await query;
    if (error) return jsonResponse({ error: "DB_ERROR", message: error.message }, 500);

    return jsonResponse({
      users: data ?? [],
      total: count ?? 0,
      page,
      limit,
    });
  }

  if (body.action === "get") {
    const auth = await requirePermission(req, PERMISSIONS.USERS_READ);
    if (!isAuthContext(auth)) return auth;

    const { data, error } = await auth.admin
      .from("user_profiles")
      .select(
        "user_id, email, full_name, phone, role, status, specialty, facility_id, role_id, facilities(name), roles(id, name, slug, portal_role)",
      )
      .eq("user_id", body.userId)
      .maybeSingle();

    if (error) return jsonResponse({ error: "DB_ERROR", message: error.message }, 500);
    if (!data) return jsonResponse({ error: "NOT_FOUND" }, 404);
    return jsonResponse({ user: data });
  }

  if (body.action === "create") {
    const auth = await requirePermission(req, PERMISSIONS.USERS_CREATE);
    if (!isAuthContext(auth)) return auth;

    const email = body.email.trim().toLowerCase();
    if (!email || !body.fullName?.trim() || !body.roleId) {
      return jsonResponse({ error: "VALIDATION", message: "Thiếu email, tên hoặc role" }, 400);
    }

    if (await emailExists(email)) {
      return jsonResponse({ error: "EMAIL_EXISTS", message: "Email đã tồn tại" }, 409);
    }

    const portalRole = await resolvePortalRole(auth.admin, body.roleId);
    const tempPassword = generateTempPassword(12);

    const { data: created, error: createError } = await auth.admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: body.fullName.trim() },
    });

    if (createError || !created.user?.id) {
      return jsonResponse(
        { error: "CREATE_FAILED", message: createError?.message ?? "Không tạo được user" },
        500,
      );
    }

    const userId = created.user.id;
    const status: UserStatus = body.status ?? "active";

    const { error: profileError } = await auth.admin.from("user_profiles").upsert(
      {
        user_id: userId,
        email,
        full_name: body.fullName.trim(),
        phone: body.phone?.trim() || null,
        role_id: body.roleId,
        role: portalRole ?? "patient",
        facility_id: body.facilityId || null,
        specialty: body.specialty?.trim() || null,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (profileError) {
      await auth.admin.auth.admin.deleteUser(userId);
      return jsonResponse({ error: "DB_ERROR", message: profileError.message }, 500);
    }

    if (portalRole) await syncRoleToAppMetadata(auth.admin, userId, portalRole);

    await sendTempPasswordEmail(email);

    await writeAuditLog(auth.admin, {
      eventType: "USER_CREATED",
      userId: auth.userId,
      email: auth.email,
      ipAddress: ip,
      userAgent: ua,
      metadata: {
        targetUserId: userId,
        targetEmail: email,
        roleId: body.roleId,
        facilityId: body.facilityId ?? null,
      },
    });

    return jsonResponse({
      message: "Đã tạo user và gửi email thông báo",
      userId,
      tempPassword,
    });
  }

  if (body.action === "create_walkin_patient") {
    const auth = await requireStaffPortalRole(req, ["admin", "doctor"]);
    if (!isAuthContext(auth)) return auth;

    if (!body.fullName?.trim()) {
      return jsonResponse({ error: "VALIDATION", message: "Thiếu tên bệnh nhân" }, 400);
    }

    const phone = body.phone?.trim() || null;
    const email = (body.email?.trim() || (
      phone
        ? `patient_${phone.replace(/\D/g, "")}@walkin.internal`
        : `walkin_${Date.now()}@walkin.internal`
    )).toLowerCase();

    if (await emailExists(email)) {
      return jsonResponse({ error: "EMAIL_EXISTS", message: "Email đã tồn tại" }, 409);
    }

    const { data: patientRole, error: roleError } = await auth.admin
      .from("roles")
      .select("id")
      .eq("slug", "patient")
      .maybeSingle();

    if (roleError || !patientRole?.id) {
      return jsonResponse({ error: "DB_ERROR", message: "Không tìm thấy role bệnh nhân" }, 500);
    }

    const tempPassword = generateTempPassword(12);

    const { data: created, error: createError } = await auth.admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: body.fullName.trim() },
    });

    if (createError || !created.user?.id) {
      return jsonResponse(
        { error: "CREATE_FAILED", message: createError?.message ?? "Không tạo được user" },
        500,
      );
    }

    const userId = created.user.id;

    const { error: profileError } = await auth.admin.from("user_profiles").upsert(
      {
        user_id: userId,
        email,
        full_name: body.fullName.trim(),
        phone,
        role_id: patientRole.id,
        role: "patient",
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (profileError) {
      await auth.admin.auth.admin.deleteUser(userId);
      return jsonResponse({ error: "DB_ERROR", message: profileError.message }, 500);
    }

    await syncRoleToAppMetadata(auth.admin, userId, "patient");

    await writeAuditLog(auth.admin, {
      eventType: "WALKIN_PATIENT_CREATED",
      userId: auth.userId,
      email: auth.email,
      ipAddress: ip,
      userAgent: ua,
      metadata: { targetUserId: userId, targetEmail: email },
    });

    return jsonResponse({ message: "Đã tạo tài khoản bệnh nhân walk-in", userId });
  }

  if (body.action === "update") {
    const auth = await requirePermission(req, PERMISSIONS.USERS_UPDATE);
    if (!isAuthContext(auth)) return auth;

    if (body.userId === auth.userId && body.status && body.status !== "active") {
      return jsonResponse(
        { error: "SELF_LOCK", message: "Không thể tự khóa tài khoản của chính mình" },
        403,
      );
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.fullName !== undefined) updates.full_name = body.fullName.trim();
    if (body.phone !== undefined) updates.phone = body.phone.trim() || null;
    if (body.facilityId !== undefined) updates.facility_id = body.facilityId;
    if (body.specialty !== undefined) updates.specialty = body.specialty?.trim() || null;
    if (body.status !== undefined) updates.status = body.status;

    if (body.roleId) {
      updates.role_id = body.roleId;
      const portalRole = await resolvePortalRole(auth.admin, body.roleId);
      if (portalRole) {
        updates.role = portalRole;
        await syncRoleToAppMetadata(auth.admin, body.userId, portalRole);
      }
    }

    const { data, error } = await auth.admin
      .from("user_profiles")
      .update(updates)
      .eq("user_id", body.userId)
      .select("user_id, email, full_name, status")
      .maybeSingle();

    if (error) return jsonResponse({ error: "DB_ERROR", message: error.message }, 500);
    if (!data) return jsonResponse({ error: "NOT_FOUND" }, 404);

    if (body.status === "locked" || body.status === "inactive") {
      await signOutAllSessions(body.userId);
      await writeAuditLog(auth.admin, {
        eventType: "USER_LOCKED",
        userId: auth.userId,
        email: auth.email,
        ipAddress: ip,
        userAgent: ua,
        metadata: { targetUserId: body.userId, status: body.status },
      });
    }

    await writeAuditLog(auth.admin, {
      eventType: "USER_UPDATED",
      userId: auth.userId,
      email: auth.email,
      ipAddress: ip,
      userAgent: ua,
      metadata: { targetUserId: body.userId, updates },
    });

    return jsonResponse({ message: "Đã cập nhật user", user: data });
  }

  if (body.action === "delete") {
    const auth = await requirePermission(req, PERMISSIONS.USERS_DELETE);
    if (!isAuthContext(auth)) return auth;

    if (body.userId === auth.userId) {
      return jsonResponse(
        { error: "SELF_DELETE", message: "Không thể xóa tài khoản của chính mình" },
        403,
      );
    }

    const { data: profile } = await auth.admin
      .from("user_profiles")
      .select("email")
      .eq("user_id", body.userId)
      .maybeSingle();

    if (!profile) return jsonResponse({ error: "NOT_FOUND" }, 404);

    await signOutAllSessions(body.userId);
    const { error: authError } = await auth.admin.auth.admin.deleteUser(body.userId);
    if (authError) {
      return jsonResponse({ error: "DELETE_FAILED", message: authError.message }, 500);
    }

    await writeAuditLog(auth.admin, {
      eventType: "USER_DELETED",
      userId: auth.userId,
      email: auth.email,
      ipAddress: ip,
      userAgent: ua,
      metadata: { targetUserId: body.userId, targetEmail: profile.email },
    });

    return jsonResponse({ message: "Đã xóa user" });
  }

  if (body.action === "reset_password") {
    const auth = await requirePermission(req, PERMISSIONS.USERS_RESET_PASSWORD);
    if (!isAuthContext(auth)) return auth;

    const { data: profile } = await auth.admin
      .from("user_profiles")
      .select("email")
      .eq("user_id", body.userId)
      .maybeSingle();

    if (!profile?.email) return jsonResponse({ error: "NOT_FOUND" }, 404);

    const tempPassword = generateTempPassword(12);
    const { error: pwdError } = await auth.admin.auth.admin.updateUserById(body.userId, {
      password: tempPassword,
    });
    if (pwdError) {
      return jsonResponse({ error: "RESET_FAILED", message: pwdError.message }, 500);
    }

    await signOutAllSessions(body.userId);
    await sendTempPasswordEmail(profile.email);

    await writeAuditLog(auth.admin, {
      eventType: "ADMIN_PASSWORD_RESET",
      userId: auth.userId,
      email: auth.email,
      ipAddress: ip,
      userAgent: ua,
      metadata: { targetUserId: body.userId, targetEmail: profile.email },
    });

    return jsonResponse({
      message: "Đã reset mật khẩu và gửi email thông báo",
      tempPassword,
    });
  }

  return jsonResponse({ error: "UNKNOWN_ACTION" }, 400);
});
