import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listAppointments = vi.fn();
const listExamLogs = vi.fn();
const getExamById = vi.fn();

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/lib/delta-log-api", () => ({
  listDoctorAppointmentsAuditLog: (...args: unknown[]) => listAppointments(...args),
  listDoctorExaminationActivityLog: (...args: unknown[]) => listExamLogs(...args),
}));

vi.mock("@/lib/emr-api", () => ({
  getExaminationById: (...args: unknown[]) => getExamById(...args),
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
    expect(screen.getByText("Họng đỏ")).toBeInTheDocument();
    expect(screen.getAllByText("Viêm họng cấp").length).toBeGreaterThan(0);
    expect(screen.getByText("Nghỉ ngơi, uống nhiều nước")).toBeInTheDocument();
    expect(screen.getByTestId("soap-block-s_text")).toHaveAttribute("data-changed", "true");
    expect(screen.getByTestId("soap-block-a_text")).toHaveAttribute("data-changed", "true");
    expect(screen.getByTestId("soap-block-o_text")).toHaveAttribute("data-changed", "false");
    expect(screen.getAllByText("Đã sửa").length).toBe(2);
  });
});
