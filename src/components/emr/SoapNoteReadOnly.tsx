/**
 * Read-only SOAP Note view for completed (LOCKED) examinations
 * Used in patient records and doctor history views
 */

import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { MedicalExamination } from '@/types/emr';

type SoapNoteReadOnlyProps = {
  exam: MedicalExamination;
  showTimestamp?: boolean;
};

export default function SoapNoteReadOnly({ exam, showTimestamp = true }: SoapNoteReadOnlyProps) {
  const confirmedIcds = exam.icd_codes.filter((c) => c.confirm_status === 'CONFIRMED');

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 gap-1 text-xs">
            <Lock className="h-3 w-3" /> Đã ký duyệt
          </Badge>
          {exam.is_addendum && (
            <Badge variant="outline" className="text-xs">Phụ lục (Addendum)</Badge>
          )}
        </div>
        {showTimestamp && exam.updated_at && (
          <span className="text-xs text-muted-foreground">
            {format(parseISO(exam.updated_at), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
          </span>
        )}
      </div>

      {/* ICD Codes */}
      {confirmedIcds.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Chẩn đoán (ICD-10)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {confirmedIcds.map((icd) => (
              <span
                key={icd.id}
                className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                <Check className="h-2.5 w-2.5" />
                <span className="font-mono font-bold">{icd.icd_code}</span>
                <span>{icd.icd_name}</span>
                {icd.is_ai_suggested && (
                  <Sparkles className="h-2.5 w-2.5 text-amber-500" title="AI gợi ý" />
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* SOAP Sections */}
      {exam.s_text && (
        <SoapBlock
          label="S — Subjective"
          description="Triệu chứng chủ quan"
          content={exam.s_text}
        />
      )}
      {exam.o_text && (
        <SoapBlock
          label="O — Objective"
          description="Khám lâm sàng"
          content={exam.o_text}
        />
      )}
      {(exam.a_text || confirmedIcds.length > 0) && (
        <SoapBlock
          label="A — Assessment"
          description="Chẩn đoán"
          content={exam.a_text ?? ''}
        />
      )}
      {exam.p_text && (
        <SoapBlock
          label="P — Plan"
          description="Kế hoạch điều trị"
          content={exam.p_text}
        />
      )}
    </div>
  );
}

function SoapBlock({ label, description, content }: {
  label: string;
  description: string;
  content: string;
}) {
  if (!content) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold text-primary">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <Card className="border-border/50">
        <CardContent className="py-2.5 px-3">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        </CardContent>
      </Card>
    </div>
  );
}
