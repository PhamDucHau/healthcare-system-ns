import { supabase } from './supabase';
import {
  generateSoapBundleFromTranscript,
  transcriptToPlainText,
  type NlpAnalyzeResult,
} from './stt-nlp-api';

export type VoiceSession = {
  id: string;
  appointment_id: string;
  doctor_id: string;
  audio_url: string | null;
  transcript_raw: Array<{ speaker: 'doctor' | 'patient'; text: string; start_time?: string; end_time?: string }>;
  transcript_edited: Array<{ speaker: 'doctor' | 'patient'; text: string; start_time?: string; end_time?: string }> | null;
  created_at: string;
};

export type RiskAssessment = {
  id: string;
  exam_id: string;
  appointment_id: string;
  patient_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  risk_factors: Array<{ factor: string; contribution_pct: number }>;
  recommendation: string;
  model_version: string;
  override_applied: boolean;
  calculated_at: string;
};

export type ClinicalTask = {
  id: string;
  appointment_id: string | null;
  patient_id: string | null;
  assigned_role: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  due_date: string;
  override_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joins
  patient?: {
    legal_first_name: string;
    legal_last_name: string;
    phone_number: string;
  };
};

// ─── Voice Sessions API ──────────────────────────────────────────────────────

export async function saveVoiceSession(
  appointmentId: string,
  transcript: VoiceSession['transcript_raw'],
  audioBlob?: Blob
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Chưa đăng nhập');

  let audioUrl: string | null = null;
  if (audioBlob) {
    // In production, upload to a storage bucket (e.g. 'consultation-audios')
    // Here we'll simulate the URL link
    audioUrl = `https://storage.clinic.local/audios/${appointmentId}.mp3`;
  }

  const { error } = await supabase
    .from('voice_sessions')
    .upsert({
      appointment_id: appointmentId,
      doctor_id: user.id,
      audio_url: audioUrl,
      transcript_raw: transcript,
      transcript_edited: null,
    }, { onConflict: 'appointment_id' });

  if (error) throw new Error(error.message);
}

export async function getVoiceSession(appointmentId: string): Promise<VoiceSession | null> {
  const { data, error } = await supabase
    .from('voice_sessions')
    .select('*')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as VoiceSession | null;
}

// ─── AI SOAP Note Generator (FR-024) — Module 5/6 NLP backend ────────────────

export type GenerateSoapFromAiResult = {
  s_text: string;
  o_text: string;
  a_text: string;
  p_text: string;
  icd_codes: Array<{ code: string; name: string; confidence: number; reason: string }>;
  analysis?: NlpAnalyzeResult;
};

export async function generateSoapFromAi(
  appointmentId: string,
  transcriptOverride?: VoiceSession['transcript_raw']
): Promise<GenerateSoapFromAiResult> {
  const voice = transcriptOverride
    ? { transcript_raw: transcriptOverride }
    : await getVoiceSession(appointmentId).catch(() => null);

  const transcriptText = voice?.transcript_raw?.length
    ? transcriptToPlainText(voice.transcript_raw)
    : '';

  if (!transcriptText.trim()) {
    throw new Error('Chưa có transcript phiên khám. Vui lòng ghi âm hoặc nhập nội dung trước.');
  }

  const bundle = await generateSoapBundleFromTranscript(transcriptText);

  return {
    ...bundle.fields,
    icd_codes: bundle.icdCodes,
    analysis: bundle.analysis,
  };
}

// ─── Patient Risk Assessments API (FR-025) ───────────────────────────────────

export async function getRiskAssessment(examId: string): Promise<RiskAssessment | null> {
  const { data, error } = await supabase
    .from('risk_assessments')
    .select('*')
    .eq('exam_id', examId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as RiskAssessment | null;
}

export async function recalculateRiskScore(examId: string): Promise<RiskAssessment | null> {
  const { data, error } = await supabase.rpc('calculate_risk_score', { p_exam_id: examId });
  if (error) throw new Error(error.message);
  
  return getRiskAssessment(examId);
}

// ─── Clinical Tasks API (FR-025 Follow-ups) ──────────────────────────────────

export async function fetchClinicalTasks(portal: 'doctor' | 'admin'): Promise<ClinicalTask[]> {
  const query = supabase
    .from('clinical_tasks')
    .select(`
      *,
      patient:patient_id (
        legal_first_name,
        legal_last_name,
        phone_number
      )
    `)
    .order('due_date', { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    patient: Array.isArray(row.patient) ? row.patient[0] : row.patient || undefined,
  })) as ClinicalTask[];
}

export async function updateClinicalTask(
  taskId: string,
  status: ClinicalTask['status'],
  overrideReason?: string
): Promise<void> {
  const { error } = await supabase
    .from('clinical_tasks')
    .update({
      status,
      override_reason: overrideReason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) throw new Error(error.message);
}
