import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const upload = vi.fn();
const upsert = vi.fn();
const createAdminUser = vi.fn();
const listAdminRoles = vi.fn();
const adminInsertPatientProfile = vi.fn();
const checkPatientDuplicate = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: () => ({ upsert: (...args: unknown[]) => upsert(...args) }),
    storage: { from: () => ({ upload: (...args: unknown[]) => upload(...args) }) },
  },
}));

vi.mock("@/lib/admin-api", () => ({
  createAdminUser: (...args: unknown[]) => createAdminUser(...args),
  listAdminRoles: (...args: unknown[]) => listAdminRoles(...args),
}));

vi.mock("@/lib/admin-appointment-api", () => ({
  adminInsertPatientProfile: (...args: unknown[]) => adminInsertPatientProfile(...args),
  staffCreatePatientProfile: vi.fn(),
}));

vi.mock("@/lib/duplicate-check", () => ({
  checkPatientDuplicate: (...args: unknown[]) => checkPatientDuplicate(...args),
  logDedupAudit: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

import AdminNewPatientDialog from "@/components/admin/patients/AdminNewPatientDialog";

function fillRequiredTextFields() {
  fireEvent.change(document.getElementById("legalLastName")!, { target: { value: "Nguyễn" } });
  fireEvent.change(document.getElementById("legalFirstName")!, { target: { value: "An" } });
  fireEvent.change(document.getElementById("dateOfBirth")!, { target: { value: "1990-01-15" } });
  fireEvent.change(document.getElementById("phoneNumber")!, { target: { value: "0912345678" } });
}

describe("AdminNewPatientDialog optional document uploads", () => {
  beforeEach(() => {
    upload.mockReset();
    upsert.mockReset();
    createAdminUser.mockReset();
    listAdminRoles.mockReset();
    adminInsertPatientProfile.mockReset();
    checkPatientDuplicate.mockReset();

    upsert.mockResolvedValue({ error: null });
    createAdminUser.mockResolvedValue({ userId: "user-1" });
    listAdminRoles.mockResolvedValue({ roles: [{ id: "role-patient", slug: "patient" }] });
    adminInsertPatientProfile.mockResolvedValue("profile-1");
    checkPatientDuplicate.mockResolvedValue({
      cccdMatchId: null,
      phoneMatchId: null,
      nameDobMatchId: null,
    });
  });

  it("labels CCCD front, CCCD back, and BHYT uploads as optional", () => {
    render(<AdminNewPatientDialog open onClose={() => undefined} onSuccess={() => undefined} />);

    expect(screen.getByText(/CCCD — mặt trước \(tùy chọn\)/)).toBeInTheDocument();
    expect(screen.getByText(/CCCD — mặt sau \(tùy chọn\)/)).toBeInTheDocument();
    expect(screen.getByText(/Thẻ BHYT \(tùy chọn\)/)).toBeInTheDocument();
  });

  it("should create a patient record when no CCCD or BHYT images are uploaded", async () => {
    const onSuccess = vi.fn();
    render(<AdminNewPatientDialog open onClose={() => undefined} onSuccess={onSuccess} />);

    fillRequiredTextFields();
    fireEvent.click(screen.getByRole("button", { name: "Tạo hồ sơ" }));

    await waitFor(() => expect(createAdminUser).toHaveBeenCalled());
    expect(adminInsertPatientProfile).toHaveBeenCalledWith(
      "user-1",
      "An",
      "Nguyễn",
      "0912345678",
      "1990-01-15",
      null,
    );
    expect(upsert).toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
    expect(screen.queryByText(/Vui lòng tải ảnh/)).not.toBeInTheDocument();
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it("should offer only Nam and Nữ gender options without Anh/Chị or Khác", async () => {
    Element.prototype.hasPointerCapture = () => false;
    Element.prototype.setPointerCapture = () => undefined;
    Element.prototype.releasePointerCapture = () => undefined;
    Element.prototype.scrollIntoView = () => undefined;

    render(<AdminNewPatientDialog open onClose={() => undefined} onSuccess={() => undefined} />);

    const triggers = screen.getAllByRole("combobox");
    expect(triggers.length).toBeGreaterThanOrEqual(2);

    triggers[0].focus();
    fireEvent.keyDown(triggers[0], { key: "ArrowDown" });

    const options = await screen.findAllByRole("option", { hidden: true });
    const labels = options.map((option) => option.textContent?.trim());
    expect(labels).toEqual(["Nam", "Nữ"]);
    expect(labels).not.toContain("Khác");
    expect(labels.some((label) => label?.includes("Anh") || label?.includes("Chị"))).toBe(false);
  });
});
