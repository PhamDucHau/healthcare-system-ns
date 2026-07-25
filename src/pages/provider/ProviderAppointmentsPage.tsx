import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDays, endOfMonth, endOfWeek,
  format, startOfMonth, startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  Activity, AlertTriangle, CalendarCheck, CalendarClock, CalendarX, ChevronLeft, ChevronRight,
  ClipboardList, HeartPulse, Loader2, Mail, MoreHorizontal, Plus, RefreshCw, Search, Stethoscope,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  fetchDoctorSpecialtyId,
  searchDoctorAppointments,
  sendPreConsultReminder,
} from "@/lib/doctor-appointment-api";
import { supabase } from "@/lib/supabase";
import {
  getAppointmentReadiness,
  getAppointmentReadinessMessage,
} from "@/lib/appointment-readiness";
import { toast } from "sonner";
import type { AdminAppointment, AdminAppointmentStatus } from "@/types/admin-appointment";
import { UI_CHECKED_IN, UI_CHECK_IN } from "@/config/ui-labels";
import { ADMIN_STATUS_LABEL, ADMIN_STATUS_DOT, ADMIN_STATUS_COLOR, WALK_IN_LABEL } from "@/types/admin-appointment";
import AppointmentDetailSheet from "@/components/admin/appointments/AppointmentDetailSheet";
import CancelDialog from "@/components/admin/appointments/CancelDialog";
import RescheduleDialog from "@/components/admin/appointments/RescheduleDialog";
import VitalSignsSheet from "@/components/admin/appointments/VitalSignsSheet";
import WalkInDialog from "@/components/admin/appointments/WalkInDialog";

type DateMode = "all" | "day" | "week" | "month";

const APPOINTMENT_LIST_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const DOCTOR_APPOINTMENTS_QUERY_KEY = ["doctor-appointments"] as const;

const ALL_STATUSES: { value: AdminAppointmentStatus | "__all__"; label: string }[] = [
  { value: "__all__",     label: "Tất cả trạng thái" },
  { value: "CONFIRMED",   label: "Chờ khám" },
  { value: "CHECKED_IN",  label: UI_CHECKED_IN },
  { value: "IN_PROGRESS", label: "Đang khám" },
  { value: "COMPLETED",   label: "Hoàn thành" },
  { value: "CANCELLED",   label: "Đã hủy" },
  { value: "NO_SHOW",     label: "Không đến" },
];

