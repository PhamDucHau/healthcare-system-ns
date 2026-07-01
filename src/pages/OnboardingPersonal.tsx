import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import OnboardingActions from "@/components/onboarding/OnboardingActions";
import UploadCard from "@/components/onboarding/UploadCard";
import { fetchCccdOcr, mapCccdParsedToFormUpdates } from "@/lib/cccd-ocr";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";

const pronounOptions = ["He/Him", "She/Her", "They/Them", "Other"];
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const OnboardingPersonal = () => {
  const navigate = useNavigate();
  const { data, uploadFiles, updatePersonal, updateIdentity, setIdFile, setIdBackFile } =
    useOnboardingForm();
  const [errorMessage, setErrorMessage] = useState("");
  const [isOcrRunning, setIsOcrRunning] = useState(false);

  const handleIdentityFront = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      setErrorMessage("The ID file is too large. Please upload a file under 10MB.");
      return;
    }
    setErrorMessage("");
    updateIdentity({ idFileName: file.name });
    setIdFile(file);
  };

  const handleIdentityBack = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      setErrorMessage("The ID file is too large. Please upload a file under 10MB.");
      return;
    }
    setErrorMessage("");
    updateIdentity({ idBackFileName: file.name });
    setIdBackFile(file);
  };

  const handleRunOcr = async () => {
    if (!uploadFiles.idFile || !uploadFiles.idBackFile) {
      setErrorMessage("Upload both the front and back of your ID, then run OCR.");
      return;
    }
    setErrorMessage("");
    setIsOcrRunning(true);
    try {
      const json = await fetchCccdOcr(uploadFiles.idFile, uploadFiles.idBackFile);
      const parsed = json.parsed;
      if (!parsed || typeof parsed !== "object") {
        throw new Error("OCR response did not include parsed data.");
      }
      const { identity, personal } = mapCccdParsedToFormUpdates(parsed);
      updateIdentity(identity);
      updatePersonal(personal);
      toast.success("OCR complete", { description: "Review and edit the suggested fields below." });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "OCR request failed.";
      setErrorMessage(msg);
      toast.error("OCR failed", { description: msg });
    } finally {
      setIsOcrRunning(false);
    }
  };

  const handleNext = () => {
    setErrorMessage("");

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

    if (
      !idFileName ||
      !idBackFileName ||
      !idNumber ||
      !expirationDate ||
      !residentialAddress ||
      !issuedDate ||
      !issuer
    ) {
      setErrorMessage("Please upload both sides of your ID and complete all identity fields.");
      return;
    }

    if (!legalFirstName || !legalLastName || !dateOfBirth || !phoneNumber || !email) {
      setErrorMessage("Please complete all required personal information fields.");
      return;
    }

    navigate("/onboarding/insurance");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Welcome to Rcare Plus</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Let&apos;s start with your identity and personal details to ensure safe and accurate care.
      </p>

      <section className="mt-8 rounded-2xl border bg-card p-5 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">ID Verification</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Upload clear photos of both sides of your CCCD / government ID. Run OCR to suggest the
          fields below, then review and correct as needed.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <UploadCard
            id="identityUploadFront"
            title="Click to upload or drag and drop"
            hint="Government ID (front side)"
            fileName={data.identity.idFileName}
            file={uploadFiles.idFile}
            onFileSelect={handleIdentityFront}
          />
          <UploadCard
            id="identityUploadBack"
            title="Click to upload or drag and drop"
            hint="Government ID (back side)"
            fileName={data.identity.idBackFileName}
            file={uploadFiles.idBackFile}
            onFileSelect={handleIdentityBack}
          />
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            OCR uses your local service{" "}
            <code className="rounded bg-muted px-1 font-mono text-[11px]">/public/ocr/cccd</code>
            . Set <code className="rounded bg-muted px-1 font-mono text-[11px]">VITE_OCR_CCCD_URL</code> if
            it runs on another host.
          </p>
          <button
            type="button"
            onClick={() => void handleRunOcr()}
            disabled={isOcrRunning || !uploadFiles.idFile || !uploadFiles.idBackFile}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            {isOcrRunning ? "Reading ID…" : "Run OCR on ID"}
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border bg-muted/40 p-5 md:p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Auto-filled details from ID
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="idNumber"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              ID Number
            </label>
            <input
              id="idNumber"
              type="text"
              value={data.identity.idNumber}
              onChange={(event) => updateIdentity({ idNumber: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="G-123-5678-9012"
            />
          </div>
          <div>
            <label
              htmlFor="expirationDate"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Expiration Date
            </label>
            <input
              id="expirationDate"
              type="date"
              value={data.identity.expirationDate}
              onChange={(event) => updateIdentity({ expirationDate: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="residentialAddress"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Residential Address
            </label>
            <input
              id="residentialAddress"
              type="text"
              value={data.identity.residentialAddress}
              onChange={(event) => updateIdentity({ residentialAddress: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="123 Care Lane, Suite 400"
            />
          </div>
          <div>
            <label
              htmlFor="issuedDate"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Issued Date
            </label>
            <input
              id="issuedDate"
              type="date"
              value={data.identity.issuedDate}
              onChange={(event) => updateIdentity({ issuedDate: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label
              htmlFor="issuer"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Issuer
            </label>
            <input
              id="issuer"
              type="text"
              value={data.identity.issuer}
              onChange={(event) => updateIdentity({ issuer: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="FL DHSMV"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-5 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Personal Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="legalFirstName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal First Name
            </label>
            <input
              id="legalFirstName"
              type="text"
              required
              value={data.personal.legalFirstName}
              onChange={(event) => updatePersonal({ legalFirstName: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="Enter as it appears on ID"
            />
          </div>
          <div>
            <label htmlFor="legalLastName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal Last Name
            </label>
            <input
              id="legalLastName"
              type="text"
              required
              value={data.personal.legalLastName}
              onChange={(event) => updatePersonal({ legalLastName: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="Enter as it appears on ID"
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              required
              value={data.personal.dateOfBirth}
              onChange={(event) => updatePersonal({ dateOfBirth: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              required
              value={data.personal.phoneNumber}
              onChange={(event) => updatePersonal({ phoneNumber: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="(555) 000-0000"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="emailAddress" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <input
              id="emailAddress"
              type="email"
              required
              value={data.personal.email}
              onChange={(event) => updatePersonal({ email: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="mt-7">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Preferred Pronouns
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {pronounOptions.map((option) => {
              const selected = data.personal.pronouns === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => updatePersonal({ pronouns: option })}
                  className={`min-h-11 rounded-xl border px-4 text-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/40"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Your privacy is our priority. We use bank-level encryption and only share data with your
          licensed care team.
        </p>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <OnboardingActions nextLabel="Continue to Insurance" onNext={handleNext} />
    </div>
  );
};

export default OnboardingPersonal;
