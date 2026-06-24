import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Clock, AlertTriangle } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import VitalSignsForm from "@/components/provider/VitalSignsForm";
import { listVitalSignsByAppointment } from "@/lib/vital-signs-api";
import { supabase } from "@/lib/supabase";
import type { AdminAppointment } from "@/types/admin-appointment";
import type { VitalSignsRow } from "@/types/vital-signs";

type VitalSignsSheetProps = {
  appointment: AdminAppointment | null;
  onClose: () => void;
};

function fmt(v: number | null, unit: string) {
  return v != null ? `${v} ${unit}` : "—";
}

function HistoryCard({ v }: { v: VitalSignsRow }) {
  const time = new Date(v.recorded_at).toLocaleString("vi-VN", {
    dateStyle: "short", timeStyle: "short",
  });

  const items = [
    v.bp_systolic != null && v.bp_diastolic != null
      ? { label: "HA", value: `${v.bp_systolic}/${v.bp_diastolic} mmHg` }
      : null,
    v.heart_rate != null   ? { label: "Nhịp tim",  value: fmt(v.heart_rate, "bpm") } : null,
    v.temperature_c != null ? { label: "Nhiệt độ",  value: fmt(v.temperature_c, "°C") } : null,
    v.spo2 != null          ? { label: "SpO2",       value: fmt(v.spo2, "%") } : null,
    v.respiratory_rate != null ? { label: "Nhịp thở", value: fmt(v.respiratory_rate, "l/ph") } : null,
    v.weight_kg != null     ? { label: "Cân nặng",  value: fmt(v.weight_kg, "kg") } : null,
    v.height_cm != null     ? { label: "Chiều cao", value: fmt(v.height_cm, "cm") } : null,
    v.bmi != null           ? { label: "BMI",        value: String(v.bmi) } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className={`rounded-xl border p-3 text-xs space-y-2 ${v.is_critical ? "border-destructive/40 bg-destructive/5" : "bg-muted/40"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {time}
        </span>
        {v.is_critical && (
          <span className="flex items-center gap-1 font-semibold text-destructive">
            <AlertTriangle className="h-3 w-3" />
            CRITICAL
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {items.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-1">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold tabular-nums">{value}</span>
          </div>
        ))}
      </div>
      {v.clinical_note && (
        <p className="text-muted-foreground italic border-t pt-1.5 mt-1">"{v.clinical_note}"</p>
      )}
    </div>
  );
}

function toStr(v: number | null | undefined): string {
  return v != null ? String(v) : "";
}

export default function VitalSignsSheet({ appointment, onClose }: VitalSignsSheetProps) {
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["vital_signs", appointment?.id],
    queryFn: () =>
      listVitalSignsByAppointment(supabase, appointment!.id).then((r) => r.vitals),
    enabled: Boolean(appointment?.id),
    staleTime: 0,
  });

  if (!appointment) return null;

  const patientCode = appointment.profile_id.slice(0, 8).toUpperCase();
  const latest      = history[0] ?? null;

  // Pre-populate form with the latest recorded values so nurse can update easily
  const initialValues = latest
    ? {
        bp_systolic:      toStr(latest.bp_systolic),
        bp_diastolic:     toStr(latest.bp_diastolic),
        heart_rate:       toStr(latest.heart_rate),
        temperature_c:    toStr(latest.temperature_c),
        respiratory_rate: toStr(latest.respiratory_rate),
        spo2:             toStr(latest.spo2),
        weight_kg:        toStr(latest.weight_kg),
        height_cm:        toStr(latest.height_cm),
        clinical_note:    latest.clinical_note ?? "",
      }
    : undefined;

  return (
    <Sheet open={Boolean(appointment)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-0"
      >
        <SheetHeader className="flex flex-row items-center gap-2 border-b px-5 py-4 shrink-0">
          <Activity className="h-5 w-5 text-primary" />
          <SheetTitle className="text-base font-bold text-primary">
            SINH HIỆU — {appointment.patient_name ?? "Bệnh nhân"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* ── Lịch sử đo trước đó ──────────────────────────────────────── */}
          {isLoading && (
            <p className="text-xs text-muted-foreground animate-pulse">Đang tải lịch sử…</p>
          )}

          {history.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lịch sử đo ({history.length} lần)
              </h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {history.map((v) => (
                  <HistoryCard key={v.id} v={v} />
                ))}
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Form bên dưới sẽ <strong>thêm bản ghi mới</strong> (đã điền sẵn giá trị lần trước).
              </p>
            </section>
          )}

          {/* ── Form nhập mới ─────────────────────────────────────────────── */}
          <VitalSignsForm
            key={appointment.id}
            appointmentId={appointment.id}
            initialValues={initialValues}
            patient={{
              name:        appointment.patient_name ?? "Bệnh nhân",
              patientCode: patientCode,
            }}
            onSuccess={() => {
              void queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
              void queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
              void queryClient.invalidateQueries({ queryKey: ["vital_signs", appointment.id] });
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
