/**
 * FR-013: Questionnaire Assignment Panel
 * Allows doctors to assign clinical questionnaires within an examination
 */

import { useEffect, useState } from 'react';
import { ClipboardCheck, Loader2, Plus, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  assignQuestionnaire,
  getAssignmentsByAppointment,
  type QuestionnaireAssignmentWithResponse,
} from '@/lib/questionnaire-assignment-api';
import type { Questionnaire } from '@/types/questionnaire';

type QuestionnaireAssignPanelProps = {
  appointmentId: string;
  patientId: string;
};

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ điền', color: 'bg-amber-100 text-amber-700' },
  IN_PROGRESS: { label: 'Đang điền', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Đã nộp', color: 'bg-green-100 text-green-700' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-gray-100 text-gray-500' },
} as const;

export default function QuestionnaireAssignPanel({
  appointmentId, patientId,
}: QuestionnaireAssignPanelProps) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [assignments, setAssignments] = useState<QuestionnaireAssignmentWithResponse[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    void loadData();
  }, [appointmentId]);

  async function loadData() {
    setLoading(true);
    try {
      const [qData, aData] = await Promise.all([
        supabase
          .from('questionnaires')
          .select('*')
          .eq('status', 'ACTIVE')
          .order('name'),
        getAssignmentsByAppointment(appointmentId),
      ]);

      setQuestionnaires((qData.data ?? []) as Questionnaire[]);
      setAssignments(aData);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedId) return;
    const already = assignments.find((a) => a.questionnaire_id === selectedId);
    if (already) {
      toast.warning('Bộ câu hỏi này đã được giao cho bệnh nhân.');
      return;
    }

    setAssigning(true);
    try {
      await assignQuestionnaire({
        questionnaireId: selectedId,
        patientId,
        appointmentId,
      });
      toast.success('Đã giao bộ câu hỏi cho bệnh nhân');
      setSelectedId('');
      await loadData();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Assign new */}
      <div className="flex gap-2">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="flex-1 h-8 text-xs">
            <SelectValue placeholder="Chọn bộ câu hỏi..." />
          </SelectTrigger>
          <SelectContent>
            {questionnaires.map((q) => (
              <SelectItem key={q.id} value={q.id} className="text-xs">
                {q.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-8 text-xs"
          disabled={!selectedId || assigning}
          onClick={() => void handleAssign()}
        >
          {assigning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}
          Giao
        </Button>
      </div>

      {/* Current assignments */}
      {assignments.length > 0 ? (
        <div className="space-y-2">
          {assignments.map((a) => {
            const config = STATUS_CONFIG[a.status];
            return (
              <div
                key={a.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border/50 p-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {a.status === 'COMPLETED'
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      : <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                    <span className="text-xs font-medium truncate">{a.questionnaire_name}</span>
                  </div>
                  {a.status === 'COMPLETED' && a.total_score != null && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Điểm: <span className="font-semibold">{a.total_score}</span>
                      {a.score_label && ` — ${a.score_label}`}
                    </p>
                  )}
                </div>
                <Badge className={`text-[10px] ${config.color} shrink-0`}>
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          Chưa giao bộ câu hỏi nào cho lịch hẹn này.
        </p>
      )}
    </div>
  );
}
