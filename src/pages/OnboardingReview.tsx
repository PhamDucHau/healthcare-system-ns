import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import OnboardingActions from "@/components/onboarding/OnboardingActions";
import { useAuth } from "@/hooks/use-auth";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { submitPatientProfile } from "@/lib/patient-onboarding";
import { supabase } from "@/lib/supabase";

const OnboardingReview = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data, uploadFiles, setAcceptedPrivacy, resetForm } = useOnboardingForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");
    if (!data.acceptedPrivacy) {
      setErrorMessage("Please confirm privacy consent before submitting.");
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      setErrorMessage("You must be signed in to submit your profile.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await submitPatientProfile(supabase, userId, data, uploadFiles);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      toast.error("Could not save profile", { description: error.message });
      return;
    }

    toast.success("Onboarding completed", {
      description: "Your patient profile has been submitted successfully.",
    });
    resetForm();
    navigate("/account/personal");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Review & Confirm</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Verify your details before submitting. You can go back to any step and edit your information.
      </p>

      <div className="mt-8 grid gap-4">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Personal</h2>
          <p className="mt-2 text-sm text-foreground">
            {data.personal.legalFirstName} {data.personal.legalLastName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            DOB: {data.personal.dateOfBirth || "N/A"} · Phone: {data.personal.phoneNumber || "N/A"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Email: {data.personal.email || "N/A"} · Pronouns: {data.personal.pronouns || "N/A"}
          </p>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identity</h2>
          <p className="mt-2 text-sm text-foreground">ID Number: {data.identity.idNumber || "N/A"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Address: {data.identity.residentialAddress || "N/A"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Issued: {data.identity.issuedDate || "N/A"} · Expires: {data.identity.expirationDate || "N/A"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Issuer: {data.identity.issuer || "N/A"} · ID front:{" "}
            {data.identity.idFileName || "Not uploaded"} · ID back:{" "}
            {data.identity.idBackFileName || "Not uploaded"}
          </p>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Insurance</h2>
          <p className="mt-2 text-sm text-foreground">Provider: {data.insurance.provider || "N/A"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Member ID: {data.insurance.memberId || "N/A"} · Group: {data.insurance.groupNumber || "N/A"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            BHYT image: {data.insurance.cardFrontFileName || "Not uploaded"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            BHYT Name: {data.insurance.bhytName || "N/A"} · Gender: {data.insurance.bhytGender || "N/A"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            BHYT DOB: {data.insurance.bhytDob || "N/A"} · Valid from: {data.insurance.bhytValidFrom || "N/A"}
          </p>
        </section>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          We only share your information with licensed providers involved in your care.
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
          I confirm all provided information is accurate and I consent to secure processing for care coordination.
        </label>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Ready for submission once consent is confirmed.
      </div>

      <OnboardingActions
        previousPath="/onboarding/insurance"
        nextLabel="Submit Patient Profile"
        onNext={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default OnboardingReview;
