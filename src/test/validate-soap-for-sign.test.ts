import { describe, expect, it } from "vitest";
import {
  SOAP_ASSESSMENT_REQUIRED_MESSAGE,
  validateSoapForSave,
  validateSoapForSign,
  type SoapFormData,
  type SoapIcdCode,
} from "@/types/emr";

function soap(overrides: Partial<SoapFormData> = {}): SoapFormData {
  return {
    s_text: "Đau họng 3 ngày",
    o_text: "Họng sung đỏ",
    a_text: "",
    p_text: "Uống nhiều nước",
    ...overrides,
  };
}

function confirmedIcd(overrides: Partial<SoapIcdCode> = {}): SoapIcdCode {
  return {
    id: "icd-1",
    exam_id: "exam-1",
    icd_code: "J02.9",
    icd_name: "Viêm họng cấp",
    is_ai_suggested: false,
    ai_confidence: null,
    ai_reason: null,
    confirm_status: "CONFIRMED",
    confirmed_at: "2026-09-16T00:00:00.000Z",
    display_order: 0,
    created_at: "2026-09-16T00:00:00.000Z",
    ...overrides,
  };
}

describe("validateSoapForSign", () => {
  it("should require Assessment (A) when a_text is empty", () => {
    const errors = validateSoapForSign(soap({ a_text: "" }), [confirmedIcd()]);
    expect(errors.a_text).toBe(SOAP_ASSESSMENT_REQUIRED_MESSAGE);
  });

  it("should require Assessment (A) when a_text is only whitespace", () => {
    const errors = validateSoapForSign(soap({ a_text: "   " }), [confirmedIcd()]);
    expect(errors.a_text).toBe(SOAP_ASSESSMENT_REQUIRED_MESSAGE);
  });

  it("should not error when S, A, and a confirmed ICD are present", () => {
    const errors = validateSoapForSign(
      soap({ a_text: "Viêm họng cấp, theo dõi sốt" }),
      [confirmedIcd()]
    );
    expect(errors).toEqual({});
  });

  it("should still allow saving a draft with empty Assessment (A)", () => {
    const errors = validateSoapForSave(soap({ a_text: "" }));
    expect(errors.a_text).toBeUndefined();
  });
});
