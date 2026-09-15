import { useEffect, useState } from 'react';
import { Loader2, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { SoapChangedField } from '@/lib/exam-activity-log';
import { getExaminationById } from '@/lib/emr-api';
import { EXAM_STATUS_LABELS } from '@/types/emr';
import type { MedicalExamination } from '@/types/emr';

type Props = {
  examId: string | null;
  patientName?: string | null;
  changedFields?: SoapChangedField[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ExamSoapDetailDialog({
  examId,
  patientName,
  changedFields = [],
  open,
  onOpenChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<MedicalExamination | null>(null);

  useEffect(() => {
    if (!open || !examId) {
      setExam(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getExaminationById(examId)
      .then((row) => {
        if (!cancelled) setExam(row);
      })
      .catch(() => {
        if (!cancelled) setExam(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, examId]);

  const confirmedIcds = exam?.icd_codes.filter((c) => c.confirm_status === 'CONFIRMED') ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Chi tiết hồ sơ SOAP{patientName ? ` — ${patientName}` : ''}
          </DialogTitle>
          <DialogDescription>
            Nội dung SOAP (S/O/A/P) của hồ sơ khám bệnh.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !exam ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Không tìm thấy hồ sơ SOAP.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">
                {EXAM_STATUS_LABELS[exam.status] ?? exam.status}
              </Badge>
            </div>

            {confirmedIcds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {confirmedIcds.map((icd) => (
                  <span
                    key={icd.id}
                    className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-800"
                  >
                    <span className="font-mono font-bold mr-1">{icd.icd_code}</span>
                    {icd.icd_name}
                  </span>
                ))}
              </div>
            )}

            <SoapBlock
              field="s_text"
              label="S — Subjective"
              description="Lời khai bệnh nhân"
              content={exam.s_text}
              changed={changedFields.includes('s_text')}
            />
            <SoapBlock
              field="o_text"
              label="O — Objective"
              description="Kết quả khám thực thể"
              content={exam.o_text}
              changed={changedFields.includes('o_text')}
            />
            <SoapBlock
              field="a_text"
              label="A — Assessment"
              description="Chẩn đoán lâm sàng"
              content={exam.a_text}
              changed={changedFields.includes('a_text')}
            />
            <SoapBlock
              field="p_text"
              label="P — Plan"
              description="Kế hoạch điều trị"
              content={exam.p_text}
              changed={changedFields.includes('p_text')}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SoapBlock({
  field,
  label,
  description,
  content,
  changed,
}: {
  field: SoapChangedField;
  label: string;
  description: string;
  content: string | null;
  changed: boolean;
}) {
  return (
    <div
      data-testid={`soap-block-${field}`}
      data-changed={changed ? 'true' : 'false'}
      className="space-y-1"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold text-primary">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
        {changed && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
            Đã sửa
          </span>
        )}
      </div>
      <Card className={changed ? 'border-amber-400 bg-amber-50/80 shadow-sm' : 'border-border/50'}>
        <CardContent className="py-2.5 px-3">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {content?.trim() ? content : '—'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
