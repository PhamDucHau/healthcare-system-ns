import { supabase } from "@/lib/supabase";
import type {
  AdminAppointment,
  AdminAppointmentFilters,
  PatientSearchResult,
} from "@/types/admin-appointment";

// ─── Fetch appointments (direct PostgREST — no custom RPC needed) ─────────────

export async function fetchAdminAppointments(
  filters: AdminAppointmentFilters = {}
): Promise<AdminAppointment[]> {
  let query = supabase
    .from("appointments")
    .select(`
      *,
      specialties ( name, icon ),
      appointment_slots ( slot_date, start_time, end_time, doctor_id,
        user_profiles!appointment_slots_doctor_id_fkey ( full_name )
      ),
      patient ( legal_first_name, legal_last_name, phone_number, date_of_birth ),
      pre_consultations ( status, flags ),
      vital_signs ( id )
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  // Server-side simple column filters
  if (filters.status)       query = query.eq("status", filters.status);
  if (filters.specialty_id) query = query.eq("specialty_id", filters.specialty_id);

  const { data, error } = await query;
  if (error) throw new Error(mapAdminError(error.message));

  let rows = (data ?? []) as Record<string, any>[];

  // Client-side filters for joined / range fields
  if (filters.date_from || filters.date_to) {
    rows = rows.filter((r) => {
      const d = (r.appointment_slots as any)?.slot_date ?? r.created_at?.slice(0, 10);
      if (!d) return false;
      if (filters.date_from && d < filters.date_from) return false;
      if (filters.date_to   && d > filters.date_to)   return false;
      return true;
    });
  } else if (filters.date) {
    rows = rows.filter((r) => {
      const d = (r.appointment_slots as any)?.slot_date ?? r.created_at?.slice(0, 10);
      return d === filters.date;
    });
  }

  if (filters.doctor_id) {
    rows = rows.filter((r) => (r.appointment_slots as any)?.doctor_id === filters.doctor_id);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => {
      const pt = r.patient as any;
      if (!pt) return false;
      return (
        pt.phone_number?.toLowerCase().includes(q) ||
        pt.legal_first_name?.toLowerCase().includes(q) ||
        pt.legal_last_name?.toLowerCase().includes(q)
      );
    });
  }

  return rows.map((r) => {
    const sl  = (r.appointment_slots as any) ?? null;
    const pt  = (r.patient          as any) ?? null;
    const sp  = (r.specialties      as any) ?? null;
    const doc = sl?.user_profiles ?? null;
    const pc  = (Array.isArray(r.pre_consultations) ? r.pre_consultations[0] : r.pre_consultations) ?? null;
    const vitalsRaw = r.vital_signs as unknown[] | null;

    return {
      id:            r.id,
      patient_id:    r.patient_id,
      profile_id:    r.profile_id,
      specialty_id:  r.specialty_id,
      slot_id:       r.slot_id   ?? null,
      status:        r.status,
      note:          r.note      ?? null,
      walk_in:       r.walk_in   ?? false,
      cancel_reason: r.cancel_reason ?? null,
      cancelled_at:  r.cancelled_at  ?? null,
      cancelled_by:  r.cancelled_by  ?? null,
      created_at:    r.created_at,
      updated_at:    r.updated_at,
      specialty_name: sp?.name   ?? null,
      specialty_icon: sp?.icon   ?? null,
      slot_date:  sl?.slot_date  ?? null,
      start_time: sl?.start_time ?? null,
      end_time:   sl?.end_time   ?? null,
      doctor_id:  sl?.doctor_id  ?? null,
      patient_name: [pt?.legal_last_name, pt?.legal_first_name].filter(Boolean).join(" ") || null,
      patient_phone: pt?.phone_number  ?? null,
      patient_dob:   pt?.date_of_birth ?? null,
      doctor_name:   doc?.full_name    ?? null,
      pre_consult_status: !pc ? "none" : pc.status === "SUBMITTED" ? "submitted" : "draft",
      pre_consult_drug_allergy: Boolean(pc?.flags?.drug_allergy),
      pre_consult_severe_pain:  Boolean(pc?.flags?.severe_pain),
      has_vital_signs: Array.isArray(vitalsRaw) && vitalsRaw.length > 0,
    } as AdminAppointment;
  });
}

// ─── Fetch all patients (for walk-in picker) ─────────────────────────────────

export async function fetchAllPatients(): Promise<PatientSearchResult[]> {
  const { data, error } = await supabase
    .from("patient")
    .select("id, user_id, legal_first_name, legal_last_name, phone_number, id_number, date_of_birth, submitted_at")
    .order("legal_last_name", { ascending: true })
    .limit(200);

  if (error) throw new Error(mapAdminError(error.message));

  return (data ?? []).map((r) => ({
    profile_id:    r.id,
    patient_id:    r.user_id,
    patient_name:  [r.legal_last_name, r.legal_first_name].filter(Boolean).join(" "),
    phone_number:  r.phone_number  ?? null,
    id_number:     r.id_number     ?? null,
    date_of_birth: r.date_of_birth ?? null,
    submitted_at:  r.submitted_at  ?? null,
  })) as PatientSearchResult[];
}

// ─── Search patients (client-side filter on top of fetchAllPatients) ──────────

export async function searchPatients(query: string): Promise<PatientSearchResult[]> {
  const all = await fetchAllPatients();
  if (!query.trim()) return all;

  const q = query.trim().toLowerCase();
  return all.filter((p) =>
    p.patient_name?.toLowerCase().includes(q) ||
    p.phone_number?.toLowerCase().includes(q) ||
    p.id_number?.toLowerCase().includes(q)
  );
}

// ─── Walk-in ──────────────────────────────────────────────────────────────────

export async function adminCreateWalkin(
  profileId:   string,
  specialtyId: string,
  note:        string | null
): Promise<string> {
  const { data, error } = await supabase.rpc("admin_create_walkin", {
    p_profile_id:   profileId,
    p_specialty_id: specialtyId,
    p_note:         note,
  });
  if (error) throw new Error(mapAdminError(error.message));
  return data as string;
}

// Create a patient profile for a newly created auth user (walk-in quick-create)
export async function adminInsertPatientProfile(
  userId:    string,
  firstName: string,
  lastName:  string,
  phone:     string | null,
  dob:       string | null,
  idNumber:  string | null
): Promise<string> {
  const { data, error } = await supabase.rpc("admin_insert_patient_profile", {
    p_user_id:          userId,
    p_legal_first_name: firstName,
    p_legal_last_name:  lastName,
    p_phone_number:     phone,
    p_date_of_birth:    dob,
    p_id_number:        idNumber,
  });
  if (error) throw new Error(mapAdminError(error.message));
  return data as string;
}

export async function staffCreatePatientProfile(
  firstName: string,
  lastName:  string,
  phone:     string | null,
  dob:       string | null,
  idNumber:  string | null,
): Promise<string> {
  const { data, error } = await supabase.rpc("staff_create_patient_profile", {
    p_legal_first_name: firstName,
    p_legal_last_name:  lastName,
    p_phone_number:     phone,
    p_date_of_birth:    dob,
    p_id_number:        idNumber,
  });
  if (error) throw new Error(mapAdminError(error.message));
  return data as string;
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export async function adminCheckinAppointment(appointmentId: string): Promise<void> {
  const { error } = await supabase.rpc("admin_checkin_appointment", {
    p_appointment_id: appointmentId,
  });
  if (error) throw new Error(mapAdminError(error.message));
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

export async function adminCancelAppointment(
  appointmentId: string,
  reason: string
): Promise<{ emailSent: boolean; emailError?: string }> {
  const { error } = await supabase.rpc("admin_cancel_appointment", {
    p_appointment_id: appointmentId,
    p_reason: reason,
  });
  if (error) throw new Error(mapAdminError(error.message));

  const { data, error: fnErr } = await supabase.functions.invoke(
    "notify-appointment-cancelled",
    { body: { appointment_id: appointmentId, cancel_reason: reason } },
  );

  if (fnErr) {
    console.warn("[notify-cancelled]", fnErr.message);
    return { emailSent: false, emailError: fnErr.message };
  }

  const skipped = (data as Record<string, unknown>)?.skipped === true;
  return { emailSent: !skipped };
}

// ─── Reschedule ───────────────────────────────────────────────────────────────

export async function adminRescheduleAppointment(
  appointmentId: string,
  newSlotId: string
): Promise<void> {
  const { error } = await supabase.rpc("admin_reschedule_appointment", {
    p_appointment_id: appointmentId,
    p_new_slot_id: newSlotId,
  });
  if (error) throw new Error(mapAdminError(error.message));
}

// ─── Bulk cancel ──────────────────────────────────────────────────────────────

export async function adminBulkCancel(
  appointmentIds: string[],
  reason: string
): Promise<{ count: number; emailsSent: number }> {
  const { data, error } = await supabase.rpc("admin_bulk_cancel", {
    p_appointment_ids: appointmentIds,
    p_reason: reason,
  });
  if (error) throw new Error(mapAdminError(error.message));

  const results = await Promise.all(
    appointmentIds.map((id) =>
      supabase.functions
        .invoke("notify-appointment-cancelled", {
          body: { appointment_id: id, cancel_reason: reason },
        })
        .then(({ data: d, error: fnErr }) => {
          if (fnErr) console.warn("[notify-cancelled] bulk", id, fnErr.message);
          return !fnErr && (d as Record<string, unknown>)?.skipped !== true;
        }),
    ),
  );

  return { count: data as number, emailsSent: results.filter(Boolean).length };
}

// ─── Error mapping ────────────────────────────────────────────────────────────

export function mapAdminError(message: string): string {
  const map: Record<string, string> = {
    FORBIDDEN:          "Bạn không có quyền thực hiện thao tác này.",
    PROFILE_NOT_FOUND:  "Không tìm thấy hồ sơ bệnh nhân.",
    NOT_FOUND:          "Không tìm thấy lịch hẹn.",
    CANNOT_CHECKIN:     "Chỉ có thể tiếp nhận lịch ở trạng thái Chờ khám.",
    CANNOT_CANCEL:      "Lịch hẹn này không thể hủy.",
    CANNOT_RESCHEDULE:  "Lịch hẹn này không thể đổi giờ.",
    SLOT_UNAVAILABLE:   "Giờ khám này đã được đặt. Vui lòng chọn giờ khám khác.",
    SLOT_IN_PAST:       "Slot đã qua, không thể đặt.",
    SPECIALTY_MISMATCH: "Bác sĩ chỉ có thể tạo lịch khám không hẹn thuộc chuyên khoa của mình.",
    PATIENT_NO_ACCOUNT: "Hồ sơ bệnh nhân chưa có tài khoản. Vui lòng tạo hồ sơ mới.",
  };
  for (const [code, msg] of Object.entries(map)) {
    if (message.includes(code)) return msg;
  }
  return message;
}
