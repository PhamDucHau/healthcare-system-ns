import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "qcare_onboarding_draft";

type PersonalData = {
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  pronouns: string;
};

type IdentityData = {
  idNumber: string;
  expirationDate: string;
  residentialAddress: string;
  issuedDate: string;
  issuer: string;
  idFileName: string;
  idBackFileName: string;
};

type InsuranceData = {
  provider: string;
  memberId: string;
  groupNumber: string;
  cardFrontFileName: string;
  bhytName: string;
  bhytDob: string;
  bhytGender: string;
  bhytAddress: string;
  bhytKcb: string;
  bhytKcbCode: string;
  bhytValidFrom: string;
  bhytFiveYear: string;
};

export type OnboardingFormData = {
  personal: PersonalData;
  identity: IdentityData;
  insurance: InsuranceData;
  acceptedPrivacy: boolean;
};

const defaultData: OnboardingFormData = {
  personal: {
    legalFirstName: "",
    legalLastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    pronouns: "",
  },
  identity: {
    idNumber: "",
    expirationDate: "",
    residentialAddress: "",
    issuedDate: "",
    issuer: "",
    idFileName: "",
    idBackFileName: "",
  },
  insurance: {
    provider: "",
    memberId: "",
    groupNumber: "",
    cardFrontFileName: "",
    bhytName: "",
    bhytDob: "",
    bhytGender: "",
    bhytAddress: "",
    bhytKcb: "",
    bhytKcbCode: "",
    bhytValidFrom: "",
    bhytFiveYear: "",
  },
  acceptedPrivacy: false,
};

export type PatientOnboardingUploadFiles = {
  idFile: File | null;
  idBackFile: File | null;
  cardFrontFile: File | null;
};

type OnboardingContextValue = {
  data: OnboardingFormData;
  uploadFiles: PatientOnboardingUploadFiles;
  updatePersonal: (updates: Partial<PersonalData>) => void;
  updateIdentity: (updates: Partial<IdentityData>) => void;
  updateInsurance: (updates: Partial<InsuranceData>) => void;
  setAcceptedPrivacy: (value: boolean) => void;
  setIdFile: (file: File | null) => void;
  setIdBackFile: (file: File | null) => void;
  setCardFrontFile: (file: File | null) => void;
  resetForm: () => void;
};

const OnboardingFormContext = createContext<OnboardingContextValue | null>(null);

function parseStoredDraft(rawDraft: string | null): OnboardingFormData {
  if (!rawDraft) {
    return defaultData;
  }

  try {
    const parsed = JSON.parse(rawDraft) as Partial<OnboardingFormData>;
    return {
      ...defaultData,
      ...parsed,
      personal: { ...defaultData.personal, ...parsed.personal },
      identity: { ...defaultData.identity, ...parsed.identity },
      insurance: { ...defaultData.insurance, ...parsed.insurance },
    };
  } catch {
    return defaultData;
  }
}

const emptyUploadFiles: PatientOnboardingUploadFiles = {
  idFile: null,
  idBackFile: null,
  cardFrontFile: null,
};

export const OnboardingFormProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingFormData>(() => {
    if (typeof window === "undefined") {
      return defaultData;
    }
    return parseStoredDraft(window.localStorage.getItem(STORAGE_KEY));
  });

  const [uploadFiles, setUploadFiles] = useState<PatientOnboardingUploadFiles>(emptyUploadFiles);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      data,
      uploadFiles,
      updatePersonal: (updates) => {
        setData((prev) => ({ ...prev, personal: { ...prev.personal, ...updates } }));
      },
      updateIdentity: (updates) => {
        setData((prev) => ({ ...prev, identity: { ...prev.identity, ...updates } }));
      },
      updateInsurance: (updates) => {
        setData((prev) => ({ ...prev, insurance: { ...prev.insurance, ...updates } }));
      },
      setAcceptedPrivacy: (value) => {
        setData((prev) => ({ ...prev, acceptedPrivacy: value }));
      },
      setIdFile: (file) => {
        setUploadFiles((prev) => ({ ...prev, idFile: file }));
      },
      setIdBackFile: (file) => {
        setUploadFiles((prev) => ({ ...prev, idBackFile: file }));
      },
      setCardFrontFile: (file) => {
        setUploadFiles((prev) => ({ ...prev, cardFrontFile: file }));
      },
      resetForm: () => {
        setData(defaultData);
        setUploadFiles(emptyUploadFiles);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [data, uploadFiles],
  );

  return <OnboardingFormContext.Provider value={value}>{children}</OnboardingFormContext.Provider>;
};

export const useOnboardingForm = () => {
  const context = useContext(OnboardingFormContext);
  if (!context) {
    throw new Error("useOnboardingForm must be used within OnboardingFormProvider.");
  }
  return context;
};
