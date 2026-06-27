/**
 * FR-010: SOAP Note Editor Hook
 * Manages form state, auto-save (30s), AI ICD suggestions, and sign-off
 * Enhanced with: FR-023 Voice-to-Text, FR-024 Auto SOAP, and FR-025 Risk Scoring
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  createOrGetExamination,
  getExaminationByAppointment,
  saveSoapDraft,
  upsertIcdCode,
  confirmIcdCode,
  rejectIcdCode,
  removeIcdCode,
  signExamination,
  checkDoctorPinSet,
  setDoctorPin,
  getAiIcdSuggestions,
  searchIcd10,
} from '@/lib/emr-api';
import {
  appendHealthRecordVersion,
} from '@/lib/patient-health-records-storage';
import {
  getVoiceSession,
  saveVoiceSession,
  generateSoapFromAi,
  getRiskAssessment,
  recalculateRiskScore,
  type RiskAssessment,
  type VoiceSession,
} from '@/lib/ai-assistant-api';
import {
  analyzeTranscript,
  buildTranscriptFromAudio,
  createSttSession,
  transcriptToPlainText,
  type NlpAnalyzeResult,
} from '@/lib/stt-nlp-api';
import type {
  MedicalExamination,
  SoapFormData,
  SoapIcdCode,
  AiIcdSuggestion,
} from '@/types/emr';
import { DEFAULT_SOAP_FORM, validateSoapForSign } from '@/types/emr';

const AUTO_SAVE_INTERVAL_MS = 30_000; // RULE-010d: 30 seconds
const AI_DEBOUNCE_MS = 2_000;          // RULE-015: 2 second debounce

export type UseSoapNoteEditorReturn = {
  // State
  exam: MedicalExamination | null;
  formData: SoapFormData;
  loading: boolean;
  saving: boolean;
  submitting: boolean;
  error: string | null;
  isLocked: boolean;
  autoSavedAt: Date | null;
  hasPinSet: boolean;

  // ICD suggestions
  aiSuggestions: AiIcdSuggestion[];
  aiLoading: boolean;
  icdSearch: string;
  icdSearchResults: { code: string; name: string }[];
  icdSearchLoading: boolean;

  // Voice recording & transcription (FR-023)
  isRecording: boolean;
  isTranscribing: boolean;
  recordingDuration: number;
  recordingConsent: boolean;
  setRecordingConsent: (consent: boolean) => void;
  transcript: VoiceSession['transcript_raw'];
  nlpAnalysis: NlpAnalyzeResult | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;

  // AI SOAP Note generation (FR-024)
  isGeneratingSoap: boolean;
  generateSoap: () => Promise<void>;
  soapSourceBadge: Record<keyof SoapFormData, boolean>;

  // Patient Risk Scoring (FR-025)
  riskAssessment: RiskAssessment | null;
  riskLoading: boolean;
  recalcRisk: () => Promise<void>;

  // Form actions
  updateField: (field: keyof SoapFormData, value: string) => void;
  saveDraft: () => Promise<void>;

  // ICD actions
  addIcdCode: (code: string, name: string, isManual?: boolean) => Promise<void>;
  confirmIcd: (icd: SoapIcdCode) => Promise<void>;
  rejectIcd: (icd: SoapIcdCode) => Promise<void>;
  removeIcd: (icd: SoapIcdCode) => Promise<void>;
  setIcdSearch: (query: string) => void;

  // Sign-off actions
  sign: (params: { pin: string; responsibilityAck: boolean }) => Promise<boolean>;
  setupPin: (pin: string) => Promise<boolean>;
};

export function useSoapNoteEditor(appointmentId: string): UseSoapNoteEditorReturn {
  const [exam, setExam] = useState<MedicalExamination | null>(null);
  const [formData, setFormData] = useState<SoapFormData>(DEFAULT_SOAP_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSavedAt, setAutoSavedAt] = useState<Date | null>(null);
  const [hasPinSet, setHasPinSet] = useState(false);

  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AiIcdSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // ICD manual search
  const [icdSearch, setIcdSearch] = useState('');
  const [icdSearchResults, setIcdSearchResults] = useState<{ code: string; name: string }[]>([]);
  const [icdSearchLoading, setIcdSearchLoading] = useState(false);

  // Voice recording & transcription
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [transcript, setTranscript] = useState<VoiceSession['transcript_raw']>([]);
  const [nlpAnalysis, setNlpAnalysis] = useState<NlpAnalyzeResult | null>(null);

  // AI SOAP generator states
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const [soapSourceBadge, setSoapSourceBadge] = useState<Record<keyof SoapFormData, boolean>>({
    s_text: false,
    o_text: false,
    a_text: false,
    p_text: false,
  });

  // Patient risk score states
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  // Refs for audio capturing
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sttSessionIdRef = useRef<string | null>(null);

  // Refs for EMR auto-save and debounce
  const examIdRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const icdSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSoapTextRef = useRef('');

  // ─── Helper: perform auto-save ────────────────────────────────────────────

  const performAutoSave = useCallback(async () => {
    if (!examIdRef.current || !formData.s_text.trim()) return;
    try {
      await saveSoapDraft(examIdRef.current, formData);
      setAutoSavedAt(new Date());
    } catch {
      // Silent fail for auto-save
    }
  }, [formData]);

  // ─── Helper: trigger AI suggestions ──────────────────────────────────────

  const triggerAiSuggestions = useCallback(async () => {
    if (!formData.s_text && !formData.o_text) {
      setAiSuggestions([]);
      return;
    }
    if ((formData.s_text + formData.o_text).length < 30) return;

    setAiLoading(true);
    try {
      // RULE-015a/b: AI cannot modify SOAP, only suggest
      const suggestions = await getAiIcdSuggestions(formData.s_text, formData.o_text);
      setAiSuggestions(suggestions);
    } catch {
      // RULE-015d: AI failure does not block exam
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  }, [formData.s_text, formData.o_text]);

  // ─── Helper: ICD search ───────────────────────────────────────────────────

  const performIcdSearch = async (query: string) => {
    setIcdSearchLoading(true);
    try {
      const results = await searchIcd10(query);
      setIcdSearchResults(results);
    } catch {
      setIcdSearchResults([]);
    } finally {
      setIcdSearchLoading(false);
    }
  };

  // ─── Reload exam from server ──────────────────────────────────────────────

  const reloadExam = useCallback(async () => {
    try {
      const updated = await getExaminationByAppointment(appointmentId);
      if (updated) {
        setExam(updated);
        if (updated.auto_saved_at) {
          setAutoSavedAt(new Date(updated.auto_saved_at));
        }
      }
    } catch {
      // Non-critical
    }
  }, [appointmentId]);

  // ─── Load exam, voice session & risk assessment ───────────────────────────

  useEffect(() => {
    if (!appointmentId) return;

    async function init() {
      setLoading(true);
      setError(null);

      try {
        setHasPinSet(await checkDoctorPinSet());

        // Create or get exam
        const examId = await createOrGetExamination(appointmentId);
        examIdRef.current = examId;

        // Load full exam data
        const loadedExam = await getExaminationByAppointment(appointmentId);
        if (loadedExam) {
          setExam(loadedExam);
          setFormData({
            s_text: loadedExam.s_text ?? '',
            o_text: loadedExam.o_text ?? '',
            a_text: loadedExam.a_text ?? '',
            p_text: loadedExam.p_text ?? '',
          });
          if (loadedExam.auto_saved_at) {
            setAutoSavedAt(new Date(loadedExam.auto_saved_at));
          }
        }

        // Load voice session transcript
        const voiceSession = await getVoiceSession(appointmentId).catch(() => null);
        if (voiceSession) {
          setTranscript(voiceSession.transcript_raw);
        }

        // Load risk assessment
        const risk = await getRiskAssessment(examId).catch(() => null);
        setRiskAssessment(risk);

      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, [appointmentId]);

  // ─── Auto-save every 30 seconds (RULE-010d) ───────────────────────────────

  useEffect(() => {
    if (!examIdRef.current || exam?.status === 'LOCKED') return;

    autoSaveTimerRef.current = setInterval(() => {
      void performAutoSave();
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [exam?.status, formData, performAutoSave]);

  // ─── AI suggestion debounce (RULE-015: 2s debounce) ──────────────────────

  useEffect(() => {
    if (exam?.status === 'LOCKED') return;

    const currentText = formData.s_text + formData.o_text;
    if (currentText === lastSoapTextRef.current) return;
    lastSoapTextRef.current = currentText;

    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);

    aiDebounceRef.current = setTimeout(() => {
      void triggerAiSuggestions();
    }, AI_DEBOUNCE_MS);

    return () => {
      if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    };
  }, [formData.s_text, formData.o_text, exam?.status, triggerAiSuggestions]);

  // ─── ICD search debounce ──────────────────────────────────────────────────

  useEffect(() => {
    if (icdSearchDebounceRef.current) clearTimeout(icdSearchDebounceRef.current);
    if (!icdSearch.trim() || icdSearch.length < 2) {
      setIcdSearchResults([]);
      return;
    }

    icdSearchDebounceRef.current = setTimeout(() => {
      void performIcdSearch(icdSearch);
    }, 300);

    return () => {
      if (icdSearchDebounceRef.current) clearTimeout(icdSearchDebounceRef.current);
    };
  }, [icdSearch]);



  // ─── Public: update field ─────────────────────────────────────────────────

  const updateField = useCallback((field: keyof SoapFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear AI badge when modified
    setSoapSourceBadge((prev) => ({ ...prev, [field]: false }));
  }, []);

  // ─── Public: manual save ──────────────────────────────────────────────────

  const saveDraft = useCallback(async () => {
    if (!examIdRef.current) return;
    if (!formData.s_text.trim()) {
      toast.error('Phần Subjective (S) là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      await saveSoapDraft(examIdRef.current, formData);
      setAutoSavedAt(new Date());
      toast.success('Đã lưu nháp');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [formData]);

  // ─── Public: add ICD code ─────────────────────────────────────────────────

  const addIcdCode = useCallback(
    async (code: string, name: string, isManual = false) => {
      if (!examIdRef.current) return;
      try {
        await upsertIcdCode({
          examId: examIdRef.current,
          icdCode: code,
          icdName: name,
          isAiSuggested: !isManual,
          confirmStatus: isManual ? 'CONFIRMED' : 'PENDING',
        });
        await reloadExam();
        if (isManual) toast.success(`Đã thêm ICD ${code}`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [reloadExam]
  );

  // ─── Public: confirm AI suggestion ───────────────────────────────────────

  const confirmIcd = useCallback(
    async (icd: SoapIcdCode) => {
      if (!examIdRef.current) return;
      try {
        await confirmIcdCode(examIdRef.current, icd.icd_code, icd.icd_name);
        await reloadExam();
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [reloadExam]
  );

  // ─── Public: reject AI suggestion ────────────────────────────────────────

  const rejectIcd = useCallback(
    async (icd: SoapIcdCode) => {
      if (!examIdRef.current) return;
      try {
        await rejectIcdCode(examIdRef.current, icd.icd_code, icd.icd_name);
        await reloadExam();
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [reloadExam]
  );

  // ─── Public: remove ICD ───────────────────────────────────────────────────

  const removeIcd = useCallback(
    async (icd: SoapIcdCode) => {
      try {
        await removeIcdCode(icd.id);
        await reloadExam();
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [reloadExam]
  );

  const collectRecordedAudio = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(
          audioChunksRef.current.length > 0
            ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
            : null
        );
        return;
      }

      recorder.onstop = () => {
        resolve(
          audioChunksRef.current.length > 0
            ? new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
            : null
        );
      };
      recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
    });

  // ─── Voice recording & transcription (FR-023) ──────────────────────────────

  const startRecording = async () => {
    if (!recordingConsent) {
      toast.error('Vui lòng xác nhận đã thông báo và nhận sự đồng ý của bệnh nhân.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const session = await createSttSession({
        appointmentId,
        doctorId: user.id,
        consentConfirmed: true,
      });
      sttSessionIdRef.current = session.session_id;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingDuration(0);
      setTranscript([]);
      setNlpAnalysis(null);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      toast.success('Bắt đầu ghi âm phiên khám...');
    } catch (e) {
      toast.error(
        e instanceof Error && e.message !== 'Chưa đăng nhập'
          ? e.message
          : 'Không truy cập được microphone. Vui lòng kiểm tra quyền trình duyệt.'
      );
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    setIsTranscribing(true);
    toast.info('Đang chuyển đổi giọng nói và phân tích hội thoại...');

    try {
      const audioBlob = await collectRecordedAudio();
      mediaRecorderRef.current = null;

      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Không thu được dữ liệu âm thanh. Vui lòng thử ghi âm lại.');
      }

      const { turns } = await buildTranscriptFromAudio(audioBlob);
      if (turns.length === 0) {
        throw new Error('Không nhận diện được nội dung hội thoại từ file ghi âm.');
      }

      setTranscript(turns);

      const plainTranscript = transcriptToPlainText(turns);
      const analysis = await analyzeTranscript(plainTranscript);
      setNlpAnalysis(analysis);

      if (analysis.red_flags.length > 0) {
        toast.warning(`Phát hiện ${analysis.red_flags.length} dấu hiệu cảnh báo từ hội thoại.`);
      }

      await saveVoiceSession(appointmentId, turns, audioBlob);
      toast.success('Đã lưu transcript phiên khám.');

      await generateSoap(turns, analysis);
    } catch (e) {
      toast.error((e as Error).message || 'Lỗi xử lý ghi âm.');
    } finally {
      setIsTranscribing(false);
      sttSessionIdRef.current = null;
    }
  };

  // ─── AI SOAP Note Generator (FR-024) ──────────────────────────────────────────

  const generateSoap = async (
    transcriptOverride?: VoiceSession['transcript_raw'],
    analysisOverride?: NlpAnalyzeResult | null
  ) => {
    setIsGeneratingSoap(true);
    try {
      const generated = await generateSoapFromAi(appointmentId, transcriptOverride);

      if (generated.analysis) {
        setNlpAnalysis(generated.analysis);
      } else if (analysisOverride) {
        setNlpAnalysis(analysisOverride);
      }

      setFormData({
        s_text: generated.s_text,
        o_text: generated.o_text,
        a_text: generated.a_text,
        p_text: generated.p_text,
      });

      setSoapSourceBadge({
        s_text: true,
        o_text: true,
        a_text: true,
        p_text: true,
      });

      for (const icd of generated.icd_codes) {
        if (!examIdRef.current) continue;
        await upsertIcdCode({
          examId: examIdRef.current,
          icdCode: icd.code,
          icdName: icd.name,
          isAiSuggested: true,
          aiConfidence: icd.confidence,
          aiReason: icd.reason,
          confirmStatus: 'PENDING',
        });
      }

      await reloadExam();
      toast.success('Đã tạo SOAP Note từ AI (Module 5/6).');
    } catch (e) {
      toast.error((e as Error).message || 'Gặp lỗi khi tạo SOAP Note tự động.');
    } finally {
      setIsGeneratingSoap(false);
    }
  };

  // ─── Patient Risk Assessment Recalculation (FR-025) ──────────────────────────

  const recalcRisk = async () => {
    if (!examIdRef.current) return;
    setRiskLoading(true);
    try {
      // Force calculation RPC
      const result = await recalculateRiskScore(examIdRef.current);
      setRiskAssessment(result);
      toast.success('Đã tính toán lại điểm rủi ro của bệnh nhân.');
    } catch (e) {
      toast.error('Lỗi khi tính điểm rủi ro: ' + (e as Error).message);
    } finally {
      setRiskLoading(false);
    }
  };

  // ─── Public: sign examination (with PIN) ───────────────────────────────────

  const sign = useCallback(
    async (params: { pin: string; responsibilityAck: boolean }): Promise<boolean> => {
      if (!examIdRef.current) return false;

      // Validate before sending
      const currentIcds = exam?.icd_codes ?? [];
      const errors = validateSoapForSign(formData, currentIcds);
      if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return false;
      }

      setSubmitting(true);
      try {
        // Save latest draft first
        await saveSoapDraft(examIdRef.current, formData);

        // Sign & Lock (PIN bypass — UI only)
        await signExamination({
          examId: examIdRef.current,
          responsibilityAck: params.responsibilityAck,
        });

        // Trigger dynamic Risk scoring immediately after signing
        const updatedRisk = await recalculateRiskScore(examIdRef.current).catch(() => null);
        setRiskAssessment(updatedRisk);

        toast.success('Hồ sơ khám đã được ký số và đóng băng thành công.');
        const signedExam = await getExaminationByAppointment(appointmentId);
        if (signedExam?.patient_id) {
          appendHealthRecordVersion(signedExam.patient_id, signedExam);
          const { data: apptRow } = await supabase
            .from('appointments')
            .select('profile_id')
            .eq('id', signedExam.appointment_id)
            .maybeSingle();
          if (apptRow?.profile_id) {
            appendHealthRecordVersion(String(apptRow.profile_id), signedExam);
          }
        }
        await reloadExam();
        return true;
      } catch (e) {
        toast.error((e as Error).message);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [exam, formData, reloadExam, appointmentId]
  );

  // ─── Public: setup PIN ────────────────────────────────────────────────────

  const setupPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      await setDoctorPin(pin);
      setHasPinSet(true);
      toast.success('Mã PIN ký số đã được thiết lập.');
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    }
  }, []);

  return {
    exam,
    formData,
    loading,
    saving,
    submitting,
    error,
    isLocked: exam?.status === 'LOCKED',
    autoSavedAt,
    hasPinSet,

    aiSuggestions,
    aiLoading,
    icdSearch,
    icdSearchResults,
    icdSearchLoading,

    // Voice recording & transcription
    isRecording,
    isTranscribing,
    recordingDuration,
    recordingConsent,
    setRecordingConsent,
    transcript,
    nlpAnalysis,
    startRecording,
    stopRecording,

    // SOAP auto-generation
    isGeneratingSoap,
    generateSoap,
    soapSourceBadge,

    // Risk assessment
    riskAssessment,
    riskLoading,
    recalcRisk,

    updateField,
    saveDraft,

    addIcdCode,
    confirmIcd,
    rejectIcd,
    removeIcd,
    setIcdSearch,

    sign,
    setupPin,
  };
}