function avatarInitial(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return (parts[parts.length - 1]?.charAt(0) ?? "?").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-sky-200 text-sky-800", "bg-violet-200 text-violet-800",
  "bg-emerald-200 text-emerald-800", "bg-amber-200 text-amber-800",
  "bg-rose-200 text-rose-800", "bg-teal-200 text-teal-800",
];
function avatarColor(name: string | null): string {
  const i = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

function dateRangeFor(mode: DateMode, anchor: Date): { dateFrom: string; dateTo: string; label: string } {
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");
  if (mode === "day") {
    const s = fmt(anchor);
    return { dateFrom: s, dateTo: s, label: format(anchor, "dd/MM/yyyy", { locale: vi }) };
  }
  if (mode === "week") {
    const s = startOfWeek(anchor, { weekStartsOn: 1 });
    const e = endOfWeek(anchor,   { weekStartsOn: 1 });
    return {
      dateFrom: fmt(s), dateTo: fmt(e),
      label: `${format(s, "dd/MM")} – ${format(e, "dd/MM/yyyy", { locale: vi })}`,
    };
  }
  const s = startOfMonth(anchor);
  const e = endOfMonth(anchor);
  return {
    dateFrom: fmt(s), dateTo: fmt(e),
    label: format(anchor, "MM/yyyy", { locale: vi }),
  };
}

function stepAnchor(mode: DateMode, anchor: Date, dir: 1 | -1): Date {
  if (mode === "day")   return addDays(anchor, dir);
  if (mode === "week")  return addDays(anchor, dir * 7);
  const d = new Date(anchor);
  d.setMonth(d.getMonth() + dir);
  return d;
}

export default function ProviderAppointmentsPage() {
  const [mode, setMode] = useState<DateMode>("all");
  const [anchor, setAnchor] = useState(() => new Date());
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [listPage, setListPage] = useState(1);
  const [status, setStatus] = useState<string>("__all__");
  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [vitalSignsAppt, setVitalSignsAppt] = useState<AdminAppointment | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { dateFrom, dateTo, label } = mode === "all"
    ? { dateFrom: undefined, dateTo: undefined, label: "Tất cả" }
    : dateRangeFor(mode, anchor);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setListPage(1);
  }, [debouncedSearch, status, dateFrom, dateTo, mode]);

  const listQueryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      page: listPage,
      limit: APPOINTMENT_LIST_PAGE_SIZE,
      status: status === "__all__" ? undefined : status,
      dateFrom,
      dateTo,
    }),
    [debouncedSearch, listPage, status, dateFrom, dateTo],
  );

  const { data: doctorSpecialtyId } = useQuery({
    queryKey: ["doctor-specialty-id"],
    queryFn: fetchDoctorSpecialtyId,
    staleTime: 60_000,
  });

  const {
    data: appointmentListData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [...DOCTOR_APPOINTMENTS_QUERY_KEY, listQueryParams],
    queryFn: async () => {
      const { rows, total, error } = await searchDoctorAppointments(listQueryParams);
      if (error) throw error;
      return { rows, total };
    },
    placeholderData: (previous) => previous,
  });

  const filtered = appointmentListData?.rows ?? [];
  const appointmentTotal = appointmentListData?.total ?? 0;
  const appointmentTotalPages = Math.max(
    1,
    Math.ceil(appointmentTotal / APPOINTMENT_LIST_PAGE_SIZE),
  );
  const appointmentFrom =
    appointmentTotal === 0 ? 0 : (listPage - 1) * APPOINTMENT_LIST_PAGE_SIZE + 1;
  const appointmentTo =
    appointmentTotal === 0
      ? 0
      : Math.min(listPage * APPOINTMENT_LIST_PAGE_SIZE, appointmentTotal);

  const goToday = () => setAnchor(new Date());

  const warnIfNotReady = (row: AdminAppointment): boolean => {
    const readiness = getAppointmentReadiness(row);
    if (readiness.isReady) return true;
    toast.warning(getAppointmentReadinessMessage(readiness), { duration: 7000 });
    return false;
  };

  const handleCheckin = async (row: AdminAppointment): Promise<boolean> => {
    if (!warnIfNotReady(row)) return false;
    setCheckingInId(row.id);
    try {
      const { error } = await supabase.rpc("admin_checkin_appointment", { p_appointment_id: row.id });
      if (error) throw error;
      void refetch();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tiếp nhận thất bại");
      return false;
    } finally {
      setCheckingInId(null);
    }
  };

  const handleExamination = async (row: AdminAppointment) => {
    if (!warnIfNotReady(row)) return;
    if (row.status === "CONFIRMED") {
      const ok = await handleCheckin(row);
      if (ok) navigate(`/provider-portal/examination/${row.id}`);
      return;
    }
    navigate(`/provider-portal/examination/${row.id}`);
  };

  const handleVitalSigns = (row: AdminAppointment) => {
    if (["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(row.status)) {
      setVitalSignsAppt(row);
    }
  };

  const handlePreConsultReminder = async (row: AdminAppointment) => {
    if (row.pre_consult_status === "submitted") {
      toast.info("Bệnh nhân đã hoàn thành khai báo trước khám.");
      return;
    }
    setRemindingId(row.id);
    try {
      const { emailSent, email, emailError } = await sendPreConsultReminder(row.id);
      if (emailSent) {
        toast.success(`Đã gửi email nhắc nhở${email ? ` tới ${email}` : ""}.`);
      } else {
        toast.error(emailError ?? "Không gửi được email nhắc nhở.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không gửi được email nhắc nhở.");
    } finally {
      setRemindingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
          <CalendarClock className="h-7 w-7 text-primary" />
          Lịch hẹn của tôi
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setWalkInOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            {WALK_IN_LABEL}
          </Button>
          <Button variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>
            {isFetching
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <RefreshCw className="h-4 w-4" />}
            Làm mới
          </Button>
        </div>
      </div>

      {/* Date navigation + mode toggle */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        {/* Mode buttons */}
        <div className="flex rounded-lg border overflow-hidden text-sm">
          {(["all", "day", "week", "month"] as DateMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setAnchor(new Date()); }}
              className={`px-4 py-2 font-medium transition-colors ${
                mode === m ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {m === "all" ? "Tất cả" : m === "day" ? "Hôm nay" : m === "week" ? "Tuần" : "Tháng"}
            </button>
          ))}
        </div>

        {/* Arrows + label — hidden when viewing all */}
        {mode !== "all" && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAnchor((a) => stepAnchor(mode, a, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[130px] text-center text-sm font-semibold">{label}</span>
            <button
              type="button"
              onClick={() => setAnchor((a) => stepAnchor(mode, a, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {mode !== "all" && (
          <Button variant="ghost" size="sm" onClick={goToday} className="text-xs">
            Hôm nay
          </Button>
        )}

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm BN (tên, SĐT)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Status filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground ml-auto">
          {appointmentTotal} lịch hẹn
          {isFetching && !isLoading ? (
            <Loader2 className="ml-1 inline h-3 w-3 animate-spin" aria-hidden="true" />
          ) : null}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải…
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {debouncedSearch
              ? "Không tìm thấy lịch hẹn phù hợp."
              : "Không có lịch hẹn nào trong khoảng thời gian này."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Giờ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead>Chuyên khoa</TableHead>
                  <TableHead>Ngày khám</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => {
                  const canCancel = !["CANCELLED", "COMPLETED"].includes(row.status);
                  const canReschedule = ["CONFIRMED", "CHECKED_IN"].includes(row.status) && !row.walk_in;
                  const canVitalSigns = ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(row.status);
                  const canRemindPreConsult =
                    row.pre_consult_status !== "submitted" &&
                    ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(row.status);
                  return (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => { setSelected(row); setSheetOpen(true); }}
                    >
                      <TableCell className="font-mono text-sm font-semibold">
                        {row.start_time
                          ? row.start_time.slice(0, 5)
                          : <span className="font-sans text-orange-500 font-bold text-[11px] leading-tight">{WALK_IN_LABEL}</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(row.patient_name)}`}>
                            {avatarInitial(row.patient_name)}
                          </span>
                          <div>
                            <p className="font-medium text-sm leading-tight flex items-center gap-1.5">
                              {row.patient_name ?? "—"}
                              {row.pre_consult_drug_allergy && (
                                <span title="Dị ứng thuốc (khai báo trước khám)">
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                                </span>
                              )}
                              {row.pre_consult_severe_pain && (
                                <span title="Đau dữ dội (khai báo trước khám)">
                                  <Activity className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                                </span>
                              )}
                              {row.pre_consult_status === "submitted" && (
                                <span title="Đã khai báo y tế trước khám">
                                  <ClipboardList className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                </span>
                              )}
                            </p>
                            {row.patient_phone && (
                              <p className="text-xs text-muted-foreground">{row.patient_phone}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.doctor_name
                          ? `Bs. ${row.doctor_name}`
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {row.specialty_name ? (
                          <Badge variant="outline" className="text-xs">
                            {row.specialty_icon} {row.specialty_name}
                          </Badge>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.slot_date
                          ? format(new Date(row.slot_date), "dd/MM/yyyy", { locale: vi })
                          : WALK_IN_LABEL}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ADMIN_STATUS_COLOR[row.status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${ADMIN_STATUS_DOT[row.status]}`} />
                          {ADMIN_STATUS_LABEL[row.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {row.status !== "COMPLETED" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {row.status === "CONFIRMED" && (<>
                              <DropdownMenuItem
                                disabled={checkingInId === row.id}
                                onClick={() => void handleCheckin(row)}
                              >
                                {checkingInId === row.id
                                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  : <CalendarCheck className="mr-2 h-4 w-4 text-green-600" />}
                                {UI_CHECK_IN}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={checkingInId === row.id}
                                onClick={() => void handleExamination(row)}
                              >
                                {checkingInId === row.id
                                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  : <Stethoscope className="mr-2 h-4 w-4 text-primary" />}
                                Khám
                              </DropdownMenuItem>
                            </>)}
                            {(row.status === "CHECKED_IN" || row.status === "IN_PROGRESS") && (
                              <DropdownMenuItem onClick={() => void handleExamination(row)}>
                                <Stethoscope className="mr-2 h-4 w-4 text-primary" />
                                Khám bệnh (SOAP)
                              </DropdownMenuItem>
                            )}
                            {canVitalSigns && (
                              <DropdownMenuItem onClick={() => handleVitalSigns(row)}>
                                <HeartPulse className="mr-2 h-4 w-4 text-teal-600" />
                                Nhập sinh hiệu
                              </DropdownMenuItem>
                            )}
                            {canRemindPreConsult && (
                              <DropdownMenuItem
                                disabled={remindingId === row.id}
                                onClick={() => void handlePreConsultReminder(row)}
                              >
                                {remindingId === row.id
                                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  : <Mail className="mr-2 h-4 w-4 text-pink-600" />}
                                Nhắc nhở khai báo
                              </DropdownMenuItem>
                            )}
                            {canReschedule && (
                              <DropdownMenuItem onClick={() => { setSelected(row); setRescheduleOpen(true); }}>
                                <CalendarClock className="mr-2 h-4 w-4 text-amber-500" />
                                Đổi lịch
                              </DropdownMenuItem>
                            )}
                            {canCancel && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => { setSelected(row); setCancelOpen(true); }}
                              >
                                <CalendarX className="mr-2 h-4 w-4" />
                                Hủy lịch
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {appointmentTotal > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Hiển thị{" "}
            <span className="font-semibold text-foreground">
              {appointmentFrom}–{appointmentTo}
            </span>{" "}
            / {appointmentTotal} lịch hẹn
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={listPage <= 1 || isFetching}
              onClick={() => setListPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Trước
            </Button>
            <span className="min-w-[72px] text-center text-xs font-medium text-muted-foreground">
              {listPage}/{appointmentTotalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={listPage >= appointmentTotalPages || isFetching}
              onClick={() => setListPage((p) => Math.min(appointmentTotalPages, p + 1))}
            >
              Sau
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <AppointmentDetailSheet
        appointment={selected}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onRefresh={() => void refetch()}
      />

      {selected && (
        <CancelDialog
          appointment={selected}
          open={cancelOpen}
          onClose={() => setCancelOpen(false)}
          onSuccess={() => { setCancelOpen(false); void refetch(); }}
        />
      )}

      {selected && rescheduleOpen && (
        <RescheduleDialog
          appointment={selected}
          open={rescheduleOpen}
          onClose={() => setRescheduleOpen(false)}
          onSuccess={() => { setRescheduleOpen(false); void refetch(); }}
        />
      )}

      <VitalSignsSheet
        appointment={vitalSignsAppt}
        onClose={() => setVitalSignsAppt(null)}
      />

      <WalkInDialog
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onSuccess={() => { setWalkInOpen(false); void refetch(); }}
        portal="provider"
        defaultSpecialtyId={doctorSpecialtyId ?? undefined}
        lockSpecialty={Boolean(doctorSpecialtyId)}
      />

    </div>
  );
}
