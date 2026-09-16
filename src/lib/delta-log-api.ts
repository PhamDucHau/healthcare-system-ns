import { supabase } from '@/lib/supabase';
import {
  toExamActivityLogEntry,
  type DoctorExamActivityLogEntry,
} from '@/lib/exam-activity-log';
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

export type DoctorExamActivityLogListParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export async function listDoctorExaminationActivityLog(
  params: DoctorExamActivityLogListParams = {},
): Promise<DeltaLogListResult<DoctorExamActivityLogEntry>> {
  const { data, error } = await supabase.rpc('list_doctor_examination_activity_log', {
    p_query: params.search?.trim() || null,
    p_page: params.page ?? 1,
    p_limit: params.limit ?? 10,
  });
  if (error) throw new Error(mapError(error.message));
  const payload = (data ?? { total: 0, rows: [] }) as RpcListPayload;
  const rows = (payload.rows ?? []) as Array<{
    id: string;
    exam_id: string;
    actor_id: string | null;
    actor_name: string | null;
    action: string;
    created_at: string;
    changed_fields?: unknown;
    related_exam_id?: string | null;
    patient_name: string | null;
    appointment_id: string | null;
  }>;
  return {
    total: Number(payload.total ?? 0),
    rows: rows.map((row) => ({
      ...toExamActivityLogEntry(row),
      patient_name: row.patient_name,
      appointment_id: row.appointment_id,
    })),
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
