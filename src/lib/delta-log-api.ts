import { supabase } from '@/lib/supabase';
import type {
  AppointmentsAuditEntry,
  AppointmentsAuditListParams,
  DeltaLogListResult,
  SignatureLogEntry,
  SignatureLogListParams,
  SystemAuditEntry,
  SystemAuditListParams,
} from '@/types/delta-log';

type RpcListPayload = { total?: number; rows?: unknown[] };

function mapError(msg: string): string {
  if (msg.includes('FORBIDDEN')) return 'Bạn không có quyền truy cập.';
  return msg;
}

// ─── Appointments Audit Log ──────────────────────────────────────────────────

export async function listAppointmentsAuditLog(
  params: AppointmentsAuditListParams = {},
): Promise<DeltaLogListResult<AppointmentsAuditEntry>> {
  const { data, error } = await supabase.rpc('list_appointments_audit_log', {
    p_query: params.search?.trim() || null,
    p_page: params.page ?? 1,
    p_limit: params.limit ?? 10,
    p_action: params.action?.trim() || null,
  });
  if (error) throw new Error(mapError(error.message));
  const payload = (data ?? { total: 0, rows: [] }) as RpcListPayload;
  return {
    total: Number(payload.total ?? 0),
    rows: (payload.rows ?? []) as AppointmentsAuditEntry[],
  };
}

export async function listDoctorAppointmentsAuditLog(
  params: AppointmentsAuditListParams = {},
): Promise<DeltaLogListResult<AppointmentsAuditEntry>> {
  const { data, error } = await supabase.rpc('list_doctor_appointments_audit_log', {
    p_query: params.search?.trim() || null,
    p_page: params.page ?? 1,
    p_limit: params.limit ?? 10,
    p_action: params.action?.trim() || null,
  });
  if (error) throw new Error(mapError(error.message));
  const payload = (data ?? { total: 0, rows: [] }) as RpcListPayload;
  return {
    total: Number(payload.total ?? 0),
    rows: (payload.rows ?? []) as AppointmentsAuditEntry[],
  };
}

// ─── System Audit Log ────────────────────────────────────────────────────────

export async function listSystemAuditLog(
  params: SystemAuditListParams = {},
): Promise<DeltaLogListResult<SystemAuditEntry>> {
  const { data, error } = await supabase.rpc('list_system_audit_log', {
    p_query: params.search?.trim() || null,
    p_page: params.page ?? 1,
    p_limit: params.limit ?? 10,
    p_event_type: params.eventType?.trim() || null,
  });
  if (error) throw new Error(mapError(error.message));
  const payload = (data ?? { total: 0, rows: [] }) as RpcListPayload;
  return {
    total: Number(payload.total ?? 0),
    rows: (payload.rows ?? []) as SystemAuditEntry[],
  };
}

// ─── Signature Logs ──────────────────────────────────────────────────────────

export async function listSignatureLogs(
  params: SignatureLogListParams = {},
): Promise<DeltaLogListResult<SignatureLogEntry>> {
  const { data, error } = await supabase.rpc('list_signature_logs', {
    p_query: params.search?.trim() || null,
    p_page: params.page ?? 1,
    p_limit: params.limit ?? 10,
    p_target_type: params.targetType?.trim() || null,
  });
  if (error) throw new Error(mapError(error.message));
  const payload = (data ?? { total: 0, rows: [] }) as RpcListPayload;
  return {
    total: Number(payload.total ?? 0),
    rows: (payload.rows ?? []) as SignatureLogEntry[],
  };
}
