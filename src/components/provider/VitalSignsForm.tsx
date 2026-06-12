import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Activity, Heart, Thermometer, Wind, Scale,
  AlertTriangle, CheckCircle2, Siren, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { recordVitalSigns } from "@/lib/vital-signs-api";
import {
  VITAL_RANGES, computeBmi, bmiCategory, isOutOfRange,
  type VitalFieldKey,
  type RecordVitalSignsInput,
} from "@/types/vital-signs";

// ── Types ─────────────────────────────────────────────────────────────────────

type FormState = {
  bp_systolic:      string;
  bp_diastolic:     string;
  heart_rate:       string;
  temperature_c:    string;
  respiratory_rate: string;
  spo2:             string;
  weight_kg:        string;
  height_cm:        string;
  clinical_note:    string;
};

type FieldError = {
  type: "error" | "warning";
  message: string;
};

type PatientInfo = {
  name: string;
  patientCode: string;
  avatarUrl?: string;
};

type VitalSignsFormProps = {
  appointmentId: string;
  patient: PatientInfo;
  initialValues?: Partial<FormState>;
  onSuccess?: (isCritical: boolean) => void;
  onCancel?: () => void;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY: FormState = {
  bp_systolic: "", bp_diastolic: "",
  heart_rate: "", temperature_c: "", respiratory_rate: "", spo2: "",
  weight_kg: "", height_cm: "",
  clinical_note: "",
};

function parseNum(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function validateField(key: VitalFieldKey, raw: string): FieldError | null {
  if (raw === "") return null;
  const n = parseNum(raw);
  if (n === null) return { type: "error", message: "Giá trị không hợp lệ" };
  const range = VITAL_RANGES[key];
  if (isOutOfRange(key, n)) {
    return {
      type: "warning",
      message: `${range.label} nằm ngoài khoảng bình thường (${range.min}–${range.max} ${range.unit})`,
    };
  }
  return null;
}

function bpWarning(systolic: string, diastolic: string): string | null {
  const s = parseNum(systolic);
  const d = parseNum(diastolic);
  if (s === null && d === null) return null;
  if (s !== null && s >= 140) return `HA cao — Bình thường < 140/90`;
  if (d !== null && d >= 90)  return `HA cao — Bình thường < 140/90`;
  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VitalInput({
  label, unit, value, onChange, fieldKey, placeholder,
}: {
  label: string; unit: string; value: string;
  onChange: (v: string) => void;
  fieldKey: VitalFieldKey;
  placeholder?: string;
}) {
  const err = validateField(fieldKey, value);
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground font-medium">{label} ({unit})</label>
      <input
        type="number"
        step="any"
        value={value}
        placeholder={placeholder ?? "—"}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border-2 px-3 py-3 text-lg font-semibold outline-none transition-colors focus:border-primary/60 ${
          err?.type === "error"
            ? "border-destructive/60 bg-destructive/5"
            : err?.type === "warning"
            ? "border-amber-400/60"
            : "border-border bg-background"
        }`}
      />
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, unit, fieldKey, onChange, iconColor,
}: {
  icon: React.ElementType; label: string; value: string; unit: string;
  fieldKey: VitalFieldKey; onChange: (v: string) => void; iconColor: string;
}) {
  const err = validateField(fieldKey, value);
  const dotColor = err?.type === "error"
    ? "bg-destructive"
    : err?.type === "warning"
    ? "bg-amber-400"
    : "bg-emerald-400";

  return (
    <div className="relative rounded-2xl border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-end gap-1">
        <input
          type="number"
          step="any"
          value={value}
          placeholder="—"
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/40"
        />
        <span className="text-xs text-muted-foreground pb-1">{unit}</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function VitalSignsForm({
  appointmentId, patient, initialValues, onSuccess, onCancel,
}: VitalSignsFormProps) {
  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY, ...initialValues }));

  // Re-sync when initialValues change (e.g. sheet opened for different appointment)
  useEffect(() => {
    setForm({ ...EMPTY, ...(initialValues ?? {}) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<VitalFieldKey, FieldError>>>({});

  const set = useCallback((key: keyof FormState) => (v: string) => {
    setForm((prev) => ({ ...prev, [key]: v }));
  }, []);

  // Re-validate all vital fields on change
  useEffect(() => {
    const next: Partial<Record<VitalFieldKey, FieldError>> = {};
    for (const k of Object.keys(VITAL_RANGES) as VitalFieldKey[]) {
      const err = validateField(k, form[k as keyof FormState] as string);
      if (err) next[k] = err;
    }
    setFieldErrors(next);
  }, [form]);

  // BMI
  const weightNum  = parseNum(form.weight_kg);
  const heightNum  = parseNum(form.height_cm);
  const bmi        = weightNum && heightNum && weightNum > 0 && heightNum > 0
    ? computeBmi(weightNum, heightNum)
    : null;
  const bmiLabel   = bmi ? bmiCategory(bmi) : null;

  // HA warning banner
  const bpWarnMsg = bpWarning(form.bp_systolic, form.bp_diastolic);

  // Weight/height hard errors (RULE-014a)
  const weightErr = form.weight_kg !== "" && (parseNum(form.weight_kg) ?? 0) <= 0
    ? "Cân nặng phải > 0"
    : null;
  const heightErr = form.height_cm !== "" && (parseNum(form.height_cm) ?? 0) <= 0
    ? "Chiều cao phải > 0"
    : null;

  const hasBlockingError = Boolean(weightErr || heightErr);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      const input: RecordVitalSignsInput = {
        appointment_id:   appointmentId,
        bp_systolic:      parseNum(form.bp_systolic),
        bp_diastolic:     parseNum(form.bp_diastolic),
        heart_rate:       parseNum(form.heart_rate),
        temperature_c:    parseNum(form.temperature_c),
        respiratory_rate: parseNum(form.respiratory_rate),
        spo2:             parseNum(form.spo2),
        weight_kg:        parseNum(form.weight_kg),
        height_cm:        parseNum(form.height_cm),
        clinical_note:    form.clinical_note.trim() || null,
      };
      const { result, error } = await recordVitalSigns(supabase, input);
      if (error) throw error;
      return result!;
    },
    onSuccess: (result) => {
      if (result.is_critical) {
        toast.error("⚠ Sinh hiệu CRITICAL — Thông báo đến Bác sĩ ngay!", {
          duration: 8000,
          description: result.critical_flags.join(" · "),
        });
      } else {
        toast.success("Đã lưu sinh hiệu thành công");
      }
      onSuccess?.(result.is_critical);
    },
    onError: (err: Error) => {
      if (err.message.includes("INVALID_WEIGHT")) {
        toast.error("Cân nặng phải > 0");
      } else if (err.message.includes("INVALID_HEIGHT")) {
        toast.error("Chiều cao phải > 0");
      } else {
        toast.error(`Lưu thất bại: ${err.message}`);
      }
    },
  });

  return (
    <div className="flex flex-col gap-5 pb-4">

      {/* ── Patient header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
        <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
          {patient.avatarUrl ? (
            <img src={patient.avatarUrl} alt={patient.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-slate-500">
              {patient.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="text-base font-bold">{patient.name}</p>
          <p className="text-sm text-muted-foreground">Mã bệnh nhân: #{patient.patientCode}</p>
        </div>
      </div>

      {/* ── Huyết áp ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-teal-600" />
          <h3 className="text-sm font-semibold">Huyết Áp</h3>
        </div>
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <VitalInput
              label="Tâm thu" unit="mmHg"
              value={form.bp_systolic} onChange={set("bp_systolic")}
              fieldKey="bp_systolic" placeholder="120"
            />
            <VitalInput
              label="Tâm trương" unit="mmHg"
              value={form.bp_diastolic} onChange={set("bp_diastolic")}
              fieldKey="bp_diastolic" placeholder="80"
            />
          </div>

          {bpWarnMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>{bpWarnMsg}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Metric cards grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={Heart} label="Nhịp tim" value={form.heart_rate}
          unit="bpm" fieldKey="heart_rate" onChange={set("heart_rate")}
          iconColor="text-rose-500"
        />
        <MetricCard
          icon={Activity} label="SpO2" value={form.spo2}
          unit="%" fieldKey="spo2" onChange={set("spo2")}
          iconColor="text-sky-500"
        />
        <MetricCard
          icon={Thermometer} label="Nhiệt độ" value={form.temperature_c}
          unit="°C" fieldKey="temperature_c" onChange={set("temperature_c")}
          iconColor="text-purple-500"
        />
        <MetricCard
          icon={Wind} label="Nhịp thở" value={form.respiratory_rate}
          unit="l/ph" fieldKey="respiratory_rate" onChange={set("respiratory_rate")}
          iconColor="text-indigo-500"
        />
      </div>

      {/* Inline field warnings (below the grid) */}
      {Object.entries(fieldErrors).map(([k, err]) => {
        if (!err || (k === "bp_systolic" || k === "bp_diastolic")) return null;
        return (
          <div
            key={k}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
              err.type === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {err.message}
          </div>
        );
      })}

      {/* ── Thể trạng ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Thể Trạng</h3>
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Cân nặng (kg)</label>
              <input
                type="number" step="any" value={form.weight_kg} placeholder="—"
                onChange={(e) => set("weight_kg")(e.target.value)}
                className={`w-full rounded-xl border-2 px-3 py-3 text-lg font-semibold outline-none transition-colors focus:border-primary/60 ${
                  weightErr ? "border-destructive/60 bg-destructive/5" : "border-border bg-background"
                }`}
              />
              {weightErr && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" />{weightErr}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Chiều cao (cm)</label>
              <input
                type="number" step="any" value={form.height_cm} placeholder="—"
                onChange={(e) => set("height_cm")(e.target.value)}
                className={`w-full rounded-xl border-2 px-3 py-3 text-lg font-semibold outline-none transition-colors focus:border-primary/60 ${
                  heightErr ? "border-destructive/60 bg-destructive/5" : "border-border bg-background"
                }`}
              />
              {heightErr && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" />{heightErr}
                </p>
              )}
            </div>
          </div>

          {bmi !== null && (
            <div className="flex items-center gap-3 rounded-xl bg-sky-50 border border-sky-200 px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-sky-400 flex items-center justify-center shrink-0">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-600">Chỉ số BMI</p>
                <p className="text-base font-bold text-sky-700">
                  {bmi} <span className="font-normal text-sky-600">({bmiLabel})</span>
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            </div>
          )}
        </div>
      </section>

      {/* ── Ghi chú lâm sàng ─────────────────────────────────────────────── */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Ghi chú lâm sàng</h3>
        <textarea
          value={form.clinical_note}
          onChange={(e) => set("clinical_note")(e.target.value)}
          placeholder="Nhập quan sát bổ sung..."
          rows={3}
          className="w-full rounded-xl border bg-card px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-y"
        />
      </section>

      {/* ── Critical preview banner ───────────────────────────────────────── */}
      {(() => {
        const sys = parseNum(form.bp_systolic);
        const hr  = parseNum(form.heart_rate);
        const crit = (sys != null && sys > 200) || (hr != null && (hr < 40 || hr > 150));
        if (!crit) return null;
        return (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
            <Siren className="h-4 w-4 shrink-0" />
            Sinh hiệu CRITICAL — sẽ gửi thông báo khẩn đến Bác sĩ sau khi lưu
          </div>
        );
      })()}

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="space-y-2 pt-1">
        <Button
          className="w-full h-14 text-base font-semibold rounded-2xl"
          onClick={() => submit()}
          disabled={isPending || hasBlockingError}
        >
          {isPending ? "Đang lưu…" : "Lưu"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
