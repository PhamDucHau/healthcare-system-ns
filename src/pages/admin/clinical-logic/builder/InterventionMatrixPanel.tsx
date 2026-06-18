import { ListChecks, Plus, Trash2 } from "lucide-react";
import type { InterventionRule } from "@/types/questionnaire";

const inputCls = "w-full rounded-lg border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";

type Props = {
  rules: InterventionRule[];
  onChange: (rules: InterventionRule[]) => void;
  disabled: boolean;
};

export default function InterventionMatrixPanel({ rules, onChange, disabled }: Props) {
  function addRule() {
    onChange([...rules, { condition: "", label: "", action: "" }]);
  }

  function updateRule(i: number, fields: Partial<InterventionRule>) {
    onChange(rules.map((r, idx) => idx === i ? { ...r, ...fields } : r));
  }

  function removeRule(i: number) {
    onChange(rules.filter((_, idx) => idx !== i));
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold">Intervention Matrix</p>
        </div>
        <button type="button" disabled={disabled} onClick={addRule} className="p-1 text-primary hover:bg-primary/10 rounded disabled:opacity-40">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {rules.length === 0 && (
          <p className="text-xs text-muted-foreground">Chưa có quy tắc can thiệp.</p>
        )}
        {rules.map((rule, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <input
                value={rule.label}
                disabled={disabled}
                onChange={(e) => updateRule(i, { label: e.target.value })}
                placeholder="Nhãn (VD: critical, moderate)"
                className={`${inputCls} font-semibold uppercase tracking-wider w-40`}
              />
              <button type="button" disabled={disabled} onClick={() => removeRule(i)} className="p-1 text-destructive hover:bg-destructive/10 rounded disabled:opacity-40">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              value={rule.condition}
              disabled={disabled}
              onChange={(e) => updateRule(i, { condition: e.target.value })}
              placeholder="Điều kiện (VD: PHQ_8 >= 10 AND func_level >= 2)"
              className={`${inputCls} font-mono`}
            />
            <input
              value={rule.action}
              disabled={disabled}
              onChange={(e) => updateRule(i, { action: e.target.value })}
              placeholder="Hành động (VD: Refer to psychiatry)"
              className={inputCls}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
