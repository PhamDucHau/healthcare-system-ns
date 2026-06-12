/** OCR service for Vietnamese CCCD (Citizen ID). */

import type { OnboardingFormData } from "@/hooks/useOnboardingForm";

export type CccdParsed = {
  id?: string;
  name?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  ethnicity?: string;
  hometown?: string;
  address?: string;
  expiry?: string;
  issued?: string;
  extra?: string;
};

export type CccdOcrResponse = {
  type?: string;
  parsed?: CccdParsed;
  raw?: string;
};

export type BhytParsed = {
  id?: string;
  name?: string;
  dob?: string;
  gender?: string;
  address?: string;
  kcb?: string;
  kcb_code?: string;
  valid_from?: string;
  five_year?: string;
};

export type BhytOcrResponse = {
  type?: string;
  parsed?: BhytParsed;
  raw?: string;
};

function getOcrBaseUrl(): string {
  const raw = import.meta.env.VITE_OCR_CCCD_URL;
  const base = (typeof raw === "string" && raw.trim() ? raw.trim() : "http://localhost:3000").replace(/\/$/, "");
  return base;
}

function getOcrServiceUrl(): string {
  const raw = import.meta.env.VITE_OCR_SERVICE_URL;
  return (typeof raw === "string" && raw.trim() ? raw.trim() : "http://187.127.103.1:5000").replace(/\/$/, "");
}

/** Call the OCR service for a single image slot. */
export async function fetchOcrSingle(
  file: File,
  type: "cccd" | "bhyt",
  slot: "front" = "front",
): Promise<CccdOcrResponse & BhytOcrResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  formData.append(slot, file);

  const url = `${getOcrServiceUrl()}/ocr`;
  const res = await fetch(url, { method: "POST", body: formData });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `OCR request failed (${res.status})`);
  }

  return (await res.json()) as CccdOcrResponse & BhytOcrResponse;
}

/** Convert dd/mm/yyyy (or d/m/yyyy) to yyyy-mm-dd for HTML date inputs. */
export function parseDdMmYyyyToIso(value: string): string {
  const t = value.trim();
  if (!t) return "";
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return t;
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return "";
  const dd = m[1].padStart(2, "0");
  const mm = m[2].padStart(2, "0");
  const yyyy = m[3];
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Vietnamese ID: family name usually first token → legal last name;
 * remainder → legal first name (given + middle).
 */
export function splitVietnameseFullName(fullName: string): { legalFirstName: string; legalLastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { legalFirstName: "", legalLastName: "" };
  if (parts.length === 1) return { legalFirstName: "", legalLastName: parts[0] };
  return {
    legalLastName: parts[0],
    legalFirstName: parts.slice(1).join(" "),
  };
}

export async function fetchCccdOcr(
  front: File,
  back: File,
  options?: { extraImage?: File | null },
): Promise<CccdOcrResponse> {
  const formData = new FormData();
  formData.append("front", front);
  formData.append("back", back);
  if (options?.extraImage) {
    formData.append("image", options.extraImage);
  }

  const url = `${getOcrBaseUrl()}/public/ocr/cccd`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `OCR request failed (${res.status})`);
  }

  return (await res.json()) as CccdOcrResponse;
}

export async function fetchBhytOcr(image: File): Promise<BhytOcrResponse> {
  const formData = new FormData();
  formData.append("image", image);

  const url = `${getOcrBaseUrl()}/public/ocr/bhyt`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `BHYT OCR request failed (${res.status})`);
  }

  return (await res.json()) as BhytOcrResponse;
}

/** Maps OCR `parsed` into onboarding field updates (user can edit after). */
export function mapCccdParsedToFormUpdates(parsed: CccdParsed): {
  identity: Partial<OnboardingFormData["identity"]>;
  personal: Partial<OnboardingFormData["personal"]>;
} {
  const identity: Partial<OnboardingFormData["identity"]> = {};
  const personal: Partial<OnboardingFormData["personal"]> = {};

  if (parsed.id?.trim()) identity.idNumber = parsed.id.trim();
  if (parsed.address?.trim()) identity.residentialAddress = parsed.address.trim();
  const expIso = parseDdMmYyyyToIso(parsed.expiry ?? "");
  if (expIso) identity.expirationDate = expIso;
  const issuedIso = parseDdMmYyyyToIso(parsed.issued ?? "");
  if (issuedIso) identity.issuedDate = issuedIso;
  if (parsed.extra?.trim()) identity.issuer = parsed.extra.trim();

  if (parsed.name?.trim()) {
    const { legalFirstName, legalLastName } = splitVietnameseFullName(parsed.name);
    if (legalFirstName) personal.legalFirstName = legalFirstName;
    if (legalLastName) personal.legalLastName = legalLastName;
  }

  const dobIso = parseDdMmYyyyToIso(parsed.dob ?? "");
  if (dobIso) personal.dateOfBirth = dobIso;

  return { identity, personal };
}

export function mapBhytParsedToInsuranceUpdates(parsed: BhytParsed): Partial<OnboardingFormData["insurance"]> {
  const updates: Partial<OnboardingFormData["insurance"]> = {};

  if (parsed.id?.trim()) updates.memberId = parsed.id.trim();
  if (parsed.kcb?.trim()) {
    updates.provider = parsed.kcb.trim();
  } else if (parsed.address?.trim()) {
    updates.provider = parsed.address.trim();
  }
  if (parsed.name?.trim()) updates.bhytName = parsed.name.trim();
  if (parsed.gender?.trim()) updates.bhytGender = parsed.gender.trim();
  if (parsed.kcb?.trim()) updates.bhytKcb = parsed.kcb.trim();
  if (parsed.kcb_code?.trim()) updates.bhytKcbCode = parsed.kcb_code.trim();

  const dobIso = parseDdMmYyyyToIso(parsed.dob ?? "");
  if (dobIso) updates.bhytDob = dobIso;
  const validFromIso = parseDdMmYyyyToIso(parsed.valid_from ?? "");
  if (validFromIso) updates.bhytValidFrom = validFromIso;
  const fiveYearIso = parseDdMmYyyyToIso(parsed.five_year ?? "");
  if (fiveYearIso) updates.bhytFiveYear = fiveYearIso;

  return updates;
}
