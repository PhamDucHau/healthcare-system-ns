import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDays, endOfMonth, endOfWeek,
  format, startOfMonth, startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  Activity, AlertTriangle, CalendarCheck, CalendarClock, CalendarX, ChevronLeft, ChevronRight,
  ClipboardList, Loader2, MoreHorizontal, RefreshCw, Search, Stethoscope,
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
import { fetchDoctorAppointments } from "@/lib/doctor-appointment-api";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { AdminAppointment, AdminAppointmentStatus } from "@/types/admin-appointment";
import { ADMIN_STATUS_LABEL, ADMIN_STATUS_DOT, ADMIN_STATUS_COLOR } from "@/types/admin-appointment";
import AppointmentDetailSheet from "@/components/admin/appointments/AppointmentDetailSheet";
import CancelDialog from "@/components/admin/appointments/CancelDialog";
import RescheduleDialog from "@/components/admin/appointments/RescheduleDialog";

type DateMode = "all" | "day" | "week" | "month";

const ALL_STATUSES: { value: AdminAppointmentStatus | "__all__"; label: string }[] = [
  { value: "__all__",     label: "Tất cả trạng thái" },
  { value: "CONFIRMED",   label: "Chờ khám" },
  { value: "CHECKED_IN",  label: "Đã check-in" },
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("__all__");
  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { dateFrom, dateTo, label } = mode === "all"
    ? { dateFrom: undefined, dateTo: undefined, label: "Tất cả" }
    : dateRangeFor(mode, anchor);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["doctor-appointments", dateFrom ?? "all", dateTo ?? "all", status],
    queryFn: () => fetchDoctorAppointments({
      dateFrom, dateTo,
      status: status === "__all__" ? undefined : status,
    }),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((r) =>
      r.patient_name?.toLowerCase().includes(q) ||
      r.patient_phone?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const goToday = () => setAnchor(new Date());

  const handleCheckin = async (appointmentId: string): Promise<boolean> => {
    setCheckingInId(appointmentId);
    try {
      const { error } = await supabase.rpc("admin_checkin_appointment", { p_appointment_id: appointmentId });
      if (error) throw error;
      void refetch();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Check-in thất bại");
      return false;
    } finally {
      setCheckingInId(null);
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
        <Button variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>
          {isFetching
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <RefreshCw className="h-4 w-4" />}
          Làm mới
        </Button>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          {filtered.length} lịch hẹn
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
            Không có lịch hẹn nào trong khoảng thời gian này.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Giờ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
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
                  return (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => { setSelected(row); setSheetOpen(true); }}
                    >
                      <TableCell className="font-mono text-sm font-semibold">
                        {row.start_time
                          ? row.start_time.slice(0, 5)
                          : <span className="font-sans text-orange-500 font-bold">Walk-in</span>}
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
                          : "Walk-in"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ADMIN_STATUS_COLOR[row.status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${ADMIN_STATUS_DOT[row.status]}`} />
                          {ADMIN_STATUS_LABEL[row.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                                onClick={() => void handleCheckin(row.id)}
                              >
                                {checkingInId === row.id
                                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  : <CalendarCheck className="mr-2 h-4 w-4 text-green-600" />}
                                Check-in
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={checkingInId === row.id}
                                onClick={() => void handleCheckin(row.id).then((ok) =>
                                  ok && navigate(`/provider-portal/examination/${row.id}`)
                                )}
                              >
                                {checkingInId === row.id
                                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  : <Stethoscope className="mr-2 h-4 w-4 text-primary" />}
                                Khám
                              </DropdownMenuItem>
                            </>)}
                            {(row.status === "CHECKED_IN" || row.status === "IN_PROGRESS") && (
                              <DropdownMenuItem
                                onClick={() => navigate(`/provider-portal/examination/${row.id}`)}
                              >
                                <Activity className="mr-2 h-4 w-4 text-blue-500" />
                                Khám bệnh (SOAP)
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

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

    </div>
  );
}
