import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Eye, Rocket, Save, Plus, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fetchQuestionCategories } from "@/lib/master-data-api";
import type { QuestionCategory } from "@/types/master-data";
import {
  fetchQuestionnaireById, createQuestionnaire, updateQuestionnaireMeta,
  saveQuestionnaireStructure, publishQuestionnaire, cloneQuestionnaire,
  hasResponses, mapQuestionnaireError,
} from "@/lib/questionnaire-api";
import type { InterventionRule, QuestionnaireSection, QuestionnaireStatus, ScoringConfig } from "@/types/questionnaire";
import { STATUS_LABELS } from "@/types/questionnaire";
import SectionEditor from "./builder/SectionEditor";
import ScoringPanel from "./builder/ScoringPanel";
import InterventionMatrixPanel from "./builder/InterventionMatrixPanel";
import PreviewDialog from "./builder/PreviewDialog";
import { blankSection } from "./builder/types";

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";

export default function QuestionnaireBuilderPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<QuestionnaireStatus>("DRAFT");
  const [version, setVersion] = useState(1);
  const [sections, setSections] = useState<QuestionnaireSection[]>([]);
  const [scoring, setScoring] = useState<ScoringConfig>({ formula: "" });
  const [interventionMatrix, setInterventionMatrix] = useState<InterventionRule[]>([]);
  const [blockedByResponses, setBlockedByResponses] = useState(false);

  const [currentId, setCurrentId] = useState<string | undefined>(id);

  useEffect(() => {
    fetchQuestionCategories().then(setCategories).catch((e: Error) => toast.error(e.message));
  }, []);

  useEffect(() => {
    if (!currentId) return;
    setLoading(true);
    Promise.all([fetchQuestionnaireById(currentId), hasResponses(currentId)])
      .then(([q, blocked]) => {
        setName(q.name);
        setCategoryId(q.category_id);
        setDescription(q.description ?? "");
        setStatus(q.status);
        setVersion(q.version);
        setSections(q.sections);
        setScoring(q.scoring_config.formula !== undefined ? q.scoring_config : { formula: "" });
        setInterventionMatrix(q.intervention_matrix);
        setBlockedByResponses(blocked);
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [currentId]);

  const disabled = blockedByResponses;

  function addSection() {
    setSections([...sections, blankSection(currentId ?? "")]);
  }

  async function handleSave(): Promise<string | null> {
    if (!name.trim()) { toast.error("Tên bộ câu hỏi không được để trống."); return null; }
    setSaving(true);
    try {
      let qid = currentId;
      if (!qid) {
        qid = await createQuestionnaire({ name, category_id: categoryId, description: description || null });
        setCurrentId(qid);
      } else {
        await updateQuestionnaireMeta(qid, {
          name, category_id: categoryId, description: description || null,
          intervention_matrix: interventionMatrix, scoring_config: scoring,
        });
      }
      await saveQuestionnaireStructure(qid, sections);
      toast.success("Đã lưu.");
      if (isNew) navigate(`/admin/clinical-logic/question-library/${qid}`, { replace: true });
      return qid;
    } catch (e) {
      toast.error(mapQuestionnaireError((e as Error).message));
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    const qid = await handleSave();
    if (!qid) return;
    setPublishing(true);
    try {
      await publishQuestionnaire(qid);
      setStatus("ACTIVE");
      toast.success("Đã kích hoạt bộ câu hỏi.");
    } catch (e) {
      toast.error(mapQuestionnaireError((e as Error).message));
    } finally {
      setPublishing(false);
    }
  }

  async function handleClone() {
    if (!currentId) return;
    setCloning(true);
    try {
      const newQid = await cloneQuestionnaire(currentId);
      toast.success("Đã tạo phiên bản mới (DRAFT).");
      navigate(`/admin/clinical-logic/question-library/${newQid}`);
    } catch (e) {
      toast.error(mapQuestionnaireError((e as Error).message));
    } finally {
      setCloning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Library / {name || "Bộ câu hỏi mới"}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
            {isNew && !currentId ? "Tạo bộ câu hỏi" : `Sửa bộ câu hỏi: ${name}`}
          </h1>
          {currentId && (
            <p className="text-xs text-muted-foreground mt-1">
              Trạng thái: <span className="font-semibold">{STATUS_LABELS[status]}</span> · Phiên bản v{version}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewOpen(true)} className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Lưu
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || disabled || status === "ACTIVE"}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} Publish
          </button>
        </div>
      </div>

      {blockedByResponses && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Bộ câu hỏi đã có phản hồi — không thể chỉnh sửa cấu trúc.
          </div>
          <button onClick={handleClone} disabled={cloning} className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
            {cloning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />} Clone phiên bản mới
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <input
              value={name}
              disabled={disabled}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên bộ câu hỏi (VD: PHQ-8)"
              className={`${inputCls} text-base font-semibold`}
            />
            <div className="flex gap-3">
              <Select value={categoryId ?? ""} disabled={disabled} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger className="w-56"><SelectValue placeholder="Chọn phân loại" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <textarea
              value={description}
              disabled={disabled}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          {sections.map((s) => (
            <SectionEditor
              key={s.id}
              section={s}
              allSections={sections}
              disabled={disabled}
              onChange={(updated) => setSections(sections.map((ss) => ss.id === updated.id ? updated : ss))}
              onRemove={() => setSections(sections.filter((ss) => ss.id !== s.id))}
            />
          ))}

          <button onClick={addSection} disabled={disabled} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline disabled:opacity-40">
            <Plus className="h-4 w-4" /> Thêm phần (Section)
          </button>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 self-start">
          <ScoringPanel scoring={scoring} onChange={setScoring} disabled={disabled} />
          <InterventionMatrixPanel rules={interventionMatrix} onChange={setInterventionMatrix} disabled={disabled} />
        </div>
      </div>

      <PreviewDialog open={previewOpen} onClose={() => setPreviewOpen(false)} name={name} sections={sections} />
    </div>
  );
}
