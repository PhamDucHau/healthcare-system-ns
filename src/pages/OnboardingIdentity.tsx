import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import OnboardingActions from "@/components/onboarding/OnboardingActions";
import UploadCard from "@/components/onboarding/UploadCard";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

const OnboardingIdentity = () => {
  const navigate = useNavigate();
  const { data, updateIdentity, setIdFile, setIdBackFile } = useOnboardingForm();
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleNext = () => {
    setErrorMessage("");
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
    navigate("/onboarding/insurance");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">ID Verification</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Upload a clear government-issued ID so we can verify your information securely.
      </p>

      <section className="mt-8">
        <div className="grid gap-4 md:grid-cols-2">
          <UploadCard
            id="identityUploadFront"
            title="Click to upload or drag and drop"
            hint="Government ID (front side)"
            fileName={data.identity.idFileName}
            onFileSelect={handleIdentityFront}
          />
          <UploadCard
            id="identityUploadBack"
            title="Click to upload or drag and drop"
            hint="Government ID (back side)"
            fileName={data.identity.idBackFileName}
            onFileSelect={handleIdentityBack}
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-muted/40 p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Auto-filled details from ID
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="idNumber" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ID Number
            </label>
            <input
              id="idNumber"
              type="text"
              value={data.identity.idNumber}
              onChange={(event) => updateIdentity({ idNumber: event.target.value })}
              className="min-h-11 w-full rounded-lg border bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="G-123-5678-9012"
            />
          </div>
          <div>
            <label htmlFor="expirationDate" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Expiration Date
            </label>
            <input
              id="expirationDate"
              type="date"
              value={data.identity.expirationDate}
              onChange={(event) => updateIdentity({ expirationDate: event.target.value })}
              className="min-h-11 w-full rounded-lg border bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="residentialAddress" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Residential Address
            </label>
            <input
              id="residentialAddress"
              type="text"
              value={data.identity.residentialAddress}
              onChange={(event) => updateIdentity({ residentialAddress: event.target.value })}
              className="min-h-11 w-full rounded-lg border bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="123 Care Lane, Suite 400"
            />
          </div>
          <div>
            <label htmlFor="issuedDate" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Issued Date
            </label>
            <input
              id="issuedDate"
              type="date"
              value={data.identity.issuedDate}
              onChange={(event) => updateIdentity({ issuedDate: event.target.value })}
              className="min-h-11 w-full rounded-lg border bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="issuer" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Issuer
            </label>
            <input
              id="issuer"
              type="text"
              value={data.identity.issuer}
              onChange={(event) => updateIdentity({ issuer: event.target.value })}
              className="min-h-11 w-full rounded-lg border bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="FL DHSMV"
            />
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Your privacy is our priority. We use bank-level encryption and only share data with your licensed care team.
        </p>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <OnboardingActions
        previousPath="/onboarding/personal"
        nextLabel="Continue to Insurance"
        onNext={handleNext}
      />
    </div>
  );
};

export default OnboardingIdentity;
