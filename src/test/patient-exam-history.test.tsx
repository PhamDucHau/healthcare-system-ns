import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listAppointments = vi.fn();
const listExamLogs = vi.fn();
const getExamById = vi.fn();
const listExamActivity = vi.fn();

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/components/TopNav", () => ({ default: () => <div>TopNav</div> }));
vi.mock("@/components/Sidebar", () => ({ default: () => <div>Sidebar</div> }));

vi.mock("@/lib/delta-log-api", () => ({
  listPatientAppointmentsAuditLog: (...args: unknown[]) => listAppointments(...args),
  listPatientExaminationActivityLog: (...args: unknown[]) => listExamLogs(...args),
}));

vi.mock("@/lib/emr-api", () => ({
  getExaminationById: (...args: unknown[]) => getExamById(...args),
  listExaminationActivityLog: (...args: unknown[]) => listExamActivity(...args),
}));

vi.mock("@/components/admin/delta-log/AppointmentDetailDialog", () => ({
  default: ({ open, appointmentId }: { open: boolean; appointmentId: string | null }) =>
    open ? <div>Chi tiết lịch hẹn {appointmentId}</div> : null,
}));

import PatientExamHistoryPage from "@/pages/PatientExamHistoryPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <PatientExamHistoryPage />
    </MemoryRouter>,
  );
}

describe("Patient exam history (Rcare Plus)", () => {
  beforeEach(() => {
    listAppointments.mockReset();
    listExamLogs.mockReset();
    getExamById.mockReset();
    listExamActivity.mockReset();
    listExamActivity.mockResolvedValue([]);
    getExamById.mockResolvedValue(null);
    listAppointments.mockResolvedValue({
      total: 1,
      rows: [
        {
          id: "log-1",
          appointment_id: "appt-1",
          action: "CHECKIN",
          performed_by: "staff-1",
          performed_by_name: "Lễ tân",
          performed_at: "2026-09-16T14:30:00.000Z",
          old_status: "CONFIRMED",
          new_status: "CHECKED_IN",
          notes: null,
          specialty_name: "Da liễu",
          patient_name: "BỆNH NHÂN KHÁC",
          doctor_name: "Lê Thị Hồng Xoan",
        },
      ],
    });
    listExamLogs.mockResolvedValue({
      total: 1,
      rows: [
        {
          id: "exam-log-1",
          exam_id: "exam-1",
          actor_id: "doc-1",
          actor_name: "Lê Thị Hồng Xoan",
          action: "UPDATED",
          created_at: "2026-09-16T10:15:00.000Z",
          patient_name: "BỆNH NHÂN KHÁC",
          appointment_id: "appt-1",
          message: "Bác sĩ Lê Thị Hồng Xoan đã cập nhật nội dung hồ sơ",
          changed_fields: ["s_text"],
          related_exam_id: null,
        },
      ],
    });
  });

  it("should show both history tabs and search by specialty", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: "Lịch sử khám bệnh" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Lịch sử khám bệnh/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Nhật ký hệ thống/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tìm chuyên khoa, bác sĩ...")).toBeInTheDocument();
    expect((await screen.findAllByText("Lê Thị Hồng Xoan")).length).toBeGreaterThan(0);
    expect(screen.queryByText("BỆNH NHÂN KHÁC")).not.toBeInTheDocument();
    expect(screen.getAllByText("Da liễu").length).toBeGreaterThan(0);
  });

  it("should show the system log with doctor name and hide other patient names", async () => {
    renderPage();

    const tab = screen.getByRole("tab", { name: /Nhật ký hệ thống/i });
    fireEvent.mouseDown(tab, { button: 0 });
    fireEvent.click(tab);

    await waitFor(() => {
      expect(listExamLogs).toHaveBeenCalled();
    });

    expect(
      await screen.findAllByText("Bác sĩ Lê Thị Hồng Xoan đã cập nhật nội dung hồ sơ"),
    ).not.toHaveLength(0);
    expect(screen.getByPlaceholderText("Tìm bác sĩ hoặc chuyên khoa...")).toBeInTheDocument();
    expect(screen.getAllByText("Lê Thị Hồng Xoan").length).toBeGreaterThan(0);
    expect(screen.queryByText("BỆNH NHÂN KHÁC")).not.toBeInTheDocument();
  });

  it("should open appointment details from the visit tab", async () => {
    renderPage();

    const detailButtons = await screen.findAllByRole("button", { name: /Xem chi tiết/i });
    fireEvent.click(detailButtons[0]);

    expect(await screen.findByText("Chi tiết lịch hẹn appt-1")).toBeInTheDocument();
  });

  it("should not show SOAP draft when the exam is not locked", async () => {
    getExamById.mockResolvedValue(null);
    renderPage();

    const tab = screen.getByRole("tab", { name: /Nhật ký hệ thống/i });
    fireEvent.mouseDown(tab, { button: 0 });
    fireEvent.click(tab);

    const detailButtons = await screen.findAllByRole("button", { name: /Xem chi tiết/i });
    fireEvent.click(detailButtons[0]);

    expect(await screen.findByText("Hồ sơ chưa được bác sĩ ký xác nhận")).toBeInTheDocument();
    expect(screen.queryByText("Nháp AI")).not.toBeInTheDocument();
  });
});
