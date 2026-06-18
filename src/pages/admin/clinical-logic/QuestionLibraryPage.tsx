import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Pencil, Copy, Archive, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fetchQuestionnaires, cloneQuestionnaire, archiveQuestionnaire, mapQuestionnaireError } from "@/lib/questionnaire-api";
import type { Questionnaire, QuestionnaireStatus } from "@/types/questionnaire";
import { STATUS_LABELS } from "@/types/questionnaire";

function StatusBadge({ status }: { status: QuestionnaireStatus }) {
  const styles: Record<QuestionnaireStatus, string> = {
    DRAFT:    "bg-gray-100 text-gray-600",
    ACTIVE:   "bg-green-100 text-green-700",
    ARCHIVED: "bg-amber-100 text-amber-700",
  };
  const dot: Record<QuestionnaireStatus, string> = {
    DRAFT:    "bg-gray-400",
    ACTIVE:   "bg-green-500",
    ARCHIVED: "bg-amber-500",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function QuestionLibraryPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuestionnaireStatus | "ALL">("ALL");

  const reload = () => {
    setLoading(true);
    fetchQuestionnaires()
      .then(setRows)
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  async function handleClone(id: string) {
    try {
      const newId = await cloneQuestionnaire(id);
      toast.success("Đã tạo phiên bản mới (DRAFT).");
      navigate(`/admin/clinical-logic/question-library/${newId}`);
    } catch (e) {
      toast.error(mapQuestionnaireError((e as Error).message));
    }
  }

  async function handleArchive(id: string) {
    try {
      await archiveQuestionnaire(id);
      toast.success("Đã lưu trữ bộ câu hỏi.");
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bộ câu hỏi lâm sàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý và cập nhật các bộ câu hỏi đánh giá lâm sàng dành cho bệnh nhân.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/clinical-logic/question-library/new")}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Tạo mới
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tên bộ câu hỏi..."
            className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as QuestionnaireStatus | "ALL")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="DRAFT">Bản nháp</SelectItem>
            <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
            <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          Chưa có bộ câu hỏi nào.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tên bộ câu hỏi</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phân loại</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phiên bản</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{r.name}</p>
                      {r.description && <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.category_name ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-sm">v{r.version}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          title="Sửa"
                          onClick={() => navigate(`/admin/clinical-logic/question-library/${r.id}`)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                        <button
                          title="Clone version mới"
                          onClick={() => handleClone(r.id)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Clone
                        </button>
                        {r.status !== "ARCHIVED" && (
                          <button
                            title="Lưu trữ"
                            onClick={() => handleArchive(r.id)}
                            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            Lưu trữ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
