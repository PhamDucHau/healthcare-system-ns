-- Add normalized address fields to patient table for Vietnamese administrative divisions
-- Province (Tỉnh/Thành phố), District (Quận/Huyện), Ward (Phường/Xã), Street address (Số nhà, đường)

alter table public.patient
  add column if not exists province_code text,
  add column if not exists province_name text,
  add column if not exists district_code text,
  add column if not exists district_name text,
  add column if not exists ward_code text,
  add column if not exists ward_name text,
  add column if not exists street_address text;

comment on column public.patient.province_code is 'Vietnamese province/city code (e.g. 01 for Hà Nội)';
comment on column public.patient.province_name is 'Vietnamese province/city name (e.g. Thành phố Hà Nội)';
comment on column public.patient.district_code is 'Vietnamese district code';
comment on column public.patient.district_name is 'Vietnamese district name';
comment on column public.patient.ward_code is 'Vietnamese ward/commune code';
comment on column public.patient.ward_name is 'Vietnamese ward/commune name';
comment on column public.patient.street_address is 'Street number and name (Số nhà, tên đường)';

create index if not exists idx_patient_province_code on public.patient (province_code);
create index if not exists idx_patient_district_code on public.patient (district_code);
