import { useState } from "react";
import { Loader2, ScanLine, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UploadCard from "@/components/onboarding/UploadCard";
import DuplicatePatientAlert from "@/components/common/DuplicatePatientAlert";
import { supabase } from "@/lib/supabase";
import { createAdminUser, listAdminRoles } from "@/lib/admin-api";
import { adminInsertPatientProfile, staffCreatePatientProfile } from "@/lib/admin-appointment-api";
import { checkPatientDuplicate, logDedupAudit, type DupCheckResult } from "@/lib/duplicate-check";
import {
  fetchOcrSingle,
  applyBhytParsedFillEmpty,
  applyCccdParsedFillEmpty,
} from "@/lib/cccd-ocr";

const MAX_SIZE = 10 * 1024 * 1024;

function sanitize(name: string) {
  return name.trim().replace(/[^\w.\-]+/g, "_").slice(0, 120) || "file";
}

type FormData = {
  legalLastName: string; legalFirstName: string; dateOfBirth: string;
  gender: string; phoneNumber: string; email: string;
  idNumber: string; expirationDate: string; issuedDate: string;
  issuer: string; residentialAddress: string;
  provider: string; memberId: string; groupNumber: string;
  bhytName: string; bhytDob: string; bhytGender: string;
  bhytAddress: string; bhytKcb: string; bhytKcbCode: string;
  bhytValidFrom: string; bhytFiveYear: string;
};

const empty: FormData = {
  legalLastName: "", legalFirstName: "", dateOfBirth: "",
  gender: "", phoneNumber: "", email: "",
  idNumber: "", expirationDate: "", issuedDate: "",
  issuer: "", residentialAddress: "",
  provider: "", memberId: "", groupNumber: "",
  bhytName: "", bhytDob: "", bhytGender: "",
  bhytAddress: "", bhytKcb: "", bhytKcbCode: "",
  bhytValidFrom: "", bhytFiveYear: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  portal?: "admin" | "provider";
}

const lc = "mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const fc = "min-h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30";
const fc_err = "border-destructive ring-1 ring-destructive/30";

function F({ label, value, onChange, type = "text", placeholder, col2, required, error }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; col2?: boolean; required?: boolean; error?: string;
}) {
  return (
    <div className={col2 ? "sm:col-span-2" : ""}>
      <label className={lc}>{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={`${fc} ${error ? fc_err : ""}`} />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function AdminNewPatientDialog({ open, onClose, onSuccess, portal = "admin" }: Props) {
  const [form, setForm] = useState<FormData>(empty);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [ocrFront, setOcrFront] = useState(false);
  const [ocrBack, setOcrBack] = useState(false);
  const [ocrBhyt, setOcrBhyt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [dupResult, setDupResult] = useState<DupCheckResult | null>(null);
  const [dupBypassed, setDupBypassed] = useState(false);

  const set = (k: keyof FormData) => (v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const pickFile = (file: File | null, setter: (f: File | null) => void) => {
    if (!file) return;
    if (file.size > MAX_SIZE) { toast.error("File quá lớn (tối đa 10MB)"); return; }
    setter(file);
  };

  const handleClose = () => {
    setForm(empty); setErrors({});
    setDupResult(null); setDupBypassed(false);
    setIdFile(null); setIdBackFile(null); setCardFile(null);
    onClose();
  };

  const runOcr = async (type: "front" | "back" | "bhyt") => {
    const file = type === "front" ? idFile : type === "back" ? idBackFile : cardFile;
    if (!file) return;
    const setter = type === "front" ? setOcrFront : type === "back" ? setOcrBack : setOcrBhyt;
    setter(true);
    try {
      if (type === "bhyt") {
        const json = await fetchOcrSingle(file, "bhyt", "front");
        if (!json.parsed || typeof json.parsed !== "object") throw new Error("OCR không trả về dữ liệu.");
        setForm(p => applyBhytParsedFillEmpty(p, json.parsed));
        toast.success("OCR BHYT hoàn tất");
      } else {
        const json = await fetchOcrSingle(file, "cccd", "front");
        if (!json.parsed || typeof json.parsed !== "object") throw new Error("OCR không trả về dữ liệu.");
        setForm(p => applyCccdParsedFillEmpty(p, json.parsed));
        toast.success(`OCR CCCD ${type === "front" ? "mặt trước" : "mặt sau"} hoàn tất`);
      }
    } catch (e) {
      toast.error("OCR thất bại", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setter(false);
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.legalLastName.trim()) errs.legalLastName = "Bắt buộc";
    if (!form.legalFirstName.trim()) errs.legalFirstName = "Bắt buộc";
    if (!form.dateOfBirth.trim()) errs.dateOfBirth = "Bắt buộc";
    if (!form.phoneNumber.trim()) errs.phoneNumber = "Bắt buộc";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (bypassReason?: string) => {
    if (!validate()) { toast.error("Vui lòng điền đầy đủ các trường bắt buộc"); return; }

    const fullName = `${form.legalLastName.trim()} ${form.legalFirstName.trim()}`;

    if (!dupBypassed) {
      const dup = await checkPatientDuplicate(supabase, {
        cccd: form.idNumber.trim() || undefined,
        phone: form.phoneNumber.trim() || undefined,
        name: fullName,
        dob: form.dateOfBirth.trim() || undefined,
      });

      if (dup.cccdMatchId) {
        setDupResult(dup);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await logDedupAudit(supabase, {
            checkerUserId: user.id,
            checkType: 'cccd',
            normalizedValue: form.idNumber.trim(),
            matchedPatientId: dup.cccdMatchId,
            result: 'blocked',
            context: 'admin_create',
          });
        }
        toast.error('Trùng số CCCD — không thể tạo hồ sơ mới.');
        return;
      }

      if (dup.phoneMatchId || dup.nameDobMatchId) {
        if (!bypassReason) {
          setDupResult(dup);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const checkType = dup.phoneMatchId ? 'phone' as const : 'name_dob' as const;
          await logDedupAudit(supabase, {
            checkerUserId: user.id,
            checkType,
            normalizedValue: checkType === 'phone' ? form.phoneNumber.trim() : fullName,
            matchedPatientId: dup.phoneMatchId ?? dup.nameDobMatchId,
            result: 'bypassed',
            context: 'admin_create',
            bypassReason,
          });
        }
        setDupBypassed(true);
      }
    }

    setSaving(true);
    try {
      const phone = form.phoneNumber.trim();

      let profileId: string;
      let userId: string | null = null;

      if (portal === "provider") {
        const idNumber = form.idNumber.trim();
        const orFilters: string[] = [];
        if (phone) orFilters.push(`phone_number.eq.${phone}`);
        if (idNumber) orFilters.push(`id_number.eq.${idNumber}`);

        if (orFilters.length > 0 && !dupBypassed) {
          const { data: existing } = await supabase
            .from("patient")
            .select("id, legal_last_name, legal_first_name, phone_number, id_number")
            .or(orFilters.join(","))
            .limit(1)
            .maybeSingle();

          if (existing) {
            const name = `${existing.legal_last_name ?? ""} ${existing.legal_first_name ?? ""}`.trim();
            const conflict = existing.phone_number === phone ? `SĐT ${phone}` : `CCCD ${existing.id_number}`;
            throw new Error(`Đã tồn tại hồ sơ bệnh nhân "${name}" với ${conflict}.`);
          }
        }

        // Doctors: create profile directly, no auth user required
        profileId = await staffCreatePatientProfile(
          form.legalFirstName.trim(),
          form.legalLastName.trim(),
          phone || null,
          form.dateOfBirth || null,
          idNumber || null,
        );
      } else {
        // Admin: create auth user first
        const { roles } = await listAdminRoles();
        const patientRole = roles.find(r => r.slug === "patient");
        if (!patientRole) throw new Error("Không tìm thấy role bệnh nhân.");

        const tempEmail = phone
          ? `patient_${phone.replace(/\D/g, "")}@walkin.internal`
          : `patient_${Date.now()}@walkin.internal`;

        const created = await createAdminUser({
          fullName: `${form.legalLastName.trim()} ${form.legalFirstName.trim()}`,
          email: form.email.trim() || tempEmail,
          phone: phone || undefined,
          roleId: patientRole.id,
        });
        userId = created.userId;

        profileId = await adminInsertPatientProfile(
          userId,
          form.legalFirstName.trim(),
          form.legalLastName.trim(),
          phone || null,
          form.dateOfBirth || null,
          form.idNumber.trim() || null,
        );
      }

      // 3. Upload documents if provided
      const ts = Date.now();
      const paths: {
        id_document_storage_path?: string;
        id_document_back_storage_path?: string;
        card_front_storage_path?: string;
      } = {};

      const storagePrefix = userId ?? profileId;
      if (idFile) {
        const path = `${storagePrefix}/id_front_${ts}_${sanitize(idFile.name)}`;
        const { error } = await supabase.storage.from("identity-documents").upload(path, idFile, { upsert: true, cacheControl: "3600" });
        if (error) throw new Error(error.message);
        paths.id_document_storage_path = path;
      }
      if (idBackFile) {
        const path = `${storagePrefix}/id_back_${ts}_${sanitize(idBackFile.name)}`;
        const { error } = await supabase.storage.from("identity-documents").upload(path, idBackFile, { upsert: true, cacheControl: "3600" });
        if (error) throw new Error(error.message);
        paths.id_document_back_storage_path = path;
      }
      if (cardFile) {
        const path = `${storagePrefix}/card_front_${ts}_${sanitize(cardFile.name)}`;
        const { error } = await supabase.storage.from("insurance-cards").upload(path, cardFile, { upsert: true, cacheControl: "3600" });
        if (error) throw new Error(error.message);
        paths.card_front_storage_path = path;
      }

      // 4. Upsert full profile data
      const e2n = (v: string) => v.trim() || null;
      const { error: upsertErr } = await supabase.from("patient").upsert({
        id: profileId,
        user_id: userId,
        legal_first_name: e2n(form.legalFirstName),
        legal_last_name: e2n(form.legalLastName),
        date_of_birth: e2n(form.dateOfBirth),
        phone_number: e2n(form.phoneNumber),
        email_address: e2n(form.email),
        preferred_pronouns: e2n(form.gender),
        id_number: e2n(form.idNumber),
        id_expiration_date: e2n(form.expirationDate),
        id_issued_date: e2n(form.issuedDate),
        id_issuer: e2n(form.issuer),
        residential_address: e2n(form.residentialAddress),
        insurance_provider: e2n(form.provider),
        member_id: e2n(form.memberId),
        group_number: e2n(form.groupNumber),
        bhyt_name: e2n(form.bhytName),
        bhyt_dob: e2n(form.bhytDob),
        bhyt_gender: e2n(form.bhytGender),
        bhyt_address: e2n(form.bhytAddress),
        bhyt_kcb: e2n(form.bhytKcb),
        bhyt_kcb_code: e2n(form.bhytKcbCode),
        bhyt_valid_from: e2n(form.bhytValidFrom),
        bhyt_five_year: e2n(form.bhytFiveYear),
        submitted_at: new Date().toISOString(),
        consent_accepted: true,
        ...paths,
      }, { onConflict: "id" });

      if (upsertErr) throw new Error(upsertErr.message);

      toast.success("Đã tạo hồ sơ bệnh nhân thành công");
      handleClose();
      onSuccess();
    } catch (e) {
      toast.error("Tạo hồ sơ thất bại", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  const ocrRunning = ocrFront || ocrBack || ocrBhyt;
  const hasAnyFile = Boolean(idFile || idBackFile || cardFile);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !saving) handleClose(); }}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundPlus className="h-5 w-5 text-primary" />
            Tạo hồ sơ bệnh nhân mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pb-2">
          {/* Upload section */}
          <section className="rounded-2xl border bg-card p-4">
            <h3 className="mb-1 text-sm font-semibold">Tải ảnh giấy tờ để OCR</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Kéo thả hoặc nhấn để chọn. Hệ thống sẽ tự động trích xuất thông tin.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <UploadCard id="new-id-front" title="Nhấn để tải lên" hint="CCCD — mặt trước"
                file={idFile} onFileSelect={f => pickFile(f, setIdFile)}
                onOcr={() => runOcr("front")} isOcrRunning={ocrFront} />
              <UploadCard id="new-id-back" title="Nhấn để tải lên" hint="CCCD — mặt sau"
                file={idBackFile} onFileSelect={f => pickFile(f, setIdBackFile)}
                onOcr={() => runOcr("back")} isOcrRunning={ocrBack} />
              <UploadCard id="new-card" title="Nhấn để tải lên" hint="Thẻ BHYT (tùy chọn)"
                file={cardFile} onFileSelect={f => pickFile(f, setCardFile)}
                onOcr={() => runOcr("bhyt")} isOcrRunning={ocrBhyt} />
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="button" size="sm" disabled={ocrRunning || !hasAnyFile}
                onClick={() => void (async () => {
                  await runOcr("front");
                  await runOcr("back");
                  await runOcr("bhyt");
                })()}>
                <ScanLine className="mr-1.5 h-3.5 w-3.5" />
                {ocrRunning ? "Đang đọc OCR…" : "OCR tất cả"}
              </Button>
            </div>
          </section>

          {/* Personal info */}
          <section className="rounded-2xl border bg-muted/30 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thông tin cá nhân
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Họ" value={form.legalLastName} onChange={set("legalLastName")}
                required error={errors.legalLastName} />
              <F label="Tên" value={form.legalFirstName} onChange={set("legalFirstName")}
                required error={errors.legalFirstName} />
              <F label="Ngày sinh" value={form.dateOfBirth} onChange={set("dateOfBirth")}
                type="date" required error={errors.dateOfBirth} />
              <F label="Giới tính" value={form.gender} onChange={set("gender")}
                placeholder="Nam / Nữ / Khác" />
              <F label="Số điện thoại" value={form.phoneNumber} onChange={set("phoneNumber")}
                type="tel" placeholder="0912 345 678" required error={errors.phoneNumber} />
              <F label="Email" value={form.email} onChange={set("email")}
                type="email" placeholder="example@email.com" />
            </div>
          </section>

          {/* Identity */}
          <section className="rounded-2xl border bg-muted/30 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Giấy tờ tùy thân (CCCD)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Số CCCD" value={form.idNumber} onChange={set("idNumber")}
                placeholder="G-123-5678-9012" />
              <F label="Ngày hết hạn" value={form.expirationDate} onChange={set("expirationDate")}
                type="date" />
              <F label="Ngày cấp" value={form.issuedDate} onChange={set("issuedDate")} type="date" />
              <F label="Nơi cấp" value={form.issuer} onChange={set("issuer")}
                placeholder="Cục cảnh sát QLHC về TTXH" />
              <F label="Địa chỉ thường trú" value={form.residentialAddress}
                onChange={set("residentialAddress")}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" col2 />
            </div>
          </section>

          {/* Insurance */}
          <section className="rounded-2xl border bg-muted/30 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bảo hiểm y tế (BHYT)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Nhà cung cấp" value={form.provider} onChange={set("provider")} col2 />
              <F label="Mã thành viên / BHYT" value={form.memberId} onChange={set("memberId")}
                placeholder="DN 4 79 791 101 31" />
              <F label="Mã nhóm" value={form.groupNumber} onChange={set("groupNumber")} />
              <F label="Họ tên trên BHYT" value={form.bhytName} onChange={set("bhytName")} />
              <F label="Ngày sinh (BHYT)" value={form.bhytDob} onChange={set("bhytDob")} type="date" />
              <F label="Giới tính" value={form.bhytGender} onChange={set("bhytGender")} placeholder="Nam / Nữ" />
              <F label="Mã KCB" value={form.bhytKcbCode} onChange={set("bhytKcbCode")} />
              <F label="Nơi đăng ký KCB" value={form.bhytKcb} onChange={set("bhytKcb")} />
              <F label="Địa chỉ / đơn vị" value={form.bhytAddress} onChange={set("bhytAddress")} col2 />
              <F label="Hiệu lực từ" value={form.bhytValidFrom} onChange={set("bhytValidFrom")} type="date" />
              <F label="Ngày 5 năm liên tục" value={form.bhytFiveYear} onChange={set("bhytFiveYear")} type="date" />
            </div>
          </section>

          {dupResult && !dupBypassed && (
            <DuplicatePatientAlert
              result={dupResult}
              onBypass={(reason) => void handleSave(reason)}
              onCancel={() => setDupResult(null)}
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <Button variant="outline" onClick={handleClose} disabled={saving}>Hủy</Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo hồ sơ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
