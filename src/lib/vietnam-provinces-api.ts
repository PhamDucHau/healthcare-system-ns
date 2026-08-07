const BASE_URL = 'https://provinces.open-api.vn/api';

export type Province = {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
};

export type District = {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
};

export type Ward = {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  district_code: number;
};

let provincesCache: Province[] | null = null;
const districtsCache = new Map<number, District[]>();
const wardsCache = new Map<number, Ward[]>();

export async function fetchProvinces(): Promise<Province[]> {
  if (provincesCache) return provincesCache;

  const res = await fetch(`${BASE_URL}/p/`);
  if (!res.ok) throw new Error('Failed to fetch provinces');
  const data = await res.json();
  provincesCache = data;
  return data;
}

export async function fetchDistricts(provinceCode: number): Promise<District[]> {
  if (districtsCache.has(provinceCode)) {
    return districtsCache.get(provinceCode)!;
  }

  const res = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
  if (!res.ok) throw new Error('Failed to fetch districts');
  const data = await res.json();
  const districts: District[] = data.districts || [];
  districtsCache.set(provinceCode, districts);
  return districts;
}

export async function fetchWards(districtCode: number): Promise<Ward[]> {
  if (wardsCache.has(districtCode)) {
    return wardsCache.get(districtCode)!;
  }

  const res = await fetch(`${BASE_URL}/d/${districtCode}?depth=2`);
  if (!res.ok) throw new Error('Failed to fetch wards');
  const data = await res.json();
  const wards: Ward[] = data.wards || [];
  wardsCache.set(districtCode, wards);
  return wards;
}

export function buildFullAddress(
  streetAddress: string | null,
  wardName: string | null,
  districtName: string | null,
  provinceName: string | null,
): string {
  return [streetAddress, wardName, districtName, provinceName]
    .filter((s) => s && s.trim())
    .join(', ');
}
