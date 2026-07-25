import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  NotebookPen,
  SquareChartGantt,
  Stethoscope,
  UserRound,
  // Microscope,
  // Pill,
  Siren,
  Activity,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  mapPatientPortalRow,
  type PatientListItem,
  type PatientPortalDetail,
} from "@/types/patient-portal";
import { getLatestVitalSignsForPatient, listAllVitalSignsForPatient, updateVitalSigns } from "@/lib/vital-signs-api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { VitalSignsRow } from "@/types/vital-signs";
import { computeBmi } from "@/types/vital-signs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import VitalSignsForm from "@/components/provider/VitalSignsForm";
import AdminEditPatientDialog from "@/components/admin/patients/AdminEditPatientDialog";
import PatientHealthRecordsPanel from "@/components/provider/PatientHealthRecordsPanel";
import { fetchPatientHealthChartByUserId } from "@/lib/patient-health-history-api";
import {
  formatAllergyLabel,
  formatConditionLabel,
  formatImmunizationLabel,
  formatMedicationLabel,
  formatSurgeryLabel,
  LANGUAGE_LABELS,
} from "@/types/patient-health-history";
import { translatePatientStatus, UI_FALLBACK } from "@/config/ui-labels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPatientRecords } from "@/lib/patient-records";
import type { PatientRecordListRow } from "@/types/patient-portal";

const DEMO_DIAGNOSES = ["Đái tháo đường type 2", "Tăng huyết áp nhẹ"];
const DEMO_MEDICATIONS = ["Metformin 500mg", "Lisinopril 10mg"];
const DEMO_ALLERGIES = ["Penicillin", "Đậu phộng"];
const DEMO_LABS = [
  { name: "Xét nghiệm máu tổng quát", date: "2024-01-12" },
  { name: "X-quang ngực", date: "2023-12-28" },
];

const OVERVIEW_TABS = [
  { id: "overview", icon: SquareChartGantt, label: "Tổng quan" },
  { id: "records", icon: NotebookPen, label: "Hồ sơ sức khỏe" },
  // { id: "labs", icon: Microscope, label: "Xét nghiệm" },
  // { id: "prescriptions", icon: Pill, label: "Đơn thuốc" },
] as const;

type OverviewTabId = (typeof OVERVIEW_TABS)[number]["id"];

type DemoPatient = {
  key: string;
  name: string;
  dob: string;
  last: string;
  status: string;
  pronouns?: string;
  email?: string;
  phone?: string;
};

function demoPatientId(key: string) {
  return `demo:${key}`;
}

function isDemoPatientId(id: string | null) {
  return Boolean(id?.startsWith("demo:"));
}

function noteStorageKey(patientKey: string) {
  return `qcare_provider_note_${patientKey}`;
}

function readNote(key: string): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(noteStorageKey(key)) ?? "";
}

function writeNote(key: string, text: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(noteStorageKey(key), text);
}

function readOnboardingPersonalDraft(): {
  legalFirstName?: string;
  legalLastName?: string;
  dateOfBirth?: string;
  email?: string;
  pronouns?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("qcare_onboarding_draft");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { personal?: Record<string, string> };
    return parsed.personal ?? {};
  } catch {
    return {};
  }
}

