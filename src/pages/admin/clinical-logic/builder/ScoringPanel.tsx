import { Sigma } from "lucide-react";
import type { ScoringConfig } from "@/types/questionnaire";

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";

type Props = {
  scoring: ScoringConfig;
  onChange: (s: ScoringConfig) => void;
  disabled: boolean;
};

export default function ScoringPanel({ scoring, onChange, disabled }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sigma className="h-4 w-4 text-primary" />
        <p className="text-sm font-bold">Scoring Module</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Công thức tính điểm</label>
        <input
          value={scoring.formula}
          disabled={disabled}
          onChange={(e) => onChange({ ...scoring, formula: e.target.value })}
          placeholder="VD: sum(Q1..Q8)"
          className={`${inputCls} font-mono`}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Loại kết quả</label>
          <input
            value={scoring.result_type ?? ""}
            disabled={disabled}
            onChange={(e) => onChange({ ...scoring, result_type: e.target.value })}
            placeholder="Số nguyên"
            className={inputCls}
          />
        </div>
        <div className="w-20">
          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Min</label>
          <input type="number" disabled={disabled} value={scoring.min ?? 0}
            onChange={(e) => onChange({ ...scoring, min: Number(e.target.value) })} className={inputCls} />
        </div>
        <div className="w-20">
          <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Max</label>
          <input type="number" disabled={disabled} value={scoring.max ?? 0}
            onChange={(e) => onChange({ ...scoring, max: Number(e.target.value) })} className={inputCls} />
        </div>
      </div>
    </div>
  );
}
