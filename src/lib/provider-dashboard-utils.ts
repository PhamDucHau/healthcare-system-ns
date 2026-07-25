import {
  addDays,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import type { ClinicalTask } from "@/lib/ai-assistant-api";
import type { AdminAppointment } from "@/types/admin-appointment";
import type { PatientRecordListRow } from "@/types/patient-portal";

export type DashboardScheduleItem = {
  id: string;
  time: string;
  patient: string;
  type: string;
  mode: string;
  isVideo: boolean;
  href: string;
};

export type DashboardRecentPatient = {
  id: string;
  name: string;
  last: string;
  status: string;
};

export type DashboardClinicalTaskItem = {
  id: string;
  title: string;
  due: string;
  done: number;
};

export type DashboardWeekChartPoint = {
  day: string;
  count: number;
};

export type DashboardTodayStats = {
  total: number;
  remaining: number;
};

export type DashboardMonitoringStats = {
  total: number;
  newThisWeek: number;
};

export type RawPatientRow = {
  id: string;
  legal_first_name?: string | null;
  legal_last_name?: string | null;
  submitted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const ACTIVE_STATUSES = new Set(["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"]);
const EXCLUDED_STATUSES = new Set(["CANCELLED", "NO_SHOW"]);

export function formatDoctorDisplayName(fullName: string | null | undefined): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return "Bác sĩ";
  if (/^bác sĩ|^bs\.?/i.test(trimmed)) return trimmed;
  return `BS. ${trimmed}`;
}

export function formatAppointmentTime(startTime: string | null | undefined): string {
  if (!startTime) return "—";
  return startTime.slice(0, 5);
}

export function deriveTodayStats(appointments: AdminAppointment[]): DashboardTodayStats {
  const active = appointments.filter((a) => !EXCLUDED_STATUSES.has(a.status));
  const remaining = active.filter((a) => ACTIVE_STATUSES.has(a.status));
  return { total: active.length, remaining: remaining.length };
}

export function deriveTodaySchedule(appointments: AdminAppointment[]): DashboardScheduleItem[] {
  return appointments
    .filter((a) => !EXCLUDED_STATUSES.has(a.status))
    .sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""))
    .map((a) => ({
      id: a.id,
      time: formatAppointmentTime(a.start_time),
      patient: a.patient_name ?? "Bệnh nhân",
      type: a.specialty_name ?? a.note ?? "Khám bệnh",
      mode: a.walk_in ? "Khám không hẹn" : "Trực tiếp",
      isVideo: false,
      href:
        a.status === "IN_PROGRESS"
          ? `/provider-portal/examination/${a.id}`
          : "/provider-portal/appointments",
    }));
}

export function deriveWeeklyChart(
  appointments: AdminAppointment[],
  anchor: Date,
): DashboardWeekChartPoint[] {
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });

  const counts = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    counts.set(format(d, "yyyy-MM-dd"), 0);
  }

  for (const appt of appointments) {
    if (EXCLUDED_STATUSES.has(appt.status)) continue;
    const slotDate = appt.slot_date ?? appt.created_at?.slice(0, 10);
    if (!slotDate || !counts.has(slotDate)) continue;
    counts.set(slotDate, (counts.get(slotDate) ?? 0) + 1);
  }

  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const key = format(d, "yyyy-MM-dd");
    return {
      day: format(d, "EEEEEE", { locale: vi }).toUpperCase(),
      count: counts.get(key) ?? 0,
    };
  });
}

export function taskProgress(status: ClinicalTask["status"]): number {
  if (status === "IN_PROGRESS") return 50;
  if (status === "COMPLETED") return 100;
  return 0;
}

export function formatTaskDueLabel(dueDate: string, now: Date = new Date()): string {
  try {
    const due = parseISO(dueDate);
    if (isSameDay(due, now)) return "Hôm nay";
    return formatDistanceToNow(due, { locale: vi, addSuffix: true });
  } catch {
    return dueDate.slice(0, 10);
  }
}

export function deriveClinicalTaskItems(
  tasks: ClinicalTask[],
  limit = 4,
  now: Date = new Date(),
): DashboardClinicalTaskItem[] {
  return tasks
    .filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS")
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, limit)
    .map((t) => ({
      id: t.id,
      title: t.title,
      due: formatTaskDueLabel(t.due_date, now),
      done: taskProgress(t.status),
    }));
}

export function mapPatientRecordToDashboard(row: PatientRecordListRow): DashboardRecentPatient {
  const lastActivity = row.updated_at ?? row.submitted_at;
  let last = "—";
  if (lastActivity) {
    try {
      last = formatDistanceToNow(new Date(lastActivity), { locale: vi, addSuffix: true });
    } catch {
      last = lastActivity.slice(0, 10);
    }
  }
  return {
    id: row.id,
    name: row.full_name,
    last,
    status: row.submitted_at ? "Active" : "Draft",
  };
}

export function mapPatientRow(row: RawPatientRow): DashboardRecentPatient {
  const name =
    [row.legal_last_name, row.legal_first_name].filter(Boolean).join(" ").trim() || "Bệnh nhân";
  const lastActivity = row.updated_at ?? row.submitted_at ?? row.created_at;
  let last = "—";
  if (lastActivity) {
    try {
      last = formatDistanceToNow(new Date(lastActivity), { locale: vi, addSuffix: true });
    } catch {
      last = lastActivity.slice(0, 10);
    }
  }
  return {
    id: row.id,
    name,
    last,
    status: row.submitted_at ? "Active" : "Draft",
  };
}

export function deriveRecentPatients(rows: RawPatientRow[], limit = 5): DashboardRecentPatient[] {
  return [...rows]
    .sort((a, b) => {
      const aTs = a.updated_at ?? a.submitted_at ?? a.created_at ?? "";
      const bTs = b.updated_at ?? b.submitted_at ?? b.created_at ?? "";
      return bTs.localeCompare(aTs);
    })
    .slice(0, limit)
    .map(mapPatientRow);
}

export function deriveMonitoringStats(
  patients: RawPatientRow[],
  anchor: Date = new Date(),
): DashboardMonitoringStats {
  const submitted = patients.filter((p) => Boolean(p.submitted_at));
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });

  const newThisWeek = submitted.filter((p) => {
    const ts = p.submitted_at ?? p.created_at;
    if (!ts) return false;
    try {
      const d = parseISO(ts);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    } catch {
      return false;
    }
  }).length;

  return { total: submitted.length, newThisWeek };
}

export function formatWeekdayDate(date: Date): string {
  return format(date, "EEEE, dd/MM/yyyy", { locale: vi });
}

export function getWeekRange(anchor: Date): { dateFrom: string; dateTo: string; today: string } {
  const today = format(anchor, "yyyy-MM-dd");
  const dateFrom = format(startOfWeek(anchor, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const dateTo = format(endOfWeek(anchor, { weekStartsOn: 1 }), "yyyy-MM-dd");
  return { dateFrom, dateTo, today };
}