function formatDob(iso: string | null | undefined, fallback: string): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function statusBadgeClass(status: string | null | undefined) {
  if (status === "Stable" || status === "Active") return "bg-emerald-100 text-emerald-700";
  if (status === "Review Needed") return "bg-amber-100 text-amber-700";
  if (status === "Draft") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

function translateStatus(status: string | null | undefined): string {
  return translatePatientStatus(status);
}

const PATIENT_LIST_PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 300;

function mapRecordToListItem(row: PatientRecordListRow): PatientListItem {
  const activity = row.updated_at ?? row.submitted_at;
  let last_visit_label = "—";
  if (activity) {
    try {
      last_visit_label = formatDistanceToNow(new Date(activity), { locale: vi, addSuffix: true });
    } catch {
      last_visit_label = activity.slice(0, 10);
    }
  }
  return {
    id: row.id,
    full_name: row.full_name,
    date_of_birth: row.date_of_birth,
    last_visit_label,
    status: row.submitted_at ? "Active" : "Draft",
  };
}

const STATUS_BADGE_CLASS =
  "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium";

function demoToDetail(demo: DemoPatient): PatientPortalDetail {
  const parts = demo.name.split(" ");
  const legal_first_name = parts[0] ?? demo.name;
  const legal_last_name = parts.slice(1).join(" ") || null;
  return {
    id: demoPatientId(demo.key),
    user_id: "",
    legal_first_name,
    legal_last_name,
    full_name: demo.name,
    date_of_birth: null,
    preferred_pronouns: demo.pronouns ?? null,
    email_address: demo.email ?? null,
    phone_number: demo.phone ?? null,
    id_number: null,
    residential_address: null,
    id_expiration_date: null,
    id_issued_date: null,
    id_issuer: null,
    insurance_provider: null,
    member_id: null,
    group_number: null,
    id_document_storage_path: null,
    id_document_back_storage_path: null,
    card_front_storage_path: null,
    avatar_storage_path: null,
    bhyt_name: null,
    bhyt_dob: null,
    bhyt_gender: null,
    bhyt_address: null,
    bhyt_kcb: null,
    bhyt_kcb_code: null,
    bhyt_valid_from: null,
    bhyt_five_year: null,
    submitted_at: null,
    updated_at: null,
    consent_accepted: true,
  };
}

const PATIENT_LIST_QUERY_KEY = ["patient", "list"] as const;

// ── VitalEditDialog ────────────────────────────────────────────────────────────
function VitalEditDialog({
  vital, patientName, onClose, onSaved,
}: {
  vital: VitalSignsRow;
  patientName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  type F = { bp_systolic: string; bp_diastolic: string; heart_rate: string; temperature_c: string; respiratory_rate: string; spo2: string; weight_kg: string; height_cm: string; clinical_note: string; };
  const toStr = (v: number | null) => (v != null ? String(v) : "");
  const [form, setForm] = useState<F>({
    bp_systolic:      toStr(vital.bp_systolic),
    bp_diastolic:     toStr(vital.bp_diastolic),
    heart_rate:       toStr(vital.heart_rate),
    temperature_c:    toStr(vital.temperature_c),
    respiratory_rate: toStr(vital.respiratory_rate),
    spo2:             toStr(vital.spo2),
    weight_kg:        toStr(vital.weight_kg),
    height_cm:        toStr(vital.height_cm),
    clinical_note:    vital.clinical_note ?? "",
  });
  const [saving, setSaving] = useState(false);
  const parseN = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

  const bmi = (() => {
    const w = parseN(form.weight_kg), h = parseN(form.height_cm);
    return w && h && w > 0 && h > 0 ? computeBmi(w, h) : null;
  })();

  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateVitalSigns(supabase, vital.id, {
      bp_systolic:      parseN(form.bp_systolic),
      bp_diastolic:     parseN(form.bp_diastolic),
      heart_rate:       parseN(form.heart_rate),
      temperature_c:    parseN(form.temperature_c),
      respiratory_rate: parseN(form.respiratory_rate),
      spo2:             parseN(form.spo2),
      weight_kg:        parseN(form.weight_kg),
      height_cm:        parseN(form.height_cm),
      clinical_note:    form.clinical_note.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error("Lưu thất bại: " + error.message); return; }
    toast.success("Đã cập nhật sinh hiệu");
    onSaved();
  };

  const field = (label: string, k: keyof F, placeholder = "—") => (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <input
        type="number" step="any" value={form[k] as string} placeholder={placeholder}
        onChange={set(k)}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            Sửa sinh hiệu — {patientName}
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {new Date(vital.recorded_at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            {field("Tâm thu (mmHg)", "bp_systolic", "120")}
            {field("Tâm trương (mmHg)", "bp_diastolic", "80")}
            {field("Nhịp tim (bpm)", "heart_rate", "70")}
            {field("Nhiệt độ (°C)", "temperature_c", "37")}
            {field("SpO2 (%)", "spo2", "98")}
            {field("Nhịp thở (l/ph)", "respiratory_rate", "16")}
            {field("Chiều cao (cm)", "height_cm", "170")}
            {field("Cân nặng (kg)", "weight_kg", "65")}
          </div>
          {bmi != null && (
            <p className="text-xs text-muted-foreground">BMI tính toán: <strong>{bmi}</strong></p>
          )}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">Ghi chú lâm sàng</label>
            <textarea
              value={form.clinical_note} onChange={set("clinical_note")} rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Nhập ghi chú..."
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={saving}
            className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted transition-colors">
            Hủy
          </button>
          <button type="button" onClick={() => void handleSave()} disabled={saving}
            className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ProviderPatientsPage = () => {
  const draftPersonal = useMemo(() => readOnboardingPersonalDraft(), []);

  const draftFullName =
    [draftPersonal.legalFirstName, draftPersonal.legalLastName].filter(Boolean).join(" ") ||
    "Nguyễn Văn An";
  const draftDob = formatDob(draftPersonal.dateOfBirth ?? null, "05/12/1994");

  const demoPatients: DemoPatient[] = useMemo(
    () => [
      {
        key: "demo1",
        name: draftFullName,
        dob: draftDob,
        last: "2 ngày trước",
        status: "Stable",
        pronouns: draftPersonal.pronouns,
        email: draftPersonal.email,
      },
      {
        key: "demo2",
        name: "Trần Thị Bình",
        dob: "11/24/1988",
        last: "1 tuần trước",
        status: "Review Needed",
        email: "jordan.smith@example.com",
      },
      {
        key: "demo3",
        name: "Lê Minh Cường",
        dob: "02/03/1972",
        last: "3 tuần trước",
        status: "Routine",
        phone: "(555) 010-2030",
      },
    ],
    [draftDob, draftFullName, draftPersonal.email, draftPersonal.pronouns],
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<OverviewTabId>("overview");
  const [selectedId, setSelectedId] = useState<string | null>(
    () => searchParams.get("select"),
  );

  // Clear ?select= from URL after initial auto-select
  useEffect(() => {
    if (searchParams.get("select")) {
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [noteDraft, setNoteDraft] = useState("");
  const [vitalSheetOpen, setVitalSheetOpen] = useState(false);
  const [vitalHistoryOpen, setVitalHistoryOpen] = useState(false);
  const [editingVital, setEditingVital] = useState<VitalSignsRow | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [listPage, setListPage] = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setListPage(1);
  }, [debouncedSearch]);

  const listQueryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      page: listPage,
      limit: PATIENT_LIST_PAGE_SIZE,
      sortBy: "updated_at" as const,
      sortDir: "desc" as const,
    }),
    [debouncedSearch, listPage],
  );

  const {
    data: patientListData,
    isLoading: isListLoading,
    isError,
    error,
    isFetching: isListFetching,
  } = useQuery({
    queryKey: [...PATIENT_LIST_QUERY_KEY, listQueryParams],
    queryFn: async () => {
      const { rows, total, error: listError } = await searchPatientRecords(supabase, listQueryParams);
      if (listError) throw listError;
      return {
        items: rows.map(mapRecordToListItem),
        total,
      };
    },
    placeholderData: (previous) => previous,
  });

  const patientSummaries = patientListData?.items ?? [];
  const patientListTotal = patientListData?.total ?? 0;
  const patientListTotalPages = Math.max(1, Math.ceil(patientListTotal / PATIENT_LIST_PAGE_SIZE));
  const patientListFrom =
    patientListTotal === 0 ? 0 : (listPage - 1) * PATIENT_LIST_PAGE_SIZE + 1;
  const patientListTo =
    patientListTotal === 0 ? 0 : Math.min(listPage * PATIENT_LIST_PAGE_SIZE, patientListTotal);

  useEffect(() => {
    if (patientSummaries.length > 0) {
      setSelectedId((prev) => {
        if (prev && !isDemoPatientId(prev) && patientSummaries.some((r) => r.id === prev)) {
          return prev;
        }
        return patientSummaries[0].id;
      });
      return;
    }
    setSelectedId((prev) => {
      if (prev && isDemoPatientId(prev)) return prev;
      return demoPatientId(demoPatients[0].key);
    });
  }, [patientSummaries, demoPatients]);

  const activeNoteKey = selectedId ?? demoPatientId(demoPatients[0].key);

  useEffect(() => {
    setNoteDraft(readNote(activeNoteKey));
  }, [activeNoteKey]);

  const {
    data: patientDetailFromDb,
    isLoading: isDetailLoading,
  } = useQuery({
    queryKey: ["patient", "detail", selectedId],
    queryFn: async (): Promise<PatientPortalDetail> => {
      const { data: rpcRow, error: rpcErr } = await supabase.rpc("get_patient_for_staff", {
        p_patient_id: selectedId as string,
      });
      if (!rpcErr && rpcRow) {
        const row = Array.isArray(rpcRow) ? rpcRow[0] : rpcRow;
        if (row) return mapPatientPortalRow(row as Record<string, unknown>);
      }
      const { data, error: fetchError } = await supabase
        .from("patient")
        .select("*")
        .eq("id", selectedId as string)
        .single();

      if (fetchError) throw fetchError;
      return mapPatientPortalRow(data as Record<string, unknown>);
    },
    enabled: Boolean(selectedId) && !isDemoPatientId(selectedId),
  });

  const demoDetail = useMemo(() => {
    if (!selectedId || !isDemoPatientId(selectedId)) return null;
    const key = selectedId.replace(/^demo:/, "");
    const demo = demoPatients.find((p) => p.key === key);
    return demo ? demoToDetail(demo) : null;
  }, [selectedId, demoPatients]);

  // Real vitals for selected real patient
  const realPatientUserId = (!isDemoPatientId(selectedId ?? "") && patientDetailFromDb?.user_id)
    ? patientDetailFromDb.user_id
    : null;

  const { data: latestVitals } = useQuery({
    queryKey: ["vital_signs", "patient", realPatientUserId],
    queryFn: () => getLatestVitalSignsForPatient(supabase, realPatientUserId!).then((r) => r.vitals),
    enabled: Boolean(realPatientUserId),
  });

  const isDemoSelection = isDemoPatientId(selectedId ?? "");

  const { data: healthChart, isLoading: isHealthChartLoading } = useQuery({
    queryKey: ["patient", "health-chart", realPatientUserId],
    queryFn: () => fetchPatientHealthChartByUserId(realPatientUserId!),
    enabled: Boolean(realPatientUserId),
  });

  const { data: vitalHistory = [] } = useQuery({
    queryKey: ["vital_signs_history", "patient", realPatientUserId],
    queryFn: () => listAllVitalSignsForPatient(supabase, realPatientUserId!).then((r) => r.vitals),
    enabled: vitalHistoryOpen && Boolean(realPatientUserId),
  });

  // Fetch latest CHECKED_IN/IN_PROGRESS appointment for this patient (for doctor vitals entry)
  const { data: activeAppointmentId } = useQuery({
    queryKey: ["active_appointment", patientDetailFromDb?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id")
        .eq("profile_id", patientDetailFromDb!.id)
        .in("status", ["CHECKED_IN", "IN_PROGRESS"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data?.id as string) ?? null;
    },
    enabled: Boolean(patientDetailFromDb?.id) && !isDemoPatientId(selectedId ?? ""),
  });

  const patientDetail = patientDetailFromDb ?? demoDetail;

  const selectedDemo = useMemo(() => {
    if (!selectedId || !isDemoPatientId(selectedId)) return null;
    const key = selectedId.replace(/^demo:/, "");
    return demoPatients.find((p) => p.key === key) ?? null;
  }, [selectedId, demoPatients]);

  const displayName = patientDetail?.full_name ?? draftFullName;
  const displayDob = patientDetail?.date_of_birth
    ? formatDob(patientDetail.date_of_birth, draftDob)
    : selectedDemo?.dob ?? draftDob;
  const displayId =
    patientDetail?.id_number?.trim() ||
    (patientDetail?.id && !isDemoPatientId(patientDetail.id)
      ? `QC-${patientDetail.id.slice(0, 8).toUpperCase()}`
      : "QC-DEMO-8842");
  const pronouns = patientDetail?.preferred_pronouns ?? draftPersonal.pronouns ?? UI_FALLBACK.notSet;

  const diagnosisLabels = useMemo(() => {
    if (isDemoSelection) return DEMO_DIAGNOSES;
    return (healthChart?.diagnoses ?? []).map(formatConditionLabel);
  }, [isDemoSelection, healthChart]);

  const medicationLabels = useMemo(() => {
    if (isDemoSelection) return DEMO_MEDICATIONS;
    return (healthChart?.medications ?? []).map(formatMedicationLabel);
  }, [isDemoSelection, healthChart]);

  const allergyLabels = useMemo(() => {
    if (isDemoSelection) return DEMO_ALLERGIES;
    return (healthChart?.allergies ?? []).map(formatAllergyLabel);
  }, [isDemoSelection, healthChart]);

  const surgeryLabels = useMemo(() => {
    if (isDemoSelection) return [];
    return (healthChart?.surgeries ?? []).map(formatSurgeryLabel);
  }, [isDemoSelection, healthChart]);

  const immunizationLabels = useMemo(() => {
    if (isDemoSelection) return [];
    return (healthChart?.immunizations ?? []).map(formatImmunizationLabel);
  }, [isDemoSelection, healthChart]);

  const displayHeightCm = latestVitals?.height_cm ?? healthChart?.height_cm ?? null;
  const displayWeightKg = latestVitals?.weight_kg ?? healthChart?.weight_kg ?? null;
  const bloodTypeLabel = isDemoSelection ? "O+" : (healthChart?.blood_type ?? "—");
  const preferredLanguageLabel = healthChart?.preferred_language
    ? (LANGUAGE_LABELS[healthChart.preferred_language] ?? healthChart.preferred_language)
    : null;

  const vitals = latestVitals
    ? [
        latestVitals.bp_systolic != null && latestVitals.bp_diastolic != null
          ? { label: "Huyết áp", value: `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic} mmHg` }
          : null,
        latestVitals.heart_rate != null
          ? { label: "Nhịp tim", value: `${latestVitals.heart_rate} bpm` }
          : null,
        latestVitals.temperature_c != null
          ? { label: "Nhiệt độ", value: `${latestVitals.temperature_c} °C` }
          : null,
        latestVitals.spo2 != null
          ? { label: "SpO2", value: `${latestVitals.spo2}%` }
          : null,
        latestVitals.respiratory_rate != null
          ? { label: "Nhịp thở", value: `${latestVitals.respiratory_rate} l/ph` }
          : null,
      ].filter(Boolean) as { label: string; value: string }[]
    : [
        { label: "Huyết áp", value: "—" },
        { label: "Nhịp tim", value: "—" },
        { label: "Nhiệt độ", value: "—" },
      ];

  const recentLabs = useMemo(() => {
    if (isDemoSelection) return DEMO_LABS;
    return healthChart?.recent_labs ?? [];
  }, [isDemoSelection, healthChart]);

  const emergencyName =
    healthChart?.emergency_contact_name?.trim()
    || (isDemoSelection ? `Liên hệ ${displayName.split(" ")[0] ?? UI_FALLBACK.patient}` : "—");
  const emergencyPhone =
    healthChart?.emergency_contact_phone?.trim()
    || patientDetail?.phone_number
    || selectedDemo?.phone
    || "—";

  const handleSelectPatient = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleSaveNote = useCallback(() => {
    writeNote(activeNoteKey, noteDraft);
    toast.success("Đã lưu ghi chú phiên làm việc");
  }, [activeNoteKey, noteDraft]);

  const isListBusy = isListLoading;
  const isDetailBusy = Boolean(selectedId) && !isDemoPatientId(selectedId) && isDetailLoading;

  return (
    <>
      {isListBusy ? (
        <p className="text-sm text-muted-foreground">Đang tải danh sách bệnh nhân…</p>
      ) : null}
      {isError ? (
        <div
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-medium">
            {(error as { message?: string })?.message ??
              "Không thể tải dữ liệu bệnh nhân. Kiểm tra bảng Supabase và RLS."}
          </p>
          <p className="mt-2 text-xs font-normal leading-relaxed text-destructive/90">
            Bác sĩ cần policy <code className="rounded bg-destructive/15 px-1 py-0.5 font-mono text-[11px]">patient_select_doctor</code>.
            Chạy migration mới nhất hoặc dùng bệnh nhân demo bên dưới.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <section className="rounded-xl border bg-card p-4">
          <div className="mb-4 flex flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Danh sách bệnh nhân</h2>
            <span className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {patientListTotal > 0 ? patientListTotal : demoPatients.length} đang hoạt động
            </span>
          </div>

          <div className="relative mb-3">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên, SĐT, email…"
              className="pl-9"
              aria-label="Tìm bệnh nhân"
            />
          </div>

          <div className="space-y-3">
            {patientSummaries.length > 0
              ? patientSummaries.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => handleSelectPatient(row.id)}
                    className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors hover:bg-muted ${
                      selectedId === row.id ? "border-primary/40 bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {row.full_name ?? UI_FALLBACK.patient}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ngày sinh: {formatDob(row.date_of_birth, "—")}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Lần khám: {row.last_visit_label ?? "—"}
                        </p>
                      </div>
                      <span
                        className={`${STATUS_BADGE_CLASS} ${statusBadgeClass(row.status)}`}
                      >
                        {translateStatus(row.status ?? "Active")}
                      </span>
                    </div>
                  </button>
                ))
              : !isListBusy && !debouncedSearch
                ? demoPatients.map((patient) => {
                  const id = demoPatientId(patient.key);
                  return (
                    <button
                      key={patient.key}
                      type="button"
                      onClick={() => handleSelectPatient(id)}
                      className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors hover:bg-muted ${
                        selectedId === id ? "border-primary/40 bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">Ngày sinh: {patient.dob}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Lần khám: {patient.last}</p>
                        </div>
                        <span
                          className={`${STATUS_BADGE_CLASS} ${statusBadgeClass(patient.status)}`}
                        >
                          {translateStatus(patient.status)}
                        </span>
                      </div>
                    </button>
                  );
                })
                : null}
          </div>

          {patientListTotal > 0 ? (
            <div className="mt-4 flex flex-col gap-2 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Hiển thị{" "}
                <span className="font-semibold text-foreground">
                  {patientListFrom}–{patientListTo}
                </span>{" "}
                / {patientListTotal} bệnh nhân
                {isListFetching && !isListLoading ? (
                  <Loader2 className="ml-1 inline h-3 w-3 animate-spin" aria-hidden="true" />
                ) : null}
              </p>
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1"
                  disabled={listPage <= 1 || isListFetching}
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Trước
                </Button>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {listPage}/{patientListTotalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1"
                  disabled={listPage >= patientListTotalPages || isListFetching}
                  onClick={() => setListPage((p) => Math.min(patientListTotalPages, p + 1))}
                >
                  Sau
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          {patientSummaries.length === 0 && !isListBusy ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {debouncedSearch ? (
                <>Không tìm thấy bệnh nhân phù hợp.</>
              ) : (
                <>
                  Đang dùng <strong>bệnh nhân demo</strong> (có thể bấm chọn). Để load dữ liệu thật: hoàn tất
                  onboarding patient hoặc chạy migration RLS cho role doctor.
                </>
              )}
            </p>
          ) : null}
        </section>

        <section className="space-y-6">
          {isDetailBusy ? (
            <p className="text-sm text-muted-foreground">Đang tải hồ sơ bệnh nhân…</p>
          ) : null}

          <div className="rounded-2xl bg-gradient-to-r from-primary to-pink-400 p-5 text-primary-foreground">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card/20">
                  <UserRound className="h-8 w-8" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{displayName}</h2>
                  <p className="text-sm opacity-90">
                    ID: {displayId} · DOB: {displayDob} · {pronouns}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="min-h-11 rounded-lg bg-card px-5 text-sm font-semibold text-primary hover:bg-card/90"
                onClick={() => setEditProfileOpen(true)}
              >
                Chỉnh sửa hồ sơ
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-card/20 px-3 py-1">Nhóm máu: {bloodTypeLabel}</span>
              {displayHeightCm != null && (
                <span className="rounded-full bg-card/20 px-3 py-1">Chiều cao: {displayHeightCm}cm</span>
              )}
              {displayWeightKg != null && (
                <span className="rounded-full bg-card/20 px-3 py-1">Cân nặng: {displayWeightKg}kg</span>
              )}
              {preferredLanguageLabel ? (
                <span className="rounded-full bg-card/20 px-3 py-1">Ngôn ngữ: {preferredLanguageLabel}</span>
              ) : null}
              {(patientDetail?.email_address ?? draftPersonal.email) ? (
                <span className="rounded-full bg-card/20 px-3 py-1">
                  {patientDetail?.email_address ?? draftPersonal.email}
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <section className="rounded-xl border bg-card p-4">
              <div className="mb-4 flex flex-wrap items-center gap-2 border-b pb-3 text-sm">
                {OVERVIEW_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTab === "overview" ? (
                <>
                  {isHealthChartLoading && !isDemoSelection ? (
                    <p className="mb-3 text-sm text-muted-foreground">Đang tải hồ sơ sức khỏe…</p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <article className="rounded-lg border bg-background p-3">
                      <h3 className="text-sm font-semibold">Chẩn đoán trước đây</h3>
                      {diagnosisLabels.length === 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">Chưa có dữ liệu</p>
                      ) : (
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {diagnosisLabels.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                    <article className="rounded-lg border bg-background p-3">
                      <h3 className="text-sm font-semibold">Thuốc đang dùng</h3>
                      {medicationLabels.length === 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">Chưa có dữ liệu</p>
                      ) : (
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {medicationLabels.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                    <article className="rounded-lg border bg-background p-3">
                      <h3 className="text-sm font-semibold">Dị ứng</h3>
                      {allergyLabels.length === 0 ? (
                        <p className="mt-2 text-sm text-muted-foreground">Chưa có dữ liệu</p>
                      ) : (
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {allergyLabels.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                  </div>

                  {!isDemoSelection ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <article className="rounded-lg border bg-background p-3">
                        <h3 className="text-sm font-semibold">Phẫu thuật</h3>
                        {surgeryLabels.length === 0 ? (
                          <p className="mt-2 text-sm text-muted-foreground">Chưa có dữ liệu</p>
                        ) : (
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {surgeryLabels.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </article>
                      <article className="rounded-lg border bg-background p-3">
                        <h3 className="text-sm font-semibold">Tiêm chủng</h3>
                        {immunizationLabels.length === 0 ? (
                          <p className="mt-2 text-sm text-muted-foreground">Chưa có dữ liệu</p>
                        ) : (
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {immunizationLabels.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </article>
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-lg border bg-background p-4">
                    <h3 className="mb-2 text-lg font-semibold">Ghi chú lâm sàng</h3>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Ghi chú lưu trong phiên trình duyệt (sessionStorage), không ghi vào bảng patient.
                    </p>
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      className="min-h-28 w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      placeholder="Ghi lại triệu chứng và quan sát của bệnh nhân..."
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        className="min-h-11 rounded-lg px-4 text-sm text-muted-foreground hover:bg-muted"
                        onClick={() => {
                          setNoteDraft("");
                          writeNote(activeNoteKey, "");
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                        onClick={handleSaveNote}
                      >
                        Lưu ghi chú
                      </button>
                    </div>
                  </div>
                </>
              ) : activeTab === "records" ? (
                <PatientHealthRecordsPanel
                  lookupIds={[
                    realPatientUserId ?? "",
                    activeNoteKey,
                    patientDetail?.id ?? "",
                  ].filter(Boolean)}
                />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {OVERVIEW_TABS.find((t) => t.id === activeTab)?.label} — đang phát triển.
                </p>
              )}
            </section>

            <aside className="space-y-4">
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Sinh hiệu gần nhất</h3>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={() => setVitalSheetOpen(true)}
                      className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Nhập
                    </button>
                    <button
                      type="button"
                      onClick={() => setVitalHistoryOpen(true)}
                      className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      Lịch sử
                    </button>
                  </div>
                </div>
                {latestVitals?.is_critical && (
                  <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2 py-1.5 text-xs font-semibold text-destructive">
                    <Activity className="h-3.5 w-3.5" />
                    NGHIÊM TRỌNG
                  </div>
                )}
                {vitals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Chưa có sinh hiệu</p>
                ) : (
                  <ul className="space-y-2">
                    {vitals.map((vital) => (
                      <li key={vital.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{vital.label}</span>
                        <span className="font-semibold">{vital.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {latestVitals?.recorded_at && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Ghi lúc:{" "}
                    {new Date(latestVitals.recorded_at).toLocaleString("vi-VN", {
                      dateStyle: "short", timeStyle: "short",
                    })}
                  </p>
                )}
              </div>

              <div className="rounded-xl border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold">Xét nghiệm gần đây</h3>
                {recentLabs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {recentLabs.map((lab) => (
                      <p key={`${lab.name}-${lab.date}`} className="rounded-lg bg-muted px-3 py-2">
                        {lab.name}{lab.date ? ` · ${lab.date}` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">Liên hệ khẩn cấp</h3>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <Siren className="h-4 w-4 text-primary" aria-hidden="true" />
                  {emergencyName}
                </p>
                <p className="text-sm text-muted-foreground">{emergencyPhone}</p>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {/* <div className="mt-6">
        <Link
          to="/onboarding/profile"
          className="inline-flex min-h-11 items-center rounded-lg border px-4 text-sm hover:bg-muted"
        >
          <Stethoscope className="mr-2 h-4 w-4" aria-hidden="true" />
          Cập nhật từ dữ liệu đăng ký
        </Link>
      </div> */}

      {/* ── Vital signs sheet (doctor enters vitals directly) ─────────────────── */}
      <Sheet open={vitalSheetOpen} onOpenChange={(o) => { if (!o) setVitalSheetOpen(false); }}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
          <SheetHeader className="flex flex-row items-center gap-2 border-b px-5 py-4 shrink-0">
            <Activity className="h-5 w-5 text-primary" />
            <SheetTitle className="text-base font-bold text-primary">
              SINH HIỆU — {displayName}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {activeAppointmentId ? (
              <VitalSignsForm
                appointmentId={activeAppointmentId}
                patient={{ name: displayName, patientCode: displayId.replace(/^QC-/, "") }}
                onSuccess={() => {
                  setVitalSheetOpen(false);
                  void queryClient.invalidateQueries({ queryKey: ["vital_signs", "patient", realPatientUserId] });
                }}
                onCancel={() => setVitalSheetOpen(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
                <p className="text-sm text-muted-foreground">
                Bệnh nhân chưa có lịch ở trạng thái Đã tiếp nhận hoặc Đang khám để nhập sinh hiệu.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Vital signs history dialog ─────────────────────────────────────── */}
      <Dialog open={vitalHistoryOpen} onOpenChange={(o) => { setVitalHistoryOpen(o); if (!o) setEditingVital(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Lịch sử sinh hiệu — {displayName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {vitalHistory.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Chưa có dữ liệu sinh hiệu.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 text-left font-medium">Thời gian</th>
                    <th className="py-2 text-right font-medium">HA</th>
                    <th className="py-2 text-right font-medium">Nhịp tim</th>
                    <th className="py-2 text-right font-medium">Nhiệt độ</th>
                    <th className="py-2 text-right font-medium">SpO2</th>
                    <th className="py-2 text-right font-medium">Nhịp thở</th>
                    <th className="py-2 text-right font-medium">Cao (cm)</th>
                    <th className="py-2 text-right font-medium">Nặng (kg)</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {vitalHistory.map((v) => (
                    <tr key={v.id} className={`border-b last:border-0 ${v.is_critical ? "bg-destructive/5" : ""}`}>
                      <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(v.recorded_at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                        {v.is_critical && <span className="ml-1 text-[10px] font-bold text-destructive">NGHIÊM TRỌNG</span>}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {v.bp_systolic != null && v.bp_diastolic != null ? `${v.bp_systolic}/${v.bp_diastolic}` : "—"}
                      </td>
                      <td className="py-2 text-right font-mono">{v.heart_rate ?? "—"}</td>
                      <td className="py-2 text-right font-mono">{v.temperature_c != null ? `${v.temperature_c}°C` : "—"}</td>
                      <td className="py-2 text-right font-mono">{v.spo2 != null ? `${v.spo2}%` : "—"}</td>
                      <td className="py-2 text-right font-mono">{v.respiratory_rate ?? "—"}</td>
                      <td className="py-2 text-right font-mono">{v.height_cm ?? "—"}</td>
                      <td className="py-2 text-right font-mono">{v.weight_kg ?? "—"}</td>
                      <td className="py-2 pl-2">
                        <button
                          type="button"
                          onClick={() => setEditingVital(v)}
                          className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit vital signs dialog ────────────────────────────────────────── */}
      {editingVital && (
        <VitalEditDialog
          vital={editingVital}
          patientName={displayName}
          onClose={() => setEditingVital(null)}
          onSaved={() => {
            setEditingVital(null);
            void queryClient.invalidateQueries({ queryKey: ["vital_signs", "patient", realPatientUserId] });
            void queryClient.invalidateQueries({ queryKey: ["vital_signs_history", "patient", realPatientUserId] });
          }}
        />
      )}

      <AdminEditPatientDialog
        profileId={patientDetailFromDb?.id ?? null}
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: PATIENT_LIST_QUERY_KEY });
        }}
      />
    </>
  );
};

export default ProviderPatientsPage;
