import { describe, expect, it } from "vitest";
import {
  diffSoapFormFields,
  formatExamUpdateActivityMessage,
} from "@/lib/exam-activity-log";

describe("formatExamUpdateActivityMessage (TC-DLS-403)", () => {
  it("should name the doctor and the update action", () => {
    expect(formatExamUpdateActivityMessage("Nguyễn Văn A")).toBe(
      "Bác sĩ Nguyễn Văn A đã cập nhật nội dung hồ sơ"
    );
  });

  it("should still form a readable line when the doctor name is missing", () => {
    expect(formatExamUpdateActivityMessage("  ")).toBe(
      "Bác sĩ đã cập nhật nội dung hồ sơ"
    );
  });
});

describe("diffSoapFormFields", () => {
  it("should list only SOAP sections whose text changed", () => {
    expect(
      diffSoapFormFields(
        { s_text: "Đau họng", o_text: "Họng đỏ", a_text: "Viêm họng", p_text: "Nghỉ ngơi" },
        { s_text: "Đau họng 3 ngày", o_text: "Họng đỏ", a_text: "Viêm họng cấp", p_text: "Nghỉ ngơi" },
      )
    ).toEqual(["s_text", "a_text"]);
  });
});
