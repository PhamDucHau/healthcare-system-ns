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
      patient ( legal_first_name, legal_last_name, phone_number, date_of_birth )
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters.status && filters.status !== "__all__") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let rows = (data ?? []) as Record<string, unknown>[];

  // Date filtering on the joined slot_date
  if (filters.date) {
    rows = rows.filter((r) => {
      const d = (r.appointment_slots as Record<string, string> | null)?.slot_date;
      return d === filters.date;
    });
  } else if (filters.dateFrom || filters.dateTo) {
    rows = rows.filter((r) => {
      const d = (r.appointment_slots as Record<string, string> | null)?.slot_date;
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
    } as AdminAppointment;
  });
}
