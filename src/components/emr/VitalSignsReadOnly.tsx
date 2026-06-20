/**
 * Vital signs read-only display in EMR context
 * Shows the latest vital signs for the appointment
 */

import { useEffect, useState } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLatestVitalSigns } from '@/lib/vital-signs-api';
import type { VitalSignsRow } from '@/types/vital-signs';

type VitalSignsReadOnlyProps = {
  appointmentId: string;
};

const VITAL_DISPLAY = [
  { key: 'bp_systolic', label: 'HA Tâm thu', unit: 'mmHg', format: (v: unknown) => v },
  { key: 'bp_diastolic', label: 'HA Tâm trương', unit: 'mmHg', format: (v: unknown) => v },
  { key: 'heart_rate', label: 'Nhịp tim', unit: 'bpm', format: (v: unknown) => v },
  { key: 'temperature_c', label: 'Nhiệt độ', unit: '°C', format: (v: unknown) => v },
  { key: 'respiratory_rate', label: 'Nhịp thở', unit: 'l/ph', format: (v: unknown) => v },
  { key: 'spo2', label: 'SpO2', unit: '%', format: (v: unknown) => v },
  { key: 'weight_kg', label: 'Cân nặng', unit: 'kg', format: (v: unknown) => v },
  { key: 'height_cm', label: 'Chiều cao', unit: 'cm', format: (v: unknown) => v },
  { key: 'bmi', label: 'BMI', unit: '', format: (v: unknown) => v != null ? Number(v).toFixed(1) : null },
] as const;

export default function VitalSignsReadOnly({ appointmentId }: VitalSignsReadOnlyProps) {
  const [vitals, setVitals] = useState<VitalSignsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { vitals: v } = await getLatestVitalSigns(supabase, appointmentId);
        setVitals(v);
      } catch {
        setVitals(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Đang tải sinh hiệu...
      </div>
    );
  }

  if (!vitals) {
    return (
      <p className="text-xs text-muted-foreground py-1">
        Chưa có dữ liệu sinh hiệu cho lịch hẹn này.
      </p>
    );
  }

  const hasValues = VITAL_DISPLAY.some((d) => vitals[d.key] != null);
  if (!hasValues) {
    return (
      <p className="text-xs text-muted-foreground py-1">
        Chưa có dữ liệu sinh hiệu cho lịch hẹn này.
      </p>
    );
  }

  return (
    <div>
      {vitals.is_critical && (
        <div className="mb-2 flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700">
          <Activity className="h-3.5 w-3.5" />
          Chỉ số CRITICAL: {vitals.critical_flags.join(', ')}
        </div>
      )}
      <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
        {VITAL_DISPLAY.map((field) => {
          const value = vitals[field.key];
          if (value == null) return null;
          const displayVal = field.format(value);
          return (
            <div key={field.key} className="text-xs">
              <span className="text-muted-foreground">{field.label}: </span>
              <span className="font-semibold">
                {String(displayVal)}{field.unit ? ` ${field.unit}` : ''}
              </span>
            </div>
          );
        })}
      </div>
      {vitals.clinical_note && (
        <p className="mt-2 text-xs text-muted-foreground italic">
          Ghi chú: {vitals.clinical_note}
        </p>
      )}
    </div>
  );
}
