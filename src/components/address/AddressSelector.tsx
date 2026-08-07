import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
  type Province,
  type District,
  type Ward,
} from '@/lib/vietnam-provinces-api';

export type AddressData = {
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  streetAddress: string;
};

type AddressSelectorProps = {
  value: AddressData;
  onChange: (value: AddressData) => void;
  disabled?: boolean;
  className?: string;
};

export function AddressSelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: AddressSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    fetchProvinces()
      .then(setProvinces)
      .catch(console.error)
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!value.provinceCode) {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    fetchDistricts(Number(value.provinceCode))
      .then(setDistricts)
      .catch(console.error)
      .finally(() => setLoadingDistricts(false));
  }, [value.provinceCode]);

  useEffect(() => {
    if (!value.districtCode) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    fetchWards(Number(value.districtCode))
      .then(setWards)
      .catch(console.error)
      .finally(() => setLoadingWards(false));
  }, [value.districtCode]);

  const handleProvinceChange = (code: string) => {
    const province = provinces.find((p) => String(p.code) === code);
    onChange({
      ...value,
      provinceCode: code,
      provinceName: province?.name ?? '',
      districtCode: '',
      districtName: '',
      wardCode: '',
      wardName: '',
    });
  };

  const handleDistrictChange = (code: string) => {
    const district = districts.find((d) => String(d.code) === code);
    onChange({
      ...value,
      districtCode: code,
      districtName: district?.name ?? '',
      wardCode: '',
      wardName: '',
    });
  };

  const handleWardChange = (code: string) => {
    const ward = wards.find((w) => String(w.code) === code);
    onChange({
      ...value,
      wardCode: code,
      wardName: ward?.name ?? '',
    });
  };

  const handleStreetAddressChange = (streetAddress: string) => {
    onChange({ ...value, streetAddress });
  };

  return (
    <div className={`grid gap-3 ${className}`}>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor="province"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Tỉnh/Thành phố
          </label>
          <Select
            value={value.provinceCode || undefined}
            onValueChange={handleProvinceChange}
            disabled={disabled || loadingProvinces}
          >
            <SelectTrigger id="province" className="min-h-11 w-full">
              <SelectValue placeholder={loadingProvinces ? 'Đang tải...' : 'Chọn Tỉnh/TP'} />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.code} value={String(p.code)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="district"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Quận/Huyện
          </label>
          <Select
            value={value.districtCode || undefined}
            onValueChange={handleDistrictChange}
            disabled={disabled || !value.provinceCode || loadingDistricts}
          >
            <SelectTrigger id="district" className="min-h-11 w-full">
              <SelectValue placeholder={loadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.code} value={String(d.code)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="ward"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Phường/Xã
          </label>
          <Select
            value={value.wardCode || undefined}
            onValueChange={handleWardChange}
            disabled={disabled || !value.districtCode || loadingWards}
          >
            <SelectTrigger id="ward" className="min-h-11 w-full">
              <SelectValue placeholder={loadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'} />
            </SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem key={w.code} value={String(w.code)}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label
          htmlFor="streetAddress"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Số nhà, tên đường
        </label>
        <input
          id="streetAddress"
          type="text"
          value={value.streetAddress}
          onChange={(e) => handleStreetAddressChange(e.target.value)}
          disabled={disabled}
          className="min-h-11 w-full rounded-lg border bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Số 123, Đường ABC"
        />
      </div>
    </div>
  );
}

export const emptyAddressData: AddressData = {
  provinceCode: '',
  provinceName: '',
  districtCode: '',
  districtName: '',
  wardCode: '',
  wardName: '',
  streetAddress: '',
};
