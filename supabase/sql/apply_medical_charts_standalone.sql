-- =============================================================================
-- Chạy TRÊN SUPABASE (Dashboard → SQL Editor): tạo bảng patient_medical_charts
-- khi CLI migration chưa được push / remote chưa có bảng.
-- Idempotent: chạy lại an toàn (policy/trigger được drop + tạo lại).
-- Sau khi Run: reload app; nếu vẫn lỗi cache, đợi ~1 phút hoặc Project Settings → API.
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.patient_medical_charts (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null unique references auth.users (id) on delete cascade,
  display_patient_id text,
  full_name text,
  pronouns text,
  date_of_birth date,
  status text default 'Stable',
  last_visit_at timestamptz,
  last_visit_label text,
  blood_type text,
  height_cm numeric,
  weight_kg numeric,
  diagnoses jsonb not null default '[]'::jsonb,
  medications jsonb not null default '[]'::jsonb,
  allergies jsonb not null default '[]'::jsonb,
  clinical_note text,
  heart_rate_bpm integer,
  temperature_f numeric(5, 2),
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  recent_labs jsonb not null default '[]'::jsonb,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.patient_medical_charts is 'Bệnh án / medical record summary for provider portal.';

create index if not exists patient_medical_charts_patient_user_id_idx
  on public.patient_medical_charts (patient_user_id);

drop trigger if exists patient_medical_charts_set_updated_at on public.patient_medical_charts;
create trigger patient_medical_charts_set_updated_at
  before update on public.patient_medical_charts
  for each row execute function public.set_updated_at();

alter table public.patient_medical_charts enable row level security;

drop policy if exists "medical_charts_select_authenticated" on public.patient_medical_charts;
drop policy if exists "medical_charts_insert_authenticated" on public.patient_medical_charts;
drop policy if exists "medical_charts_update_authenticated" on public.patient_medical_charts;
drop policy if exists "medical_charts_delete_authenticated" on public.patient_medical_charts;

create policy "medical_charts_select_authenticated"
  on public.patient_medical_charts for select
  to authenticated
  using (true);

create policy "medical_charts_insert_authenticated"
  on public.patient_medical_charts for insert
  to authenticated
  with check (true);

create policy "medical_charts_update_authenticated"
  on public.patient_medical_charts for update
  to authenticated
  using (true)
  with check (true);

create policy "medical_charts_delete_authenticated"
  on public.patient_medical_charts for delete
  to authenticated
  using (true);
