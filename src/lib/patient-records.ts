import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapPatientPortalRow,
  mapPatientRecordListRow,
  type PatientPortalDetail,
  type PatientRecordListRow,
} from "@/types/patient-portal";

/** Đọc từ bảng `public.patient` qua RPC (bypass RLS khi staff có role doctor/admin). */
export async function listPatientRecords(
  supabase: SupabaseClient,
): Promise<{ rows: PatientRecordListRow[]; error: Error | null }> {
  const { data, error } = await supabase.rpc("list_patients_for_staff");

  if (error) {
    const fallback = await supabase
      .from("patient")
      .select(
        "id, user_id, legal_first_name, legal_last_name, date_of_birth, phone_number, email_address, id_number, member_id, insurance_provider, submitted_at, updated_at",
      )
      .order("updated_at", { ascending: false });

    if (fallback.error) {
      return { rows: [], error: new Error(fallback.error.message) };
    }

    const rows = (fallback.data ?? []).map((row) =>
      mapPatientRecordListRow(row as Record<string, unknown>),
    );
    return { rows, error: null };
  }

  const rows = (data ?? []).map((row) =>
    mapPatientRecordListRow(row as Record<string, unknown>),
  );
  return { rows, error: null };
}

export async function getPatientRecordById(
  supabase: SupabaseClient,
  patientId: string,
): Promise<{ record: PatientPortalDetail | null; error: Error | null }> {
  const { data, error } = await supabase.rpc("get_patient_for_staff", {
    p_patient_id: patientId,
  });

  if (!error && data) {
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      return {
        record: mapPatientPortalRow(row as Record<string, unknown>),
        error: null,
      };
    }
  }

  const { data: direct, error: directError } = await supabase
    .from("patient")
    .select("*")
    .eq("id", patientId)
    .maybeSingle();

  if (directError) {
    return { record: null, error: new Error(directError.message) };
  }
  if (!direct) {
    return { record: null, error: null };
  }
  return { record: mapPatientPortalRow(direct as Record<string, unknown>), error: null };
}
