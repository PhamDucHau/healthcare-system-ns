import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { format, parseISO } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listAppointments = vi.fn();
const listExamLogs = vi.fn();
const getExamById = vi.fn();
const listExamActivity = vi.fn();

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/lib/delta-log-api", () => ({
  listDoctorAppointmentsAuditLog: (...args: unknown[]) => listAppointments(...args),
  listDoctorExaminationActivityLog: (...args: unknown[]) => listExamLogs(...args),
}));

vi.mock("@/lib/emr-api", () => ({
  getExaminationById: (...args: unknown[]) => getExamById(...args),
  listExaminationActivityLog: (...args: unknown[]) => listExamActivity(...args),
}));

vi.mock("@/components/admin/delta-log/AppointmentDetailDialog", () => ({
  default: () => null,
}));

import DoctorMedicalHistoryPage from "@/pages/provider/DoctorMedicalHistoryPage";

describe("Doctor medical history system log tab (TC-DLS-403)", () => {
  beforeEach(() => {
    listAppointments.mockReset();
    listExamLogs.mockReset();
    getExamById.mockReset();
    listExamActivity.mockReset();
    listExamActivity.mockResolvedValue([]);
    listAppointments.mockResolvedValue({ total: 0, rows: [] });
    listExamLogs.mockResolvedValue({
      total: 1,
      rows: [
        {
          id: "log-1",
          exam_id: "exam-1",
          actor_id: "doc-1",
          actor_name: "Lê Thị Hồng Xoan",
          action: "UPDATED",
          created_at: "2026-09-16T10:15:00.000Z",
          patient_name: "NGUYỄN NHẬT HÀ",
          appointment_id: "appt-1",
          message: "Bác sĩ Lê Thị Hồng Xoan đã cập nhật nội dung hồ sơ",
          changed_fields: ["s_text", "a_text"],
          related_exam_id: null,
        },
      ],
    });
    getExamById.mockResolvedValue({
      id: "exam-1",
      appointment_id: "appt-1",
      patient_id: "user-1",
      doctor_id: "doc-1",
      s_text: "Đau họng 3 ngày",
      o_text: "Họng đỏ",
      a_text: "Viêm họng cấp",
      p_text: "Nghỉ ngơi, uống nhiều nước",
      status: "DRAFT",
      is_addendum: false,
      parent_exam_id: null,
      auto_saved_at: null,
      created_at: "2026-09-16T00:00:00.000Z",
      updated_at: "2026-09-16T03:14:00.000Z",
      ai_baseline: {
        s_text: "Đau họng",
        o_text: "Họng đỏ",
        a_text: "Viêm họng",
        p_text: "Nghỉ ngơi, uống nhiều nước",
      },
      icd_codes: [
        {
          id: "icd-1",
          exam_id: "exam-1",
          icd_code: "J02.9",
          icd_name: "Viêm họng cấp",
          is_ai_suggested: false,
          ai_confidence: null,
          ai_reason: null,
          confirm_status: "CONFIRMED",
          confirmed_at: "2026-09-16T03:14:00.000Z",
          display_order: 0,
          created_at: "2026-09-16T03:14:00.000Z",
        },
      ],
    });
  });

  it("should show a Nhật ký hệ thống tab with the doctor update trail", async () => {
    render(<DoctorMedicalHistoryPage />);

    const tab = screen.getByRole("tab", { name: /Nhật ký hệ thống/i });
    fireEvent.mouseDown(tab, { button: 0 });
    fireEvent.click(tab);

    await waitFor(() => {
      expect(listExamLogs).toHaveBeenCalled();
    });

    expect(
      await screen.findAllByText("Bác sĩ Lê Thị Hồng Xoan đã cập nhật nội dung hồ sơ")
    ).not.toHaveLength(0);
    expect(screen.getAllByText("NGUYỄN NHẬT HÀ").length).toBeGreaterThan(0);
  });

  it("should open SOAP details when clicking Xem chi tiết", async () => {
    listExamActivity.mockResolvedValue([
      {
        id: "ai-1",
        exam_id: "exam-1",
        actor_id: "doc-1",
        actor_name: "Lê Thị Hồng Xoan",
        action: "AI_GENERATED",
        created_at: "2026-09-16T03:00:00.000Z",
        message: "Bác sĩ Lê Thị Hồng Xoan đã tạo nháp SOAP bằng AI",
        changed_fields: [],
        related_exam_id: null,
      },
    ]);

    render(<DoctorMedicalHistoryPage />);

    const tab = screen.getByRole("tab", { name: /Nhật ký hệ thống/i });
    fireEvent.mouseDown(tab, { button: 0 });
    fireEvent.click(tab);

    const detailButtons = await screen.findAllByRole("button", { name: /Xem chi tiết/i });
    fireEvent.click(detailButtons[0]);

    await waitFor(() => {
      expect(getExamById).toHaveBeenCalledWith("exam-1");
    });

    expect(await screen.findByText("Đau họng 3 ngày")).toBeInTheDocument();
    expect(screen.getByText("Đau họng")).toBeInTheDocument();
    expect(screen.getAllByText("Nháp AI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bác sĩ Lê Thị Hồng Xoan").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Họng đỏ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Viêm họng cấp").length).toBeGreaterThan(0);
    expect(screen.getByText("Viêm họng")).toBeInTheDocument();
    expect(screen.getAllByText("Nghỉ ngơi, uống nhiều nước").length).toBeGreaterThan(0);
    expect(screen.getByTestId("soap-block-s_text")).toHaveAttribute("data-changed", "true");
    expect(screen.getByTestId("soap-block-a_text")).toHaveAttribute("data-changed", "true");
    expect(screen.getByTestId("soap-block-o_text")).toHaveAttribute("data-changed", "false");
    expect(screen.getAllByText("Đã sửa").length).toBe(2);
    const updatedAtLabel = format(parseISO("2026-09-16T10:15:00.000Z"), "dd/MM/yyyy HH:mm", {
      locale: viLocale,
    });
    expect(
      screen.getByText(`Cập nhật bởi Bác sĩ Lê Thị Hồng Xoan lúc ${updatedAtLabel}`),
    ).toBeInTheDocument();
    const aiAtLabel = format(parseISO("2026-09-16T03:00:00.000Z"), "dd/MM/yyyy HH:mm", {
      locale: viLocale,
    });
    expect(screen.getByTestId("soap-ai-column-header")).toHaveTextContent(aiAtLabel);
  });

  it("should keep Nháp AI columns when the exam has no AI baseline", async () => {
    getExamById.mockResolvedValue({
      id: "exam-1",
      appointment_id: "appt-1",
      patient_id: "user-1",
      doctor_id: "doc-1",
      s_text: "Đau họng 3 ngày",
      o_text: "Họng đỏ",
      a_text: "Viêm họng cấp",
      p_text: "Nghỉ ngơi, uống nhiều nước",
      status: "DRAFT",
      is_addendum: false,
      parent_exam_id: null,
      auto_saved_at: null,
      created_at: "2026-09-16T00:00:00.000Z",
      updated_at: "2026-09-16T03:14:00.000Z",
      ai_baseline: null,
      icd_codes: [],
    });

    render(<DoctorMedicalHistoryPage />);

    const tab = screen.getByRole("tab", { name: /Nhật ký hệ thống/i });
    fireEvent.mouseDown(tab, { button: 0 });
    fireEvent.click(tab);

    const detailButtons = await screen.findAllByRole("button", { name: /Xem chi tiết/i });
    fireEvent.click(detailButtons[0]);

    expect(await screen.findByText("Đau họng 3 ngày")).toBeInTheDocument();
    expect(screen.getAllByText("Nháp AI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bác sĩ Lê Thị Hồng Xoan").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("soap-ai-card")).toHaveLength(4);
    expect(screen.getAllByTestId("soap-doctor-card")).toHaveLength(4);
  });
});
