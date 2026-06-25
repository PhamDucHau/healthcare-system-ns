import { useState } from "react";
import { format, subDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, RefreshCw, Loader2,
  Search, MoreHorizontal, CheckCircle2, CalendarClock, XCircle, Trash2, Activity,
  AlertTriangle, ClipboardList, HeartPulse, Mail,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { fetchAdminAppointments } from "@/lib/admin-appointment-api";
import { sendPreConsultReminder } from "@/lib/doctor-appointment-api";
import { fetchSpecialties } from "@/lib/appointment-api";
import { fetchDoctors } from "@/lib/master-data-api";

import type { AdminAppointment, AdminAppointmentStatus } from "@/types/admin-appointment";
import {
  ADMIN_STATUS_LABEL, ADMIN_STATUS_COLOR, ADMIN_STATUS_DOT,
} from "@/types/admin-appointment";

import WalkInDialog from "./appointments/WalkInDialog";
import BulkCancelDialog from "./appointments/BulkCancelDialog";
import AppointmentDetailSheet from "./appointments/AppointmentDetailSheet";
import CancelDialog from "./appointments/CancelDialog";
import RescheduleDialog from "./appointments/RescheduleDialog";
import VitalSignsSheet from "./appointments/VitalSignsSheet";

const ALL_STATUSES: { value: AdminAppointmentStatus | "__all__"; label: string }[] = [
  { value: "__all__",    label: "Tất cả trạng thái" },
  { value: "CONFIRMED",  label: "Chờ khám" },
  { value: "CHECKED_IN", label: "Đã check-in" },
  { value: "IN_PROGRESS",label: "Đang khám" },
  { value: "COMPLETED",  label: "Hoàn thành" },
  { value: "CANCELLED",  label: "Đã hủy" },
  { value: "NO_SHOW",    label: "Không đến" },
];

function avatarInitial(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return (parts[parts.length - 1]?.charAt(0) ?? "?").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-red-100 text-red-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
];

function avatarColor(id: string): string {
  const idx = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function AdminAppointmentsContent() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [viewMode, setViewMode] = useState<"all" | "today" | "week" | "month">("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("__all__");
  const [statusFilter, setStatusFilter] = useState<string>("__all__");
  const [doctorFilter, setDoctorFilter] = useState<string>("__all__");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailAppt, setDetailAppt] = useState<AdminAppointment | null>(null);
  const [cancelAppt, setCancelAppt] = useState<AdminAppointment | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<AdminAppointment | null>(null);

  const [walkInOpen, setWalkInOpen] = useState(false);
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false);
  const [vitalSignsAppt, setVitalSignsAppt] = useState<AdminAppointment | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  const dateStr   = format(currentDate, "yyyy-MM-dd");
  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd   = format(endOfWeek(currentDate,   { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(currentDate), "yyyy-MM-dd");
  const monthEnd   = format(endOfMonth(currentDate),   "yyyy-MM-dd");

  const { data: appointments = [], isFetching, refetch } = useQuery({
    queryKey: [
      "admin-appointments",
      viewMode, dateStr,
      specialtyFilter, statusFilter, doctorFilter, searchQuery,
    ],
    queryFn: () =>
      fetchAdminAppointments({
        date:      viewMode === "today" ? dateStr    : undefined,
        date_from: viewMode === "week"  ? weekStart  : viewMode === "month" ? monthStart : undefined,
        date_to:   viewMode === "week"  ? weekEnd    : viewMode === "month" ? monthEnd   : undefined,
        specialty_id: specialtyFilter === "__all__" ? undefined : specialtyFilter,
        status:       statusFilter     === "__all__" ? undefined : (statusFilter as AdminAppointmentStatus),
        doctor_id:    doctorFilter     === "__all__" ? undefined : doctorFilter,
        search:       searchQuery.trim() || undefined,
      }),
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn:  fetchSpecialties,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn:  fetchDoctors,
  });

  const refresh = () => {
    setSelectedIds(new Set());
    void refetch();
  };

  // ── Selection helpers ──────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const selectableIds = appointments
      .filter((a) => !["CANCELLED", "COMPLETED"].includes(a.status))
      .map((a) => a.id);
    setSelectedIds((prev) => prev.size === selectableIds.length ? new Set() : new Set(selectableIds));
  };

  // ── Date navigation ────────────────────────────────────────────────────────

  const navigateDate = (dir: -1 | 1) => {
    setCurrentDate((d) => (dir === -1 ? subDays(d, 1) : addDays(d, 1)));
  };

  async function handlePreConsultReminder(appt: AdminAppointment) {
    if (appt.pre_consult_status === "submitted") {
      toast.info("Bệnh nhân đã hoàn thành khai báo trước khám.");
      return;
    }
    setRemindingId(appt.id);
    try {
      const { emailSent, email, emailError } = await sendPreConsultReminder(appt.id);
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
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-0.5">
            Staff Dashboard
          </p>
          {viewMode !== "all" && (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold text-foreground">
                {format(currentDate, "dd/MM/yyyy")}
              </h1>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {viewMode !== "all" && (
            <p className="text-sm text-muted-foreground mt-0.5 capitalize">
              {format(currentDate, "EEEE", { locale: vi })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode */}
          <div className="flex rounded-lg border overflow-hidden text-sm">
            {(["all", "today", "week", "month"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  viewMode === m
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {m === "all" ? "Tất cả" : m === "today" ? "Hôm nay" : m === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>

          <Button onClick={() => setWalkInOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Walk-in
          </Button>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tất cả chuyên khoa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả chuyên khoa</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tất cả bác sĩ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả bác sĩ</SelectItem>
            {doctors.map((d) => (
              <SelectItem key={d.user_id} value={d.user_id}>{d.full_name ?? d.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Tìm BN (tên, SĐT, CCCD)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button variant="outline" size="icon" onClick={refresh} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* ── Bulk actions bar ─────────────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.size} lịch đã chọn</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setBulkCancelOpen(true)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Hủy tất cả
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Bỏ chọn
          </Button>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {isFetching && appointments.length === 0 ? (
          <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Đang tải…</span>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[2.5rem_5rem_1fr_8rem_9rem_8rem_6rem] items-center gap-3 border-b px-4 py-3 bg-muted/40">
              <Checkbox
                checked={
                  appointments.length > 0 &&
                  selectedIds.size === appointments.filter((a) => !["CANCELLED","COMPLETED"].includes(a.status)).length
                }
                onCheckedChange={selectAll}
              />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Giờ</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bệnh nhân</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chuyên khoa</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bác sĩ</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trạng thái</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Thao tác</span>
            </div>

            {appointments.length === 0 ? (
              <div className="py-20 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Không có lịch hẹn nào.</p>
                <Button className="mt-4" size="sm" onClick={() => setWalkInOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Tạo Walk-in
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {appointments.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appt={appt}
                    selected={selectedIds.has(appt.id)}
                    onToggle={() => toggleSelect(appt.id)}
                    onClick={() => setDetailAppt(appt)}
                    onCheckin={() => {
                      /* inline quick-checkin done via detail sheet */
                      setDetailAppt(appt);
                    }}
                    onCancel={() => setCancelAppt(appt)}
                    onReschedule={() => setRescheduleAppt(appt)}
                    onVitalSigns={() => setVitalSignsAppt(appt)}
                    onPreConsultReminder={() => void handlePreConsultReminder(appt)}
                    reminding={remindingId === appt.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Walk-in dialog ───────────────────────────────────────────────────── */}
      <WalkInDialog
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onSuccess={() => { setWalkInOpen(false); refresh(); }}
      />

      {/* ── Bulk cancel ─────────────────────────────────────────────────────── */}
      <BulkCancelDialog
        appointmentIds={Array.from(selectedIds)}
        open={bulkCancelOpen}
        onClose={() => setBulkCancelOpen(false)}
        onSuccess={() => { setBulkCancelOpen(false); refresh(); }}
      />

      {/* ── Detail sheet ────────────────────────────────────────────────────── */}
      <AppointmentDetailSheet
        appointment={detailAppt}
        open={!!detailAppt}
        onClose={() => setDetailAppt(null)}
        onRefresh={refresh}
      />

      {/* ── Quick cancel from row ────────────────────────────────────────────── */}
      {cancelAppt && (
        <CancelDialog
          appointment={cancelAppt}
          open={!!cancelAppt}
          onClose={() => setCancelAppt(null)}
          onSuccess={() => { setCancelAppt(null); refresh(); }}
        />
      )}

      {/* ── Quick reschedule from row ────────────────────────────────────────── */}
      {rescheduleAppt && (
        <RescheduleDialog
          appointment={rescheduleAppt}
          open={!!rescheduleAppt}
          onClose={() => setRescheduleAppt(null)}
          onSuccess={() => { setRescheduleAppt(null); refresh(); }}
        />
      )}

      {/* ── Nhập sinh hiệu sheet ─────────────────────────────────────────────── */}
      <VitalSignsSheet
        appointment={vitalSignsAppt}
        onClose={() => setVitalSignsAppt(null)}
      />
    </div>
  );
}

// ── Row component ─────────────────────────────────────────────────────────────

interface RowProps {
  appt: AdminAppointment;
  selected: boolean;
  onToggle: () => void;
  onClick: () => void;
  onCheckin: () => void;
  onCancel: () => void;
  onReschedule: () => void;
  onVitalSigns: () => void;
  onPreConsultReminder: () => void;
  reminding: boolean;
}

function AppointmentRow({
  appt, selected, onToggle, onClick, onCheckin, onCancel, onReschedule,
  onVitalSigns, onPreConsultReminder, reminding,
}: RowProps) {
  const initials = avatarInitial(appt.patient_name);
  const color    = avatarColor(appt.id);

  const timeDisplay = appt.walk_in && !appt.slot_id
    ? "Walk-in"
    : appt.start_time?.slice(0, 5) ?? "—";

  const isSelectable = !["CANCELLED", "COMPLETED"].includes(appt.status);
  const canCheckin     = appt.status === "CONFIRMED";
  const canCancel      = !["CANCELLED", "COMPLETED"].includes(appt.status);
  const canReschedule  = ["CONFIRMED", "CHECKED_IN"].includes(appt.status) && !appt.walk_in;
  const canVitalSigns  = ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(appt.status);
  const canRemindPreConsult =
    appt.pre_consult_status !== "submitted" &&
    ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(appt.status);

  return (
    <div
      className={`grid grid-cols-[2.5rem_5rem_1fr_8rem_9rem_8rem_6rem] items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer ${selected ? "bg-primary/5" : ""}`}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          disabled={!isSelectable}
        />
      </div>

      {/* Time */}
      <span className={`text-base font-bold ${timeDisplay === "Walk-in" ? "text-orange-600 text-sm" : "text-foreground"}`}>
        {timeDisplay}
      </span>

      {/* Patient */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center font-semibold text-sm ${color}`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate flex items-center gap-1.5">
            {appt.patient_name || "—"}
            {appt.pre_consult_drug_allergy && (
              <span title="Dị ứng thuốc (khai báo trước khám)">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
              </span>
            )}
            {appt.pre_consult_severe_pain && (
              <span title="Đau dữ dội (khai báo trước khám)">
                <Activity className="h-3.5 w-3.5 text-orange-600 shrink-0" />
              </span>
            )}
            {appt.pre_consult_status === "submitted" && (
              <span title="Đã khai báo y tế trước khám">
                <ClipboardList className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            #{appt.id.slice(0, 6).toUpperCase()}
            {appt.walk_in && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0">Walk-in</Badge>
            )}
          </p>
        </div>
      </div>

      {/* Specialty */}
      <div className="hidden sm:block">
        {appt.specialty_name ? (
          <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 text-xs font-medium">
            {appt.specialty_name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Doctor */}
      <p className="text-sm text-muted-foreground truncate hidden md:block">
        {appt.doctor_name ? `Dr. ${appt.doctor_name.split(" ").pop()}` : "—"}
      </p>

      {/* Status */}
      <div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${ADMIN_STATUS_COLOR[appt.status]}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${ADMIN_STATUS_DOT[appt.status]}`} />
          {ADMIN_STATUS_LABEL[appt.status]}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canCheckin && (
              <DropdownMenuItem onClick={onCheckin}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Check-in
              </DropdownMenuItem>
            )}
            {canVitalSigns && (
              <DropdownMenuItem onClick={onVitalSigns}>
                <HeartPulse className="mr-2 h-4 w-4 text-teal-600" />
                Nhập sinh hiệu
              </DropdownMenuItem>
            )}
            {canRemindPreConsult && (
              <DropdownMenuItem disabled={reminding} onClick={onPreConsultReminder}>
                {reminding
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Mail className="mr-2 h-4 w-4 text-pink-600" />}
                Nhắc nhở khai báo
              </DropdownMenuItem>
            )}
            {canReschedule && (
              <DropdownMenuItem onClick={onReschedule}>
                <CalendarClock className="mr-2 h-4 w-4 text-amber-500" />
                Đổi lịch
              </DropdownMenuItem>
            )}
            {canCancel && (
              <DropdownMenuItem
                onClick={onCancel}
                className="text-destructive focus:text-destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Hủy lịch
              </DropdownMenuItem>
            )}
            {!canVitalSigns && !canRemindPreConsult && !canCheckin && !canReschedule && !canCancel && (
              <DropdownMenuItem disabled>
                Không có thao tác
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
