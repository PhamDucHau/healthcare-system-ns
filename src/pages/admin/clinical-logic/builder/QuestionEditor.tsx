import { Trash2, Plus } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { QuestionnaireQuestion, QuestionnaireSection, QuestionType } from "@/types/questionnaire";
import { QUESTION_TYPE_LABELS } from "@/types/questionnaire";
import { newId } from "./types";

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";
const CHOICE_TYPES: QuestionType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE"];

type Props = {
  question: QuestionnaireQuestion;
  allSections: QuestionnaireSection[];
  onChange: (q: QuestionnaireQuestion) => void;
  onRemove: () => void;
  disabled: boolean;
};

export default function QuestionEditor({ question, allSections, onChange, onRemove, disabled }: Props) {
  const isChoice = CHOICE_TYPES.includes(question.type);

  function patch(fields: Partial<QuestionnaireQuestion>) {
    onChange({ ...question, ...fields });
  }

  function patchConfig(fields: Record<string, unknown>) {
    onChange({ ...question, config: { ...question.config, ...fields } });
  }

  function addOption() {
    patch({ options: [...question.options, { id: newId(), label: "", score: 0 }] });
  }

  function removeOption(optionId: string) {
    patch({
      options: question.options.filter((o) => o.id !== optionId),
      skip_logic: question.skip_logic.filter((r) => r.if_option_id !== optionId),
    });
  }

  function addSkipRule() {
    if (question.options.length === 0) return;
    patch({
      skip_logic: [
        ...question.skip_logic,
        { if_option_id: question.options[0].id, action: "GOTO_QUESTION", target_id: "" },
      ],
    });
  }

  const otherQuestions = allSections.flatMap((s) => s.questions).filter((q) => q.id !== question.id);

  return (
    <div className="rounded-lg border bg-background p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex gap-3">
            <Select value={question.type} disabled={disabled} onValueChange={(v) => patch({ type: v as QuestionType })}>
              <SelectTrigger className="w-48 shrink-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              value={question.text}
              disabled={disabled}
              onChange={(e) => patch({ text: e.target.value })}
              placeholder="Nội dung câu hỏi"
              className={inputCls}
            />
          </div>

          {isChoice && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lựa chọn &amp; điểm số</p>
              {question.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    value={opt.label}
                    disabled={disabled}
                    onChange={(e) => patch({
                      options: question.options.map((o) => o.id === opt.id ? { ...o, label: e.target.value } : o),
                    })}
                    placeholder="Nhãn lựa chọn"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    value={opt.score ?? 0}
                    disabled={disabled}
                    onChange={(e) => patch({
                      options: question.options.map((o) => o.id === opt.id ? { ...o, score: Number(e.target.value) } : o),
                    })}
                    className={`${inputCls} w-24`}
                  />
                  <button type="button" disabled={disabled} onClick={() => removeOption(opt.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded disabled:opacity-40">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" disabled={disabled} onClick={addOption} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-40">
                <Plus className="h-3 w-3" /> Thêm lựa chọn
              </button>
            </div>
          )}

          {question.type === "SCALE" && (
            <div className="flex gap-3">
              <input type="number" disabled={disabled} value={(question.config.min as number) ?? 0}
                onChange={(e) => patchConfig({ min: Number(e.target.value) })} placeholder="Min" className={`${inputCls} w-28`} />
              <input type="number" disabled={disabled} value={(question.config.max as number) ?? 10}
                onChange={(e) => patchConfig({ max: Number(e.target.value) })} placeholder="Max" className={`${inputCls} w-28`} />
            </div>
          )}

          {question.type === "GRID_MATRIX" && (
            <div className="flex gap-3">
              <input disabled={disabled} value={(question.config.rows as string) ?? ""}
                onChange={(e) => patchConfig({ rows: e.target.value })} placeholder="Các hàng (phân cách bởi dấu phẩy)" className={inputCls} />
              <input disabled={disabled} value={(question.config.cols as string) ?? ""}
                onChange={(e) => patchConfig({ cols: e.target.value })} placeholder="Các cột (phân cách bởi dấu phẩy)" className={inputCls} />
            </div>
          )}

          {isChoice && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skip Logic</p>
              {question.skip_logic.map((rule, ri) => (
                <div key={ri} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Nếu chọn</span>
                  <Select disabled={disabled} value={rule.if_option_id} onValueChange={(v) => patch({
                    skip_logic: question.skip_logic.map((r, i) => i === ri ? { ...r, if_option_id: v } : r),
                  })}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Lựa chọn" /></SelectTrigger>
                    <SelectContent>
                      {question.options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label || "(chưa đặt tên)"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select disabled={disabled} value={rule.action} onValueChange={(v) => patch({
                    skip_logic: question.skip_logic.map((r, i) => i === ri ? { ...r, action: v as typeof r.action, target_id: "" } : r),
                  })}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GOTO_QUESTION">Chuyển đến câu hỏi</SelectItem>
                      <SelectItem value="SKIP_SECTION">Bỏ qua phần</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select disabled={disabled} value={rule.target_id} onValueChange={(v) => patch({
                    skip_logic: question.skip_logic.map((r, i) => i === ri ? { ...r, target_id: v } : r),
                  })}>
                    <SelectTrigger className="w-56"><SelectValue placeholder="Đích đến" /></SelectTrigger>
                    <SelectContent>
                      {rule.action === "GOTO_QUESTION"
                        ? otherQuestions.map((q) => <SelectItem key={q.id} value={q.id}>{q.text || "(câu hỏi chưa đặt tên)"}</SelectItem>)
                        : allSections.map((s) => <SelectItem key={s.id} value={s.id}>{s.title || "(phần chưa đặt tên)"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <button type="button" disabled={disabled} onClick={() => patch({
                    skip_logic: question.skip_logic.filter((_, i) => i !== ri),
                  })} className="p-1.5 text-destructive hover:bg-destructive/10 rounded disabled:opacity-40">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" disabled={disabled || question.options.length === 0} onClick={addSkipRule} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-40">
                <Plus className="h-3 w-3" /> Thêm quy tắc
              </button>
            </div>
          )}
        </div>

        <button type="button" disabled={disabled} onClick={onRemove} className="p-2 text-destructive hover:bg-destructive/10 rounded disabled:opacity-40 shrink-0">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
