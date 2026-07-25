import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapPatientPortalRow,
  mapPatientRecordListRow,
  type PatientCreatedByRole,
  type PatientPortalDetail,
  type PatientRecordListRow,
} from "@/types/patient-portal";

const PATIENT_LIST_SELECT =
  "id, user_id, legal_first_name, legal_last_name, date_of_birth, phone_number, email_address, id_number, member_id, insurance_provider, submitted_at, updated_at, created_by_role, created_at";

export type PatientRecordStatusFilter = "all" | "submitted" | "draft";
export type PatientRecordSortField = "full_name" | "date_of_birth" | "updated_at";
export type PatientRecordSortDir = "asc" | "desc";

export type PatientRecordsListParams = {
  search?: string;
  page?: number;
  limit?: number;
  status?: PatientRecordStatusFilter;
  createdByRole?: PatientCreatedByRole | "all";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: PatientRecordSortField;
  sortDir?: PatientRecordSortDir;
};

export type PatientRecordsListResult = {
  rows: PatientRecordListRow[];
  total: number;
  error: Error | null;
};

type SearchPatientsRpcPayload = {
  total?: number;
  rows?: Record<string, unknown>[] | null;
};

function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function buildPatientSearchOrFilter(search: string): string {
  const pattern = `%${escapeIlikePattern(search)}%`;
  return [
    `legal_first_name.ilike.${pattern}`,
    `legal_last_name.ilike.${pattern}`,
    `phone_number.ilike.${pattern}`,
    `email_address.ilike.${pattern}`,
    `id_number.ilike.${pattern}`,
    `member_id.ilike.${pattern}`,
    `insurance_provider.ilike.${pattern}`,
  ].join(",");
}

function applyPatientListFilters<
  T extends {
    or: (filters: string) => T;
    not: (column: string, operator: string, value: null) => T;
    is: (column: string, value: null) => T;
    eq: (column: string, value: string) => T;
    gte: (column: string, value: string) => T;
    lte: (column: string, value: string) => T;
  },
>(query: T, params: PatientRecordsListParams): T {
  let next = query;
  const search = params.search?.trim();
  if (search) {
    next = next.or(buildPatientSearchOrFilter(search));
  }
  if (params.status === "submitted") {
    next = next.not("submitted_at", "is", null);
  } else if (params.status === "draft") {
    next = next.is("submitted_at", null);
  }
  if (params.createdByRole && params.createdByRole !== "all") {
    next = next.eq("created_by_role", params.createdByRole);
  }
  if (params.dateFrom) {
    next = next.gte("created_at", `${params.dateFrom}T00:00:00`);
  }
  if (params.dateTo) {
    next = next.lte("created_at", `${params.dateTo}T23:59:59`);
  }
  return next;
}

function applyPatientListSort<
  T extends { order: (column: string, options?: { ascending?: boolean }) => T },
>(query: T, params: PatientRecordsListParams): T {
  const ascending = params.sortDir === "asc";
  switch (params.sortBy) {
    case "full_name":
      return query.order("legal_last_name", { ascending }).order("legal_first_name", { ascending });
    case "date_of_birth":
      return query.order("date_of_birth", { ascending, nullsFirst: false });
    case "updated_at":
    default:
      return query.order("updated_at", { ascending, nullsFirst: false });
  }
}

async function searchPatientRecordsFallback(
  supabase: SupabaseClient,
  params: PatientRecordsListParams,
): Promise<PatientRecordsListResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("patient")
    .select(PATIENT_LIST_SELECT, { count: "exact" });

  query = applyPatientListFilters(query, params);
  query = applyPatientListSort(query, params);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return { rows: [], total: 0, error: new Error(error.message) };
  }

  const rows = (data ?? []).map((row) =>
    mapPatientRecordListRow(row as Record<string, unknown>),
  );
  return { rows, total: count ?? rows.length, error: null };
}

/** Tìm kiếm + lọc + sắp xếp + phân trang hồ sơ bệnh nhân cho staff. */
export async function searchPatientRecords(
  supabase: SupabaseClient,
  params: PatientRecordsListParams = {},
): Promise<PatientRecordsListResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const search = params.search?.trim() || null;
  const status = params.status && params.status !== "all" ? params.status : null;
  const createdByRole =
    params.createdByRole && params.createdByRole !== "all" ? params.createdByRole : null;

  const { data, error } = await supabase.rpc("search_patients_for_staff", {
    p_query: search,
    p_page: page,
    p_limit: limit,
    p_status: status,
    p_created_by_role: createdByRole,
    p_date_from: params.dateFrom || null,
    p_date_to: params.dateTo || null,
    p_sort_by: params.sortBy ?? "updated_at",
    p_sort_dir: params.sortDir ?? "desc",
  });

  if (error) {
    if (
      error.message.includes("search_patients_for_staff") ||
      error.code === "PGRST202"
    ) {
      return searchPatientRecordsFallback(supabase, params);
    }
    return { rows: [], total: 0, error: new Error(error.message) };
  }

  const payload = (data ?? {}) as SearchPatientsRpcPayload;
  const rows = (payload.rows ?? []).map((row) =>
    mapPatientRecordListRow(row as Record<string, unknown>),
  );

  return {
    rows,
    total: Number(payload.total ?? 0),
    error: null,
  };
}

/** @deprecated Dùng `searchPatientRecords`. */
export async function listPatientRecords(
  supabase: SupabaseClient,
): Promise<{ rows: PatientRecordListRow[]; error: Error | null }> {
  const { rows, error } = await searchPatientRecords(supabase, {
    page: 1,
    limit: 100,
  });
  return { rows, error };
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
