import type { InterventionRule, QuestionnaireQuestion } from '@/types/questionnaire';

export type QuestionnaireAnswerPayload = {
  question_id: string;
  answer_value: string | string[] | number;
  score_value: number;
};

export type AnswerState = Record<string, string | string[] | number>;

export function scoreForOption(question: QuestionnaireQuestion, optionId: string): number {
  const opt = question.options.find((o) => o.id === optionId);
  return opt?.score ?? 0;
}

export function buildAnswerPayloads(
  questions: QuestionnaireQuestion[],
  answers: AnswerState,
): QuestionnaireAnswerPayload[] {
  return questions.flatMap((q) => {
    const raw = answers[q.id];
    if (raw === undefined || raw === '' || (Array.isArray(raw) && raw.length === 0)) {
      return [];
    }

    if (q.type === 'MULTIPLE_CHOICE' && Array.isArray(raw)) {
      const score = raw.reduce((sum, id) => sum + scoreForOption(q, id), 0);
      return [{ question_id: q.id, answer_value: raw, score_value: score }];
    }

    if (q.type === 'SINGLE_CHOICE' || q.type === 'SCALE') {
      const optionId = String(raw);
      return [{ question_id: q.id, answer_value: optionId, score_value: scoreForOption(q, optionId) }];
    }

    if (q.type === 'NUMBER') {
      return [{ question_id: q.id, answer_value: Number(raw), score_value: 0 }];
    }

    return [{ question_id: q.id, answer_value: String(raw), score_value: 0 }];
  });
}

export function matchInterventionLabel(
  totalScore: number,
  rules: InterventionRule[],
): string | null {
  for (const rule of rules) {
    const cond = rule.condition.trim();
    if (!cond) continue;
    const ge = cond.match(/^score\s*>=\s*(\d+(?:\.\d+)?)$/i);
    if (ge && totalScore >= Number(ge[1])) return rule.label;
    const gt = cond.match(/^score\s*>\s*(\d+(?:\.\d+)?)$/i);
    if (gt && totalScore > Number(gt[1])) return rule.label;
    const le = cond.match(/^score\s*<=\s*(\d+(?:\.\d+)?)$/i);
    if (le && totalScore <= Number(le[1])) return rule.label;
    const lt = cond.match(/^score\s*<\s*(\d+(?:\.\d+)?)$/i);
    if (lt && totalScore < Number(lt[1])) return rule.label;
    const eq = cond.match(/^score\s*=\s*(\d+(?:\.\d+)?)$/i);
    if (eq && totalScore === Number(eq[1])) return rule.label;
  }
  return null;
}

export function flattenQuestions(
  sections: { questions: QuestionnaireQuestion[] }[],
): QuestionnaireQuestion[] {
  return sections.flatMap((s) => [...s.questions].sort((a, b) => a.sort_order - b.sort_order));
}

export function parseStoredAnswer(value: unknown): string | string[] | number {
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value;
  if (value != null && typeof value === 'object') return JSON.stringify(value);
  return '';
}
