import { supabase } from './supabase';

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

// ─── AI SOAP Note Generator (FR-024) ──────────────────────────────────────────

export async function generateSoapFromAi(appointmentId: string): Promise<{
  s_text: string;
  o_text: string;
  a_text: string;
  p_text: string;
  icd_codes: Array<{ code: string; name: string; confidence: number; reason: string }>;
}> {
  // 1. Fetch pre-consultation details
  const { data: preConsultRaw, error: preConsultErr } = await supabase
    .rpc('get_pre_consultation_by_appointment', { p_appointment_id: appointmentId });
  
  const preConsult = !preConsultErr && preConsultRaw && preConsultRaw.length > 0 ? preConsultRaw[0] : null;

  // 2. Fetch voice transcript
  const voice = await getVoiceSession(appointmentId).catch(() => null);

  // 3. Extract keywords to build medical context
  let chiefComplaint = preConsult?.chief_complaint || '';
  let tags: string[] = preConsult?.symptom_tags || [];
  let history = Array.isArray(preConsult?.medical_history) ? preConsult.medical_history : [];

  if (voice && voice.transcript_raw) {
    const speechText = voice.transcript_raw.map(t => t.text).join(' ');
    if (speechText.includes('đau ngực') || speechText.includes('tim')) chiefComplaint = chiefComplaint || 'Đau ngực';
    if (speechText.includes('đau đầu') || speechText.includes('chóng mặt')) chiefComplaint = chiefComplaint || 'Đau đầu';
    if (speechText.includes('ho') || speechText.includes('sốt') || speechText.includes('đau họng')) chiefComplaint = chiefComplaint || 'Viêm đường hô hấp';
  }

  // 4. Construct simulated response
  const combined = chiefComplaint.toLowerCase();
  
  if (combined.includes('ngực') || combined.includes('tim')) {
    return {
      s_text: `Bệnh nhân khai báo đau tức ngực trái âm ỉ trong 3 ngày qua, lan ra vai trái. Đau tăng khi gắng sức, giảm khi nghỉ ngơi. Có cảm giác hồi hộp, trống ngực nhẹ. Không khó thở, không vã mồ hôi. Lịch sử gia đình có bố bị bệnh tim mạch.`,
      o_text: `Tim nhịp đều 88 chu kỳ/phút, T1 T2 rõ, không nghe tiếng thổi bệnh lý. Phổi thông khí tốt, không rale. Huyết áp đo tại phòng khám 145/90 mmHg. Bụng mềm, gan lách không to.`,
      a_text: `Đau thắt ngực không ổn định theo dõi / Tăng huyết áp độ I.`,
      icd_codes: [
        { code: 'R07.9', name: 'Đau ngực, không đặc hiệu', confidence: 92, reason: 'Triệu chứng đau ngực trái lan vai trái' },
        { code: 'I10', name: 'Tăng huyết áp nguyên phát', confidence: 85, reason: 'Huyết áp ghi nhận 145/90 mmHg' }
      ],
      p_text: `1. Đo điện tâm đồ (ECG) tại giường.\n2. Thực hiện xét nghiệm Troponin T siêu nhạy, lipid panel máu.\n3. Kê đơn: Amlodipine 5mg x 1 viên uống sáng.\n4. Tránh hoạt động gắng sức mạnh, tái khám ngay nếu cơn đau thắt ngực kéo dài trên 15 phút.`
    };
  } else if (combined.includes('họng') || combined.includes('ho') || combined.includes('sốt') || combined.includes('hô hấp') || combined.includes('mũi')) {
    return {
      s_text: `Bệnh nhân khai đau rát họng, ho khan thành cơn 3 ngày nay, có sốt nhẹ (nhiệt độ đo tại nhà 38.2°C). Cảm giác ngạt mũi, chảy nước mũi trong, mệt mỏi nhẹ, không khó thở, ăn uống kém do đau họng.`,
      o_text: `Niêm mạc họng đỏ, amidan hai bên sung huyết nhẹ, không có giả mạc. Hạch góc hàm không sưng đau. Phổi phế nang phế quản rì rào rõ, không rale. Nhiệt độ tại phòng khám 37.8°C. Mạch 82 bpm, HA 120/80 mmHg.`,
      a_text: `Viêm mũi họng cấp tính (Cảm lạnh thông thường).`,
      icd_codes: [
        { code: 'J00', name: 'Viêm mũi họng cấp (Cảm lạnh thông thường)', confidence: 90, reason: 'Họng đỏ, ngạt mũi kèm chảy nước mũi' },
        { code: 'J06.9', name: 'Nhiễm khuẩn hô hấp trên cấp tính, không đặc hiệu', confidence: 82, reason: 'Ho khan, sốt nhẹ và đau rát họng' }
      ],
      p_text: `1. Súc họng bằng nước muối sinh lý ấm 3-4 lần/ngày.\n2. Thuốc điều trị triệu chứng:\n   - Paracetamol 500mg: uống 1 viên khi sốt > 38.5°C (cách ít nhất 4-6 tiếng).\n   - Dextromethorphan 15mg: uống 1 viên x 2 lần/ngày khi ho nhiều.\n3. Uống nhiều nước ấm, tăng cường bổ sung vitamin C.\n4. Theo dõi và tái khám nếu sốt cao liên tục không hạ quá 3 ngày.`
    };
  } else if (combined.includes('đường') || combined.includes('tiểu đường') || combined.includes('đái tháo đường')) {
    return {
      s_text: `Bệnh nhân tiền sử Đái tháo đường týp 2 đang điều trị ngoại trú. Khám định kỳ theo hẹn. Khai báo không mệt mỏi đột ngột, không tê bì chân tay, tiểu tiện bình thường, ăn uống hạn chế chất ngọt tốt.`,
      o_text: `Thể trạng trung bình. HA 125/80 mmHg, nhịp tim 76 bpm. Bụng mềm. Các cơ quan tim phổi bình thường. Các chi ấm, mạch ngoại vi bắt rõ. Đường huyết mao mạch lúc đói đo tại chỗ: 6.8 mmol/L.`,
      a_text: `Đái tháo đường týp 2 ổn định.`,
      icd_codes: [
        { code: 'E11.9', name: 'Đái tháo đường týp 2, không biến chứng', confidence: 95, reason: 'Bệnh sử và các chỉ số đường huyết ổn định' }
      ],
      p_text: `1. Tiếp tục duy trì chế độ dinh dưỡng ít tinh bột, hạn chế đường ngọt.\n2. Thuốc duy trì hàng tháng:\n   - Metformin 850mg: uống 1 viên x 2 lần/ngày (sau ăn sáng, ăn tối).\n3. Tự đo đường huyết tại nhà 2 lần/tuần.\n4. Tái khám sau 1 tháng để xét nghiệm chỉ số HbA1c.`
    };
  }

  // General Fallback consultation note
  return {
    s_text: `Bệnh nhân đến khám kiểm tra sức khỏe tổng quát theo lịch hẹn. Hiện tại không có triệu chứng bất thường rõ rệt, không đau ngực, không khó thở, giấc ngủ bình thường.`,
    o_text: `Huyết áp 120/80 mmHg, nhịp tim 75 bpm, nhiệt độ 36.8°C. Tim đều phổi trong. Bụng mềm không đau. Thể trạng cân đối.`,
    a_text: `Khám sức khỏe tổng quát bình thường.`,
    icd_codes: [
      { code: 'Z00.0', name: 'Khám sức khỏe tổng quát định kỳ', confidence: 98, reason: 'BN khám định kỳ, không có triệu chứng bất thường' }
    ],
    p_text: `1. Tiếp tục tập luyện thể thao ít nhất 30 phút mỗi ngày.\n2. Ăn uống điều độ, bổ sung nhiều chất xơ, hạn chế đồ dầu mỡ.\n3. Khám sức khỏe định kỳ mỗi 6 tháng.`
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
