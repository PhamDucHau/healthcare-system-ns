import { useCallback, useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FilePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createExamAddendum, listExamAddenda } from '@/lib/emr-api';
import { EXAM_STATUS_LABELS } from '@/types/emr';
import type { MedicalExamination } from '@/types/emr';

type ExamAddendumFormProps = {
  examId: string;
  onCreated?: () => void;
};

export default function ExamAddendumForm({ examId, onCreated }: ExamAddendumFormProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [addenda, setAddenda] = useState<MedicalExamination[]>([]);

  const loadAddenda = useCallback(async () => {
    try {
      setAddenda(await listExamAddenda(examId));
    } catch {
      setAddenda([]);
    }
  }, [examId]);

  useEffect(() => {
    void loadAddenda();
  }, [loadAddenda]);

  const canSave = reason.trim().length > 0 && content.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await createExamAddendum(examId, {
        s_text: content.trim(),
        reason: reason.trim(),
      });
      setOpen(false);
      setReason('');
      setContent('');
      toast.success('Đã tạo phiếu bổ sung.');
      await loadAddenda();
      onCreated?.();
    } catch (e) {
      toast.error((e as Error).message || 'Không tạo được phiếu bổ sung.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
        <FilePlus className="h-3 w-3 mr-1" /> Tạo phiếu bổ sung
      </Button>
      {open && (
        <div className="space-y-2 border rounded-xl p-3 bg-muted/30">
          <p className="text-xs font-semibold">Phiếu bổ sung (hồ sơ gốc không đổi)</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do xác nhận / hiệu chỉnh..."
            rows={2}
            className="text-sm"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung bổ sung / hiệu chỉnh..."
            rows={3}
            className="text-sm"
          />
          <Button size="sm" disabled={saving || !canSave} onClick={() => void handleSave()}>
            {saving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            Lưu phiếu bổ sung
          </Button>
        </div>
      )}

      {addenda.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Phiếu bổ sung đã tạo
          </p>
          {addenda.map((row, index) => (
            <div key={row.id} className="rounded-xl border bg-card p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium">
                  Phiếu {index + 1}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {EXAM_STATUS_LABELS[row.status] ?? row.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(row.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </span>
                </div>
              </div>
              {row.amendment_reason && (
                <p className="text-xs text-muted-foreground">
                  Lý do: <span className="text-foreground">{row.amendment_reason}</span>
                </p>
              )}
              {row.s_text && (
                <p className="text-sm whitespace-pre-wrap">{row.s_text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
