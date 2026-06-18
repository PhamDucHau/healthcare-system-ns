import { Trash2, Plus } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { QuestionnaireSection, SectionRole } from "@/types/questionnaire";
import { SECTION_ROLE_LABELS } from "@/types/questionnaire";
import QuestionEditor from "./QuestionEditor";
import { blankQuestion } from "./types";

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";

type Props = {
  section: QuestionnaireSection;
  allSections: QuestionnaireSection[];
  onChange: (s: QuestionnaireSection) => void;
  onRemove: () => void;
  disabled: boolean;
};

export default function SectionEditor({ section, allSections, onChange, onRemove, disabled }: Props) {
  function patch(fields: Partial<QuestionnaireSection>) {
    onChange({ ...section, ...fields });
  }

  function addQuestion() {
    patch({ questions: [...section.questions, blankQuestion(section.id)] });
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={section.title}
          disabled={disabled}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Tiêu đề phần (VD: Section A: Patient Self-Report)"
          className={`${inputCls} flex-1`}
        />
        <input
          value={section.key}
          disabled={disabled}
          onChange={(e) => patch({ key: e.target.value })}
          placeholder="Internal ID (VD: PHQ8_SEC_A)"
          className={`${inputCls} sm:w-56`}
        />
        <Select value={section.role} disabled={disabled} onValueChange={(v) => patch({ role: v as SectionRole })}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(SECTION_ROLE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button type="button" disabled={disabled} onClick={onRemove} className="p-2 text-destructive hover:bg-destructive/10 rounded disabled:opacity-40">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {section.questions.map((q) => (
          <QuestionEditor
            key={q.id}
            question={q}
            allSections={allSections}
            disabled={disabled}
            onChange={(updated) => patch({ questions: section.questions.map((qq) => qq.id === updated.id ? updated : qq) })}
            onRemove={() => patch({ questions: section.questions.filter((qq) => qq.id !== q.id) })}
          />
        ))}
      </div>

      <button type="button" disabled={disabled} onClick={addQuestion} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline disabled:opacity-40">
        <Plus className="h-4 w-4" /> Thêm câu hỏi
      </button>
    </div>
  );
}
