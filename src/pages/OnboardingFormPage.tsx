import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ScanLine, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import OnboardingActions from "@/components/onboarding/OnboardingActions";
import UploadCard from "@/components/onboarding/UploadCard";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { useDuplicateCheck } from "@/hooks/useDuplicateCheck";
import {
  fetchBhytOcr,
  fetchCccdOcr,
  mapBhytParsedToInsuranceUpdates,
  mapCccdParsedToFormUpdates,
} from "@/lib/cccd-ocr";
import { submitPatientProfile } from "@/lib/patient-onboarding";
import { supabase } from "@/lib/supabase";

const pronounOptions = ["Anh/Nam", "Chị/Nữ", "Họ/Không xác định", "Khác"];
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const fieldClass =
  "min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const OnboardingFormPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const {
    data,
    uploadFiles,
    updatePersonal,
    updateIdentity,
    updateInsurance,
    setAcceptedPrivacy,
    setIdFile,
    setIdBackFile,
    setCardFrontFile,
    resetForm,
  } = useOnboardingForm();

  const userId = session?.user?.id;

  const {
    dupState, bypassed, checking: isDupChecking,
    isBlocked, hasUnbypassedWarning,
    checkCccd, checkPhone, checkNameDob, checkAll,
    bypassPhone, bypassNameDob,
  } = useDuplicateCheck(userId, "onboarding");

  const [errorMessage, setErrorMessage] = useState("");
  const [isCccdOcrRunning, setIsCccdOcrRunning] = useState(false);
  const [isBhytOcrRunning, setIsBhytOcrRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickFile = (
    file: File | null,
    onMeta: (name: string) => void,
    onStore: (f: File | null) => void,
  ) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      setErrorMessage("File quá lớn. Vui lòng chọn file dưới 10MB.");
      return;
    }
    setErrorMessage("");
    onMeta(file.name);
    onStore(file);
  };

  const handleRunCccdOcr = async () => {
    if (!uploadFiles.idFile || !uploadFiles.idBackFile) {
      setErrorMessage("Vui lòng tải CCCD mặt trước và mặt sau trước khi chạy OCR.");
      return;
    }
    setErrorMessage("");
    setIsCccdOcrRunning(true);
    try {
      const json = await fetchCccdOcr(uploadFiles.idFile, uploadFiles.idBackFile);
      if (!json.parsed || typeof json.parsed !== "object") {
        throw new Error("OCR không trả về dữ liệu parsed.");
      }
      const { identity, personal } = mapCccdParsedToFormUpdates(json.parsed);
      updateIdentity(identity);
      updatePersonal(personal);
      toast.success("OCR CCCD hoàn tất", { description: "Kiểm tra và chỉnh sửa các trường bên dưới." });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "OCR CCCD thất bại.";
      setErrorMessage(msg);
      toast.error("OCR CCCD thất bại", { description: msg });
    } finally {
      setIsCccdOcrRunning(false);
    }
  };

  const handleRunBhytOcr = async () => {
    if (!uploadFiles.cardFrontFile) {
      setErrorMessage("Vui lòng tải ảnh thẻ BHYT trước khi chạy OCR.");
      return;
    }
    setErrorMessage("");
    setIsBhytOcrRunning(true);
    try {
      const json = await fetchBhytOcr(uploadFiles.cardFrontFile);
      if (!json.parsed || typeof json.parsed !== "object") {
        throw new Error("OCR BHYT không trả về dữ liệu parsed.");
      }
      updateInsurance(mapBhytParsedToInsuranceUpdates(json.parsed));
      toast.success("OCR BHYT hoàn tất");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "OCR BHYT thất bại.";
      setErrorMessage(msg);
      toast.error("OCR BHYT thất bại", { description: msg });
    } finally {
      setIsBhytOcrRunning(false);
    }
  };

  const validateForm = (): boolean => {
    const { legalFirstName, legalLastName, dateOfBirth, phoneNumber, email } = data.personal;
    const {
      idNumber,
      expirationDate,
      residentialAddress,
      issuedDate,
      issuer,
      idFileName,
      idBackFileName,
    } = data.identity;
    const { provider, memberId, groupNumber, cardFrontFileName } = data.insurance;

    if (!idFileName || !idBackFileName || !cardFrontFileName) {
      setErrorMessage("Vui lòng tải đủ 3 ảnh: CCCD mặt trước, mặt sau và BHYT.");
      return false;
    }
    if (!idNumber || !expirationDate || !residentialAddress || !issuedDate || !issuer) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin giấy tờ tùy thân.");
      return false;
    }
    if (!legalFirstName || !legalLastName || !dateOfBirth || !phoneNumber || !email) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin cá nhân.");
      return false;
    }
    if (!provider || !memberId || !groupNumber) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin bảo hiểm.");
      return false;
    }
    if (!data.acceptedPrivacy) {
      setErrorMessage("Vui lòng xác nhận đồng ý xử lý dữ liệu trước khi gửi.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    if (!validateForm()) return;

    if (!userId) {
      setErrorMessage("Bạn cần đăng nhập để gửi hồ sơ.");
      return;
    }

    // Final duplicate check before submitting
    const fullName = [data.personal.legalFirstName, data.personal.legalLastName]
      .filter(Boolean).join(" ");
    const finalDup = await checkAll({
      cccd: data.identity.idNumber,
      phone: data.personal.phoneNumber,
      name: fullName,
      dob: data.personal.dateOfBirth,
    });
    if (finalDup.cccdMatchId) {
      setErrorMessage("Số CCCD đã tồn tại trong hệ thống. Không thể tạo hồ sơ mới.");
      return;
    }
    if (
      (finalDup.phoneMatchId && !bypassed.phone) ||
      (finalDup.nameDobMatchId && !bypassed.nameDob)
    ) {
      setErrorMessage("Vui lòng xác nhận các cảnh báo trùng trước khi tiếp tục.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await submitPatientProfile(supabase, userId, data, uploadFiles);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      toast.error("Không lưu được hồ sơ", { description: error.message });
      return;
    }

    toast.success("Hoàn tất đăng ký hồ sơ");
    resetForm();
    navigate("/account");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Chào mừng đến với Qcare Plus
      </h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Tải ảnh CCCD và thẻ BHYT, chạy OCR (nếu có), điền thông tin và gửi một lần.
      </p>

      <section className="mt-8 rounded-2xl border bg-card p-5 md:p-6">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Tải ảnh giấy tờ</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          CCCD mặt trước, CCCD mặt sau và thẻ bảo hiểm y tế (BHYT).
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <UploadCard
            id="identityUploadFront"
            title="Nhấn để tải lên hoặc kéo thả"
            hint="CCCD — mặt trước"
            fileName={data.identity.idFileName}
            file={uploadFiles.idFile}
            onFileSelect={(f) =>
              pickFile(f, (n) => updateIdentity({ idFileName: n }), setIdFile)
            }
          />
          <UploadCard
            id="identityUploadBack"
            title="Nhấn để tải lên hoặc kéo thả"
            hint="CCCD — mặt sau"
            fileName={data.identity.idBackFileName}
            file={uploadFiles.idBackFile}
            onFileSelect={(f) =>
              pickFile(f, (n) => updateIdentity({ idBackFileName: n }), setIdBackFile)
            }
          />
          <UploadCard
            id="insuranceFrontUpload"
            title="Nhấn để tải lên hoặc kéo thả"
            hint="Bảo hiểm y tế (BHYT)"
            fileName={data.insurance.cardFrontFileName}
            file={uploadFiles.cardFrontFile}
            onFileSelect={(f) =>
              pickFile(f, (n) => updateInsurance({ cardFrontFileName: n }), setCardFrontFile)
            }
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={() => void handleRunCccdOcr()}
            disabled={isCccdOcrRunning || !uploadFiles.idFile || !uploadFiles.idBackFile}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-5 text-sm font-semibold text-primary transition-opacity hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50"
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            {isCccdOcrRunning ? "Đang đọc CCCD…" : "Đọc OCR CCCD"}
          </button>
          <button
            type="button"
            onClick={() => void handleRunBhytOcr()}
            disabled={isBhytOcrRunning || !uploadFiles.cardFrontFile}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            {isBhytOcrRunning ? "Đang đọc BHYT…" : "Đọc OCR BHYT"}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          OCR sử dụng{" "}
          <code className="rounded bg-muted px-1 font-mono text-[11px]">/public/ocr/cccd</code> và{" "}
          <code className="rounded bg-muted px-1 font-mono text-[11px]">/public/ocr/bhyt</code>.
          Đặt <code className="rounded bg-muted px-1 font-mono text-[11px]">VITE_OCR_CCCD_URL</code> nếu
          cần.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border bg-muted/40 p-5 md:p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Thông tin tự động từ CCCD
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="idNumber" className={labelClass}>Số CCCD</label>
            <input
              id="idNumber" type="text"
              value={data.identity.idNumber}
              onChange={(e) => updateIdentity({ idNumber: e.target.value })}
              onBlur={() => void checkCccd(data.identity.idNumber)}
              className={`${fieldClass} ${dupState.cccdMatchId ? "border-destructive ring-1 ring-destructive/30" : ""}`}
              placeholder="G-123-5678-9012"
            />
            {dupState.cccdMatchId ? (
              <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span><strong>Trùng CCCD.</strong> Số CCCD này đã có hồ sơ trong hệ thống. Không thể tạo mới.</span>
              </div>
            ) : null}
          </div>
          <div>
            <label htmlFor="expirationDate" className={labelClass}>Ngày hết hạn</label>
            <input id="expirationDate" type="date" value={data.identity.expirationDate} onChange={(e) => updateIdentity({ expirationDate: e.target.value })} className={fieldClass} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="residentialAddress" className={labelClass}>Địa chỉ thường trú</label>
            <input id="residentialAddress" type="text" value={data.identity.residentialAddress} onChange={(e) => updateIdentity({ residentialAddress: e.target.value })} className={fieldClass} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
          </div>
          <div>
            <label htmlFor="issuedDate" className={labelClass}>Ngày cấp</label>
            <input id="issuedDate" type="date" value={data.identity.issuedDate} onChange={(e) => updateIdentity({ issuedDate: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="issuer" className={labelClass}>Nơi cấp</label>
            <input id="issuer" type="text" value={data.identity.issuer} onChange={(e) => updateIdentity({ issuer: e.target.value })} className={fieldClass} placeholder="Cục cảnh sát QLHC về TTXH" />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-5 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Thông tin cá nhân</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="legalFirstName" className={labelClass}>Họ (theo giấy tờ)</label>
            <input
              id="legalFirstName" type="text" required
              value={data.personal.legalFirstName}
              onChange={(e) => updatePersonal({ legalFirstName: e.target.value })}
              onBlur={() => {
                const name = [data.personal.legalFirstName, data.personal.legalLastName].filter(Boolean).join(" ");
                void checkNameDob(name, data.personal.dateOfBirth);
              }}
              className={fieldClass} placeholder="Nhập đúng như trên giấy tờ"
            />
          </div>
          <div>
            <label htmlFor="legalLastName" className={labelClass}>Tên (theo giấy tờ)</label>
            <input
              id="legalLastName" type="text" required
              value={data.personal.legalLastName}
              onChange={(e) => updatePersonal({ legalLastName: e.target.value })}
              onBlur={() => {
                const name = [data.personal.legalFirstName, data.personal.legalLastName].filter(Boolean).join(" ");
                void checkNameDob(name, data.personal.dateOfBirth);
              }}
              className={fieldClass} placeholder="Nhập đúng như trên giấy tờ"
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className={labelClass}>Ngày sinh</label>
            <input
              id="dateOfBirth" type="date" required
              value={data.personal.dateOfBirth}
              onChange={(e) => updatePersonal({ dateOfBirth: e.target.value })}
              onBlur={() => {
                const name = [data.personal.legalFirstName, data.personal.legalLastName].filter(Boolean).join(" ");
                void checkNameDob(name, data.personal.dateOfBirth);
              }}
              className={`${fieldClass} ${dupState.nameDobMatchId && !bypassed.nameDob ? "border-warning ring-1 ring-warning/30" : ""}`}
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className={labelClass}>Số điện thoại</label>
            <input
              id="phoneNumber" type="tel" required
              value={data.personal.phoneNumber}
              onChange={(e) => updatePersonal({ phoneNumber: e.target.value })}
              onBlur={() => void checkPhone(data.personal.phoneNumber)}
              className={`${fieldClass} ${dupState.phoneMatchId && !bypassed.phone ? "border-warning ring-1 ring-warning/30" : ""}`}
              placeholder="0912 345 678"
            />
            {dupState.phoneMatchId && !bypassed.phone ? (
              <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong>Cảnh báo: </strong>Số điện thoại này đã tồn tại trong hệ thống.{" "}
                  <button type="button" onClick={bypassPhone} className="font-semibold underline hover:no-underline">
                    Vẫn tạo mới
                  </button>
                </span>
              </div>
            ) : null}
          </div>
          {dupState.nameDobMatchId && !bypassed.nameDob ? (
            <div className="md:col-span-2 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <strong>Cảnh báo: </strong>Họ tên + ngày sinh này đã khớp với một hồ sơ trong hệ thống.{" "}
                <button type="button" onClick={bypassNameDob} className="font-semibold underline hover:no-underline">
                  Vẫn tạo mới
                </button>
              </span>
            </div>
          ) : null}
          <div className="md:col-span-2">
            <label htmlFor="emailAddress" className={labelClass}>Địa chỉ Email</label>
            <input id="emailAddress" type="email" required value={data.personal.email} onChange={(e) => updatePersonal({ email: e.target.value })} className={fieldClass} placeholder="ten@example.com" />
          </div>
        </div>
        <div className="mt-6">
          <p className={labelClass}>Đại từ xưng hô</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {pronounOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updatePersonal({ pronouns: option })}
                className={`min-h-11 rounded-xl border px-4 text-sm transition-colors ${
                  data.personal.pronouns === option
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-muted/40 p-5 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Thông tin bảo hiểm</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="insuranceProvider" className={labelClass}>Đơn vị bảo hiểm</label>
            <input id="insuranceProvider" type="text" value={data.insurance.provider} onChange={(e) => updateInsurance({ provider: e.target.value })} className={fieldClass} placeholder="Tìm hoặc chọn đơn vị bảo hiểm" />
          </div>
          <div>
            <label htmlFor="memberId" className={labelClass}>Số thẻ BHYT</label>
            <input id="memberId" type="text" value={data.insurance.memberId} onChange={(e) => updateInsurance({ memberId: e.target.value })} className={fieldClass} placeholder="HS4012345678901" />
          </div>
          <div>
            <label htmlFor="groupNumber" className={labelClass}>Mã nhóm</label>
            <input id="groupNumber" type="text" value={data.insurance.groupNumber} onChange={(e) => updateInsurance({ groupNumber: e.target.value })} className={fieldClass} placeholder="GRP98765" />
          </div>
          <div>
            <label htmlFor="bhytName" className={labelClass}>Họ tên (BHYT)</label>
            <input id="bhytName" type="text" value={data.insurance.bhytName} onChange={(e) => updateInsurance({ bhytName: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="bhytDob" className={labelClass}>Ngày sinh (BHYT)</label>
            <input id="bhytDob" type="date" value={data.insurance.bhytDob} onChange={(e) => updateInsurance({ bhytDob: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="bhytGender" className={labelClass}>Giới tính (BHYT)</label>
            <input id="bhytGender" type="text" value={data.insurance.bhytGender} onChange={(e) => updateInsurance({ bhytGender: e.target.value })} className={fieldClass} placeholder="Nam / Nữ" />
          </div>
          <div>
            <label htmlFor="bhytKcbCode" className={labelClass}>Mã KCB ban đầu</label>
            <input id="bhytKcbCode" type="text" value={data.insurance.bhytKcbCode} onChange={(e) => updateInsurance({ bhytKcbCode: e.target.value })} className={fieldClass} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="bhytAddress" className={labelClass}>Địa chỉ / Đơn vị (BHYT)</label>
            <input id="bhytAddress" type="text" value={data.insurance.bhytAddress} onChange={(e) => updateInsurance({ bhytAddress: e.target.value })} className={fieldClass} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="bhytKcb" className={labelClass}>Nơi đăng ký KCB ban đầu</label>
            <input id="bhytKcb" type="text" value={data.insurance.bhytKcb} onChange={(e) => updateInsurance({ bhytKcb: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="bhytValidFrom" className={labelClass}>Có giá trị từ ngày</label>
            <input id="bhytValidFrom" type="date" value={data.insurance.bhytValidFrom} onChange={(e) => updateInsurance({ bhytValidFrom: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="bhytFiveYear" className={labelClass}>Ngày đủ 5 năm liên tục</label>
            <input id="bhytFiveYear" type="date" value={data.insurance.bhytFiveYear} onChange={(e) => updateInsurance({ bhytFiveYear: e.target.value })} className={fieldClass} />
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Quyền riêng tư của bạn là ưu tiên hàng đầu của chúng tôi. Dữ liệu được mã hóa cấp độ ngân hàng và chỉ chia sẻ với đội ngũ chăm sóc sức khỏe được cấp phép.
        </p>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-dashed bg-card p-4">
        <Checkbox
          id="privacyConsent"
          checked={data.acceptedPrivacy}
          onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
          className="mt-0.5"
        />
        <label htmlFor="privacyConsent" className="cursor-pointer text-sm text-muted-foreground">
          Tôi xác nhận tất cả thông tin đã cung cấp là chính xác và đồng ý cho phép xử lý dữ liệu an toàn để phục vụ công tác chăm sóc sức khỏe.
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        Sẵn sàng gửi hồ sơ khi đã tải đủ 3 ảnh và xác nhận đồng ý.
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <OnboardingActions
        nextLabel="Gửi hồ sơ bệnh nhân"
        onNext={handleSubmit}
        isSubmitting={isSubmitting || isDupChecking}
        disabled={isBlocked || hasUnbypassedWarning}
      />
    </div>
  );
};

export default OnboardingFormPage;
