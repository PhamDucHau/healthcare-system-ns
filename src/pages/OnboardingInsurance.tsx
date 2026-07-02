import { useState } from "react";
import { ScanLine, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import OnboardingActions from "@/components/onboarding/OnboardingActions";
import UploadCard from "@/components/onboarding/UploadCard";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { fetchBhytOcr, mapBhytParsedToInsuranceUpdates } from "@/lib/cccd-ocr";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const OnboardingInsurance = () => {
  const navigate = useNavigate();
  const { data, uploadFiles, updateInsurance, updateInsuranceFromOcr, setCardFrontFile } = useOnboardingForm();
  const [errorMessage, setErrorMessage] = useState("");
  const [isOcrRunning, setIsOcrRunning] = useState(false);

  const handleInsuranceFile = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      setErrorMessage("Insurance card upload must be under 10MB per file.");
      return;
    }

    setErrorMessage("");
    updateInsurance({ cardFrontFileName: file.name });
    setCardFrontFile(file);
  };

  const handleRunBhytOcr = async () => {
    if (!uploadFiles.cardFrontFile) {
      setErrorMessage("Please upload your insurance card image before OCR.");
      return;
    }

    setErrorMessage("");
    setIsOcrRunning(true);
    try {
      const json = await fetchBhytOcr(uploadFiles.cardFrontFile);
      if (!json.parsed || typeof json.parsed !== "object") {
        throw new Error("BHYT OCR response did not include parsed data.");
      }
      updateInsuranceFromOcr(mapBhytParsedToInsuranceUpdates(json.parsed));
      toast.success("BHYT OCR complete", {
        description: "Suggested insurance values have been filled.",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "BHYT OCR failed.";
      setErrorMessage(message);
      toast.error("BHYT OCR failed", { description: message });
    } finally {
      setIsOcrRunning(false);
    }
  };

  const handleNext = () => {
    setErrorMessage("");
    const { provider, memberId, groupNumber, cardFrontFileName } = data.insurance;
    if (!provider || !memberId || !groupNumber || !cardFrontFileName) {
      setErrorMessage("Please complete insurance details and upload your insurance image.");
      return;
    }
    navigate("/onboarding/review");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Coverage Details</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Provide your primary insurance information to support billing and eligibility checks.
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Upload Insurance Card</h2>
        <UploadCard
          id="insuranceFrontUpload"
          title="BHYT Image"
          hint="Tap to capture or upload"
          fileName={data.insurance.cardFrontFileName}
          file={uploadFiles.cardFrontFile}
          onFileSelect={handleInsuranceFile}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => void handleRunBhytOcr()}
            disabled={isOcrRunning || !uploadFiles.cardFrontFile}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            {isOcrRunning ? "Reading BHYT..." : "Run BHYT OCR"}
          </button>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-muted/40 p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="insuranceProvider" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Insurance Provider
            </label>
            <input
              id="insuranceProvider"
              type="text"
              value={data.insurance.provider}
              onChange={(event) => updateInsurance({ provider: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="Search or select provider"
            />
          </div>
          <div>
            <label htmlFor="memberId" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Member ID
            </label>
            <input
              id="memberId"
              type="text"
              value={data.insurance.memberId}
              onChange={(event) => updateInsurance({ memberId: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="ABC123456789"
            />
          </div>
          <div>
            <label htmlFor="groupNumber" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Group Number
            </label>
            <input
              id="groupNumber"
              type="text"
              value={data.insurance.groupNumber}
              onChange={(event) => updateInsurance({ groupNumber: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="GRP98765"
            />
          </div>
          <div>
            <label htmlFor="bhytName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              BHYT Name
            </label>
            <input
              id="bhytName"
              type="text"
              value={data.insurance.bhytName}
              onChange={(event) => updateInsurance({ bhytName: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="Name from BHYT card"
            />
          </div>
          <div>
            <label htmlFor="bhytDob" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              BHYT DOB
            </label>
            <input
              id="bhytDob"
              type="date"
              value={data.insurance.bhytDob}
              onChange={(event) => updateInsurance({ bhytDob: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="bhytGender" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              BHYT Gender
            </label>
            <input
              id="bhytGender"
              type="text"
              value={data.insurance.bhytGender}
              onChange={(event) => updateInsurance({ bhytGender: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="Nam / Nữ"
            />
          </div>
          <div>
            <label htmlFor="bhytKcbCode" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              KCB Code
            </label>
            <input
              id="bhytKcbCode"
              type="text"
              value={data.insurance.bhytKcbCode}
              onChange={(event) => updateInsurance({ bhytKcbCode: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="79-536"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="bhytAddress" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              BHYT Address / Unit
            </label>
            <input
              id="bhytAddress"
              type="text"
              value={data.insurance.bhytAddress}
              onChange={(event) => updateInsurance({ bhytAddress: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="Address or organization on BHYT"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="bhytKcb" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Registered KCB
            </label>
            <input
              id="bhytKcb"
              type="text"
              value={data.insurance.bhytKcb}
              onChange={(event) => updateInsurance({ bhytKcb: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="Primary health care facility"
            />
          </div>
          <div>
            <label htmlFor="bhytValidFrom" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Valid From
            </label>
            <input
              id="bhytValidFrom"
              type="date"
              value={data.insurance.bhytValidFrom}
              onChange={(event) => updateInsurance({ bhytValidFrom: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="bhytFiveYear" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Five Year Date
            </label>
            <input
              id="bhytFiveYear"
              type="date"
              value={data.insurance.bhytFiveYear}
              onChange={(event) => updateInsurance({ bhytFiveYear: event.target.value })}
              className="min-h-11 w-full rounded-xl border bg-background px-4 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          HIPAA Secure Information: Data is protected by AES-256 encryption and never shared with unauthorized third parties.
        </p>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <OnboardingActions
        previousPath="/onboarding/personal"
        nextLabel="Continue to Review"
        onNext={handleNext}
      />
    </div>
  );
};

export default OnboardingInsurance;
