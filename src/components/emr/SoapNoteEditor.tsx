/**
 * FR-010: SOAP Note Editor — Main EMR component for doctors
 * Multi-panel layout: Patient info + SOAP form + ICD panel + Voice Assistant
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Activity, AlertTriangle, Check, ChevronDown, ChevronUp,
  ClipboardList, Loader2, Lock, Save, Sparkles, X,
  Mic, StopCircle, Brain, Heart, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useSoapNoteEditor } from '@/hooks/useSoapNoteEditor';
import type { SoapIcdCode, AiIcdSuggestion } from '@/types/emr';
import IcdSearchPanel from './IcdSearchPanel';
import DoctorSignOffDialog from './DoctorSignOffDialog';
import SetupPinDialog from './SetupPinDialog';
import VitalSignsReadOnly from './VitalSignsReadOnly';
import PreConsultationReadOnly from './PreConsultationReadOnly';
import QuestionnaireAssignPanel from './QuestionnaireAssignPanel';

type PatientInfo = {
  name: string;
  age?: string | number;
  gender?: string;
  phone?: string;
};

type SoapNoteEditorProps = {
  appointmentId: string;
  patient?: PatientInfo;
};

export default function SoapNoteEditor({ appointmentId, patient }: SoapNoteEditorProps) {
  const editor = useSoapNoteEditor(appointmentId);
  const [showSignOff, setShowSignOff] = useState(false);
  const [showSetupPin, setShowSetupPin] = useState(false);
  const [sectionExpanded, setSectionExpanded] = useState({
    vitals: true,
    preConsult: false,
    history: false,
    questionnaires: false,
  });

  if (editor.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (editor.error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{editor.error}</AlertDescription>
      </Alert>
    );
  }

  const confirmedIcds = editor.exam?.icd_codes.filter((c) => c.confirm_status === 'CONFIRMED') ?? [];
  const pendingIcds = editor.exam?.icd_codes.filter((c) => c.confirm_status === 'PENDING') ?? [];

  return (
    <div className="flex flex-col h-full bg-slate-50/40">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-card flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-tight">
              {patient?.name ?? 'Bệnh nhân'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {patient?.age && `${patient.age} tuổi`}
              {patient?.age && patient?.gender && ' · '}
              {patient?.gender}
              {patient?.phone && ` · ${patient.phone}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editor.autoSavedAt && !editor.isLocked && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Tự lưu {formatDistanceToNow(editor.autoSavedAt, { locale: vi, addSuffix: true })}
            </span>
          )}

          {editor.isLocked ? (
            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 gap-1">
              <Lock className="h-3 w-3" /> Đã ký số bảo mật
            </Badge>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void editor.saveDraft()}
                disabled={editor.saving || editor.submitting || editor.isRecording || editor.isTranscribing}
                className="h-9 px-3 text-slate-600 hover:bg-slate-100/60"
              >
                {editor.saving
                  ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  : <Save className="h-4 w-4 mr-1.5" />}
                Lưu nháp
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!editor.hasPinSet) {
                    setShowSetupPin(true);
                  } else {
                    setShowSignOff(true);
                  }
                }}
                disabled={editor.submitting || editor.isRecording || editor.isTranscribing}
                className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
              >
                {editor.submitting
                  ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  : <Check className="h-4 w-4 mr-1.5" />}
                Hoàn tất & Ký duyệt
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Main content: SOAP + sidebar ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: SOAP editor */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Patient Risk Score Card (FR-025) */}
          {editor.riskAssessment && (
            <Card className="border-primary/10 overflow-hidden shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/5 to-transparent py-3.5 px-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary animate-pulse" />
                  <CardTitle className="text-sm font-bold text-slate-700">Đánh giá rủi ro lâm sàng (AI Risk Assessment)</CardTitle>
                </div>
                {!editor.isLocked && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => void editor.recalcRisk()}
                    disabled={editor.riskLoading}
                    className="h-7 text-xs font-medium text-primary hover:bg-primary/10 px-2.5 rounded-md gap-1"
                  >
                    {editor.riskLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    Tính toán lại
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4 grid md:grid-cols-3 gap-4">
                <div className="flex flex-col justify-center items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-muted-foreground font-medium">Điểm rủi ro tổng hợp</span>
                  <div className="flex items-baseline mt-1.5 gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-800">{editor.riskAssessment.risk_score}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <div className="mt-2.5">
                    {editor.riskAssessment.risk_level === 'HIGH' && (
                      <Badge className="bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold px-3 py-0.5 animate-pulse">
                        NGUY CƠ CAO (HIGH)
                      </Badge>
                    )}
                    {editor.riskAssessment.risk_level === 'MODERATE' && (
                      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100 font-bold px-3 py-0.5">
                        TRUNG BÌNH (MODERATE)
                      </Badge>
                    )}
                    {editor.riskAssessment.risk_level === 'LOW' && (
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold px-3 py-0.5">
                        NGUY CƠ THẤP (LOW)
                      </Badge>
                    )}
                  </div>
                  {editor.riskAssessment.override_applied && (
                    <span className="text-[10px] font-semibold text-rose-600 mt-2 text-center bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      🚨 Override Sinh Hiệu Khẩn Cấp
                    </span>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700">Yếu tố cấu thành rủi ro:</span>
                    <div className="space-y-2 mt-1.5">
                      {editor.riskAssessment.risk_factors.map((f, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium text-slate-600">
                            <span className="truncate">{f.factor}</span>
                            <span>+{f.contribution_pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                editor.riskAssessment?.risk_level === 'HIGH'
                                  ? 'bg-rose-500'
                                  : editor.riskAssessment?.risk_level === 'MODERATE'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${f.contribution_pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {editor.riskAssessment.risk_factors.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">Không phát hiện yếu tố bất thường nghiêm trọng.</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700">Đề xuất can thiệp:</span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed bg-primary/5 p-2 rounded-lg border border-primary/5 font-medium">
                      {editor.riskAssessment.recommendation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Context panels (vitals, pre-consult) */}
          <ExpandableSection
            title="Sinh hiệu"
            icon={<Activity className="h-4 w-4 text-primary" />}
            expanded={sectionExpanded.vitals}
            onToggle={() => setSectionExpanded((p) => ({ ...p, vitals: !p.vitals }))}
          >
            <VitalSignsReadOnly appointmentId={appointmentId} />
          </ExpandableSection>

          <ExpandableSection
            title="Khai báo y tế trước khám"
            icon={<ClipboardList className="h-4 w-4 text-primary" />}
            expanded={sectionExpanded.preConsult}
            onToggle={() => setSectionExpanded((p) => ({ ...p, preConsult: !p.preConsult }))}
          >
            <PreConsultationReadOnly appointmentId={appointmentId} />
          </ExpandableSection>

          <ExpandableSection
            title="Bộ câu hỏi lâm sàng"
            icon={<ClipboardList className="h-4 w-4 text-primary" />}
            expanded={sectionExpanded.questionnaires}
            onToggle={() => setSectionExpanded((p) => ({ ...p, questionnaires: !p.questionnaires }))}
          >
            {editor.exam && (
              <QuestionnaireAssignPanel
                appointmentId={appointmentId}
                patientId={editor.exam.patient_id}
              />
            )}
          </ExpandableSection>

          <Separator className="my-6 bg-slate-200" />

          {/* SOAP sections */}
          <SoapSection
            label="S — Subjective"
            description="Lời khai bệnh nhân: triệu chứng, bệnh sử, lý do"
            required
            value={editor.formData.s_text}
            onChange={(v) => editor.updateField('s_text', v)}
            locked={editor.isLocked}
            isAiSuggested={editor.soapSourceBadge.s_text}
            placeholder="Ví dụ: BN nam 35 tuổi, đau họng 3 ngày, sốt 38.5°C, ho khan không đờm, không khó thở..."
          />

          <SoapSection
            label="O — Objective"
            description="Kết quả khám thực thể, sinh hiệu"
            value={editor.formData.o_text}
            onChange={(v) => editor.updateField('o_text', v)}
            locked={editor.isLocked}
            isAiSuggested={editor.soapSourceBadge.o_text}
            placeholder="Ví dụ: Họng sung đỏ, amidan độ II. Phổi trong, không ran. HA 120/80, mạch 88..."
          />

          <SoapSection
            label="A — Assessment"
            description="Chẩn đoán lâm sàng tự do (ICD-10 chọn bên phải)"
            value={editor.formData.a_text}
            onChange={(v) => editor.updateField('a_text', v)}
            locked={editor.isLocked}
            isAiSuggested={editor.soapSourceBadge.a_text}
            placeholder="Mô tả chẩn đoán bổ sung, tóm tắt lâm sàng..."
            rows={3}
          />

          {/* Confirmed ICD codes display */}
          {confirmedIcds.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chẩn đoán mã bệnh ICD-10 đã xác nhận</span>
              <div className="flex flex-wrap gap-2">
                {confirmedIcds.map((icd) => (
                  <ConfirmedIcdBadge
                    key={icd.id}
                    icd={icd}
                    onRemove={editor.isLocked ? undefined : () => void editor.removeIcd(icd)}
                  />
                ))}
              </div>
            </div>
          )}

          <SoapSection
            label="P — Plan"
            description="Kế hoạch điều trị: hướng xử trí, kê đơn thuốc, chế độ sinh hoạt, tái khám"
            value={editor.formData.p_text}
            onChange={(v) => editor.updateField('p_text', v)}
            locked={editor.isLocked}
            isAiSuggested={editor.soapSourceBadge.p_text}
            placeholder="Ví dụ: 1. Amoxicillin 500mg x 2v/ngày x 5 ngày. 2. Paracetamol 500mg khi sốt. 3. Tái khám sau 1 tuần nếu không giảm..."
            rows={5}
          />
        </div>

        {/* Right: Assistant & ICD panel */}
        {!editor.isLocked && (
          <div className="w-80 border-l flex flex-col overflow-hidden bg-card flex-shrink-0 shadow-sm">
            <Tabs defaultValue="voice" className="flex flex-col h-full">
              <div className="border-b px-3 pt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="voice" className="flex-1 text-xs">
                    <Mic className="h-3.5 w-3.5 mr-1 text-red-500" />
                    Trợ lý EMR
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex-1 text-xs">
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    AI Gợi ý
                    {pendingIcds.length > 0 && (
                      <span className="ml-1 bg-amber-100 text-amber-700 text-[10px] px-1.5 rounded-full font-bold">
                        {pendingIcds.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="search" className="flex-1 text-xs">Tìm ICD</TabsTrigger>
                </TabsList>
              </div>

              {/* Tab 1: Voice Recording Assistant */}
              <TabsContent value="voice" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0 flex flex-col">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200/80 rounded-xl p-3">
                    <Checkbox
                      id="consent"
                      checked={editor.recordingConsent}
                      onCheckedChange={(checked) => editor.setRecordingConsent(!!checked)}
                      disabled={editor.isRecording}
                      className="mt-0.5 border-amber-400 text-amber-600 focus-visible:ring-amber-500"
                    />
                    <label htmlFor="consent" className="text-xs text-amber-800 font-medium leading-relaxed cursor-pointer select-none">
                      <strong>Cam kết đồng ý:</strong> Bác sĩ xác nhận đã thông báo và nhận được sự đồng ý của bệnh nhân trước khi ghi âm cuộc khám bệnh.
                    </label>
                  </div>

                  {!editor.isRecording ? (
                    <Button
                      onClick={() => void editor.startRecording()}
                      disabled={editor.isTranscribing || editor.isGeneratingSoap}
                      className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl gap-2 shadow-sm transition-all"
                    >
                      <Mic className="h-5 w-5" /> Bắt đầu ghi âm phiên khám
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
                          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Đang ghi âm...</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-red-700">
                          {Math.floor(editor.recordingDuration / 60)
                            .toString()
                            .padStart(2, '0')}
                          :{(editor.recordingDuration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <Button
                        onClick={() => void editor.stopRecording()}
                        className="w-full h-11 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl gap-2 shadow-sm"
                      >
                        <StopCircle className="h-5 w-5" /> Dừng & Tự động tạo SOAP
                      </Button>
                    </div>
                  )}

                  {editor.isTranscribing && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      Đang chuyển giọng nói → transcript và phân tích NLP...
                    </div>
                  )}

                  {editor.nlpAnalysis?.red_flags && editor.nlpAnalysis.red_flags.length > 0 && (
                    <Alert variant="destructive" className="py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs space-y-1">
                        <strong>Dấu hiệu cảnh báo ({editor.nlpAnalysis.red_flags.length}):</strong>
                        <ul className="list-disc pl-4 mt-1">
                          {editor.nlpAnalysis.red_flags.map((flag, i) => (
                            <li key={i}>{flag.text}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {editor.transcript.length > 0 && (
                  <div className="flex-1 flex flex-col space-y-2.5 min-h-[250px] overflow-hidden">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hội thoại phiên khám (Streaming Transcript)</span>
                    <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-3 space-y-3.5 scrollbar-thin text-xs">
                      {editor.transcript.map((line, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className={`text-[10px] font-bold ${line.speaker === 'doctor' ? 'text-primary' : 'text-slate-600'}`}>
                            {line.speaker === 'doctor' ? '🩺 BÁC SĨ' : '🧑 BỆNH NHÂN'}
                          </span>
                          <p className={`p-2.5 rounded-2xl max-w-[90%] leading-relaxed ${
                            line.speaker === 'doctor' 
                              ? 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tl-none' 
                              : 'bg-white text-slate-800 border border-slate-200/60 rounded-tr-none shadow-sm'
                          }`}>
                            {line.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    {!editor.isRecording && (
                      <Button
                        onClick={() => void editor.generateSoap()}
                        disabled={editor.isGeneratingSoap || editor.isTranscribing}
                        variant="outline"
                        className="w-full h-10 border-primary/20 text-primary font-bold hover:bg-primary/5 rounded-xl gap-1.5 shadow-sm mt-2"
                      >
                        {editor.isGeneratingSoap ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-amber-500" />
                        )}
                        Tạo lại SOAP bằng AI LLM
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Tab 2: AI ICD Suggestions */}
              <TabsContent value="ai" className="flex-1 overflow-y-auto p-3 space-y-2 mt-0">
                <AiIcdPanel
                  suggestions={editor.aiSuggestions}
                  existingIcds={editor.exam?.icd_codes ?? []}
                  loading={editor.aiLoading}
                  onConfirm={(s) => void editor.addIcdCode(s.icd_code, s.icd_name)}
                  onConfirmExisting={(icd) => void editor.confirmIcd(icd)}
                  onReject={(icd) => void editor.rejectIcd(icd)}
                />
              </TabsContent>

              {/* Tab 3: Search ICD database */}
              <TabsContent value="search" className="flex-1 overflow-y-auto p-3 mt-0">
                <IcdSearchPanel
                  search={editor.icdSearch}
                  results={editor.icdSearchResults}
                  loading={editor.icdSearchLoading}
                  existingCodes={editor.exam?.icd_codes.map((c) => c.icd_code) ?? []}
                  onSearch={editor.setIcdSearch}
                  onAdd={(code, name) => void editor.addIcdCode(code, name, true)}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DoctorSignOffDialog
        open={showSignOff}
        onClose={() => setShowSignOff(false)}
        onSign={async (pin, ack) => {
          const ok = await editor.sign({ pin, responsibilityAck: ack });
          if (ok) setShowSignOff(false);
          return ok;
        }}
        confirmedIcds={confirmedIcds}
        exam={editor.exam}
      />

      <SetupPinDialog
        open={showSetupPin}
        onClose={() => setShowSetupPin(false)}
        onSetup={async (pin) => {
          const ok = await editor.setupPin(pin);
          if (ok) {
            setShowSetupPin(false);
            setShowSignOff(true);
          }
          return ok;
        }}
      />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExpandableSection({
  title, icon, expanded, onToggle, children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200/80 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors rounded-t-xl bg-slate-50/30"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-bold text-slate-700">{title}</span>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <CardContent className="pt-0 pb-4 px-4 border-t border-slate-100">
          <div className="pt-3">{children}</div>
        </CardContent>
      )}
    </Card>
  );
}

function SoapSection({
  label, description, required, value, onChange, locked, isAiSuggested, placeholder, rows = 4,
}: {
  label: string;
  description: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
  isAiSuggested?: boolean;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-extrabold text-primary uppercase tracking-wide">{label}</span>
          {required && <span className="text-xs text-red-500">*</span>}
          <span className="text-xs text-muted-foreground hidden md:inline">{description}</span>
        </div>
        {isAiSuggested && !locked && (
          <Badge className="bg-purple-100 hover:bg-purple-100 text-purple-700 border border-purple-200 gap-1 text-[10px] font-bold px-2 py-0.5">
            <Sparkles className="h-2.5 w-2.5" /> Sinh bởi AI
          </Badge>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={locked ? '—' : placeholder}
        rows={rows}
        disabled={locked}
        className={`resize-none text-sm leading-relaxed border-slate-200 focus-visible:ring-primary ${
          locked 
            ? 'bg-slate-100/60 cursor-default border-slate-200/50 text-slate-700' 
            : isAiSuggested 
            ? 'bg-purple-50/20 border-purple-200/60 focus-visible:ring-purple-400' 
            : ''
        }`}
      />
    </div>
  );
}

function ConfirmedIcdBadge({
  icd, onRemove,
}: {
  icd: SoapIcdCode;
  onRemove?: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm transition-all">
      <Check className="h-3 w-3" />
      <span className="font-mono font-bold text-[11px] bg-emerald-100/80 px-1.5 py-0.5 rounded-md">{icd.icd_code}</span>
      <span className="max-w-[180px] truncate">{icd.icd_name}</span>
      {icd.is_ai_suggested && (
        <span title="Được gợi ý bởi AI" className="p-0.5 rounded bg-amber-100/50 border border-amber-200/40">
          <Sparkles className="h-3 w-3 text-amber-500" />
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 text-emerald-600/70 hover:text-rose-600 transition-colors"
          title="Xóa chẩn đoán"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function AiIcdPanel({
  suggestions, existingIcds, loading, onConfirm, onConfirmExisting, onReject,
}: {
  suggestions: AiIcdSuggestion[];
  existingIcds: SoapIcdCode[];
  loading: boolean;
  onConfirm: (s: AiIcdSuggestion) => void;
  onConfirmExisting: (icd: SoapIcdCode) => void;
  onReject: (icd: SoapIcdCode) => void;
}) {
  const pendingExisting = existingIcds.filter((c) => c.confirm_status === 'PENDING');
  const rejectedExisting = existingIcds.filter((c) => c.confirm_status === 'REJECTED');

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground py-10 justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        AI đang phân tích triệu chứng...
      </div>
    );
  }

  if (suggestions.length === 0 && pendingExisting.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center px-4 space-y-2">
        <Brain className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Nhập nội dung vào phần S và O hoặc sử dụng trợ lý ghi âm để AI tự động phân tích gợi ý chẩn đoán.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Pending existing (added but not confirmed) */}
      {pendingExisting.map((icd) => (
        <IcdSuggestionCard
          key={icd.id}
          code={icd.icd_code}
          name={icd.icd_name}
          confidence={icd.ai_confidence}
          reason={icd.ai_reason}
          onConfirm={() => onConfirmExisting(icd)}
          onReject={() => onReject(icd)}
        />
      ))}

      {/* New AI suggestions not yet added */}
      {suggestions
        .filter((s) => !existingIcds.some((e) => e.icd_code === s.icd_code))
        .map((s) => (
          <IcdSuggestionCard
            key={s.icd_code}
            code={s.icd_code}
            name={s.icd_name}
            confidence={s.confidence}
            reason={s.reason}
            onConfirm={() => onConfirm(s)}
          />
        ))}

      {rejectedExisting.length > 0 && (
        <p className="text-[10px] text-slate-400 text-center font-medium pt-1">
          Đã bỏ qua {rejectedExisting.length} gợi ý của AI
        </p>
      )}
    </div>
  );
}

function IcdSuggestionCard({
  code, name, confidence, reason, onConfirm, onReject,
}: {
  code: string;
  name: string;
  confidence?: number | null;
  reason?: string | null;
  onConfirm: () => void;
  onReject?: () => void;
}) {
  const confValue = confidence ?? 0;
  const confColor =
    confValue >= 80 ? 'bg-emerald-500' : confValue >= 60 ? 'bg-amber-500' : 'bg-slate-400';

  return (
    <Card className="border-slate-200/80 shadow-sm overflow-hidden hover:border-slate-300 transition-colors">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{code}</span>
            <p className="text-xs font-bold leading-tight mt-1.5 text-slate-800">{name}</p>
          </div>
          {confidence != null && (
            <span className="shrink-0 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">{confidence}%</span>
          )}
        </div>

        {confidence != null && (
          <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${confColor}`} style={{ width: `${confidence}%` }} />
          </div>
        )}

        {reason && (
          <p className="text-[10px] text-slate-500 leading-snug bg-slate-50 p-2 rounded-lg border border-slate-100/50">{reason}</p>
        )}

        <div className="flex gap-1.5 pt-0.5">
          <Button size="sm" className="h-7.5 text-xs flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-semibold" onClick={onConfirm}>
            <Check className="h-3 w-3 mr-1" /> Xác nhận
          </Button>
          {onReject && (
            <Button size="sm" variant="outline" className="h-7.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 rounded-md" onClick={onReject}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
