import { supabase } from "@/lib/supabase";
import type { AdminAppointment } from "@/types/admin-appointment";

export type DoctorAppointmentFilters = {
  dateMode?: "day" | "week" | "month";
  date?: string;       // YYYY-MM-DD (for day mode)
  dateFrom?: string;   // YYYY-MM-DD (for week/month)
  dateTo?: string;
  search?: string;
  status?: string;
};

export async function fetchDoctorAppointments(
  filters: DoctorAppointmentFilters = {}
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

  if (filters.status && filters.status !== "__all__") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let rows = (data ?? []) as Record<string, unknown>[];

  // Date filtering on slot_date; walk-ins use created_at date as fallback
  if (filters.date) {
    rows = rows.filter((r) => {
      const slotDate = (r.appointment_slots as Record<string, string> | null)?.slot_date;
      if (slotDate) return slotDate === filters.date;
      // Walk-in: match on creation date
      const createdDate = (r.created_at as string | null)?.slice(0, 10);
      return createdDate === filters.date;
    });
  } else if (filters.dateFrom || filters.dateTo) {
    rows = rows.filter((r) => {
      const slotDate = (r.appointment_slots as Record<string, string> | null)?.slot_date;
      const d = slotDate ?? (r.created_at as string | null)?.slice(0, 10);
      if (!d) return false;
      if (filters.dateFrom && d < filters.dateFrom) return false;
      if (filters.dateTo && d > filters.dateTo) return false;
      return true;
    });
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => {
      const pt = r.patient as Record<string, string> | null;
      if (!pt) return false;
      return (
        pt.phone_number?.toLowerCase().includes(q) ||
        pt.legal_first_name?.toLowerCase().includes(q) ||
        pt.legal_last_name?.toLowerCase().includes(q)
      );
    });
  }

  return rows.map((r) => {
    const sl  = r.appointment_slots as Record<string, unknown> | null;
    const pt  = r.patient           as Record<string, string> | null;
    const sp  = r.specialties       as Record<string, string> | null;
    const doc = sl?.user_profiles   as Record<string, string> | null;
    const pcRaw = r.pre_consultations as Record<string, unknown> | Record<string, unknown>[] | null;
    const pc = (Array.isArray(pcRaw) ? pcRaw[0] : pcRaw) ?? null;
    const vitalsRaw = r.vital_signs as unknown[] | null;

    return {
      id:            r.id as string,
      patient_id:    r.patient_id as string,
      profile_id:    r.profile_id as string,
      specialty_id:  r.specialty_id as string,
      slot_id:       r.slot_id as string ?? null,
      status:        r.status as AdminAppointment["status"],
      note:          r.note as string ?? null,
      walk_in:       Boolean(r.walk_in),
      cancel_reason: r.cancel_reason as string ?? null,
      cancelled_at:  r.cancelled_at as string ?? null,
      cancelled_by:  r.cancelled_by as "patient" | "admin" ?? null,
      created_at:    r.created_at as string,
      updated_at:    r.updated_at as string,
      specialty_name: sp?.name ?? null,
      specialty_icon: sp?.icon ?? null,
      slot_date:  sl?.slot_date  as string ?? null,
      start_time: sl?.start_time as string ?? null,
      end_time:   sl?.end_time   as string ?? null,
      doctor_id:  sl?.doctor_id  as string ?? null,
      patient_name: [pt?.legal_last_name, pt?.legal_first_name].filter(Boolean).join(" ") || null,
      patient_phone: pt?.phone_number  ?? null,
      patient_dob:   pt?.date_of_birth ?? null,
      doctor_name:   doc?.full_name ?? null,
      pre_consult_status: !pc ? "none" : (pc.status === "SUBMITTED" ? "submitted" : "draft"),
      pre_consult_drug_allergy: Boolean((pc?.flags as Record<string, unknown> | undefined)?.drug_allergy),
      pre_consult_severe_pain:  Boolean((pc?.flags as Record<string, unknown> | undefined)?.severe_pain),
      has_vital_signs: Array.isArray(vitalsRaw) && vitalsRaw.length > 0,
    } as AdminAppointment;
  });
}

export async function sendPreConsultReminder(
  appointmentId: string,
): Promise<{ emailSent: boolean; email?: string; emailError?: string }> {
  const { data, error: fnErr } = await supabase.functions.invoke(
    "notify-pre-consult-reminder",
    { body: { appointment_id: appointmentId } },
  );

  if (fnErr) {
    return { emailSent: false, emailError: fnErr.message };
  }

  const payload = data as Record<string, unknown> | null;
  if (payload?.error) {
    return { emailSent: false, emailError: String(payload.error) };
  }
  if (payload?.skipped === true) {
    return { emailSent: false, emailError: "Chưa cấu hình SMTP (SMTP_USER/SMTP_PASS)" };
  }

  return {
    emailSent: true,
    email: payload?.email as string | undefined,
  };
}

/** Resolve the logged-in doctor's specialty to a specialties.id (by name match). */
export async function fetchDoctorSpecialtyId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("specialty")
    .eq("user_id", user.id)
    .maybeSingle();

  const specialtyName = profile?.specialty?.trim();
  if (!specialtyName) return null;

  const { data: specialty } = await supabase
    .from("specialties")
    .select("id")
    .eq("name", specialtyName)
    .eq("is_active", true)
    .maybeSingle();

  return specialty?.id ?? null;
}
