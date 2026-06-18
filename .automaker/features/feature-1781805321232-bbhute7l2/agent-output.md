
🔧 Tool: Task
Input: {
  "description": "Explore healthcare codebase structure",
  "prompt": "Explore the healthcare-system-ns codebase to understand its structure, particularly:\n1. The overall project structure (NestJS backend?)\n2. Existing modules, controllers, services patterns\n3. Database/ORM setup (TypeORM, Prisma?)\n4. Existing entities/models related to appointments, patients\n5. Authentication patterns\n6. Any existing pre-consultation or medical declaration modules\n\nFocus on finding:\n- src/ directory structure\n- Module patterns used\n- DTOs patterns\n- Entity/Model definitions\n- Controller and Service patterns\n\nBe thorough in exploring the codebase architecture.",
  "subagent_type": "Explore"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2 -type f -name \"package.json\" | head -5",
  "description": "Find package.json files to identify project structure"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/",
  "description": "List root directory contents"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/package.json"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/",
  "description": "List src directory contents"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/supabase/",
  "description": "Check supabase directory structure"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2 -type d -name \"api\" -o -type d -name \"backend\" -o -type d -name \"server\" -o -type d -name \"nest*\" 2>/dev/null | head -20",
  "description": "Search for backend directories"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/supabase/functions/",
  "description": "List Supabase functions directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/supabase/migrations/",
  "description": "List database migrations"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src -type d | head -20",
  "description": "Find all src subdirectories"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src -type f -name \"*.ts\" -o -name \"*.tsx\" | grep -E \"(types|hooks)\" | head -20",
  "description": "Find type definitions and hooks"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/types"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/types/",
  "description": "List type definitions"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/types/appointment.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/types/patient-medical-chart.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/types/questionnaire.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/supabase/migrations/20260618100000_questionnaires.sql"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/supabase/migrations/20260209150000_create_patient.sql"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/supabase/migrations/20260609100000_appointments.sql"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/hooks/",
  "description": "List hooks directory"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/hooks/use-auth.tsx"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/components/auth/",
  "description": "List auth components"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/components -type f -name \"*.tsx\" | head -30",
  "description": "Find all component files"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/lib -type f -name \"*.ts\" -o -name \"*.tsx\" | sort",
  "description": "Find all lib files"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/lib/",
  "description": "List lib directory"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/lib/appointment-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/lib/questionnaire-api.ts",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/lib/supabase.ts"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src -type f -name \"*.ts\" -o -name \"*.tsx\" | xargs grep -l \"health\\|declaration\\|consultation\\|questionnaire\" 2>/dev/null | head -20",
  "description": "Find files related to health declarations"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/components/patient-records/",
  "description": "List patient records components"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/components/onboarding/",
  "description": "List onboarding components"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/types/patient-portal.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/pages/admin/clinical-logic/QuestionnaireBuilderPage.tsx",
  "limit": 100
}

🔧 Tool: Bash
Input: {
  "command": "grep -r \"health.*declaration\\|pre.*consultation\" /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null | head -10",
  "description": "Search for health declaration references"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/supabase/migrations/20260209140000_create_patient_medical_charts.sql"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/pages -name \"*.tsx\" | head -20",
  "description": "Find all page components"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/README.md"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/App.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/lib/patient-onboarding.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/types/vital-signs.ts"
}

🔧 Tool: Bash
Input: {
  "command": "head -50 /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/supabase/migrations/20260613100000_vital_signs.sql",
  "description": "Check vital signs schema"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/pages/ | grep -i onboard",
  "description": "Find onboarding pages"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2 -name \"*health*\" -o -name \"*declaration*\" -o -name \"*form*\" 2>/dev/null | grep -v node_modules | grep -v \".git\"",
  "description": "Search for health/declaration related files"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/hooks/useOnboardingForm.tsx",
  "limit": 80
}

🔧 Tool: Bash
Input: {
  "command": "head -100 /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/supabase/migrations/20260609110000_master_data.sql",
  "description": "Check master data schema"
}

🔧 Tool: Bash
Input: {
  "command": "find /projects/healthcare-system-ns/.worktrees/feature-save-the-health-declaration-information-v2/src/lib -name \"*api.ts\" | xargs wc -l | sort -n",
  "description": "Count lines in API files"
}
Now let me read the context images to understand the UI requirements better:

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.automaker/features/feature-1781805321232-bbhute7l2/images/pasted-image-2026-06-18T17-53-26-283Z-1781805206488.png"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.automaker/features/feature-1781805321232-bbhute7l2/images/pasted-image-2026-06-18T17-53-57-642Z-1781805237843.png"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/.automaker/features/feature-1781805321232-bbhute7l2/images/pasted-image-2026-06-18T17-54-10-262Z-1781805250475.png"
}
Now I have a clear understanding of the feature requirements from the images:
1. **Image 1**: Sequence diagram showing the flow - T-2h reminder, form loading, auto-save draft, submit, flags calculation, doctor view
2. **Image 2**: Patient form UI showing Part 1/5 (Current Symptoms) with chief_complaint, symptom_duration, pain_scale slider, and symptom_tags
3. **Image 3**: Doctor's EMR view showing allergy warning banner, pain level indicator, and organized pre-consultation data

Let me explore the existing codebase to understand the structure better before implementing:

🔧 Tool: Glob
Input: {
  "pattern": "**/src/**/*.ts",
  "path": "/projects/healthcare-system-ns"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/supabase/migrations/*.sql",
  "path": "/projects/healthcare-system-ns"
}
Let me read some key files to understand the patterns and current structure:

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/types/appointment.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/lib/appointment-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/supabase/migrations/20260609100000_appointments.sql"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create database migration for pre_consultations table",
      "status": "in_progress",
      "activeForm": "Creating database migration for pre_consultations table"
    },
    {
      "content": "Create TypeScript types for pre-consultation",
      "status": "pending",
      "activeForm": "Creating TypeScript types for pre-consultation"
    },
    {
      "content": "Create API functions for pre-consultation CRUD",
      "status": "pending",
      "activeForm": "Creating API functions for pre-consultation CRUD"
    },
    {
      "content": "Create patient pre-consultation form component",
      "status": "pending",
      "activeForm": "Creating patient pre-consultation form component"
    },
    {
      "content": "Create hook for managing pre-consultation form state",
      "status": "pending",
      "activeForm": "Creating hook for managing pre-consultation form state"
    },
    {
      "content": "Create pre-consultation page for patients",
      "status": "pending",
      "activeForm": "Creating pre-consultation page for patients"
    },
    {
      "content": "Create doctor view component for pre-consultation data",
      "status": "pending",
      "activeForm": "Creating doctor view component for pre-consultation data"
    },
    {
      "content": "Add routing and integrate with appointments",
      "status": "pending",
      "activeForm": "Adding routing and integrating with appointments"
    }
  ]
}
Let me read a few more files to understand the existing patterns better:

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/lib/vital-signs-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/types/vital-signs.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/supabase/migrations/20260613100000_vital_signs.sql"
}
Now I have a good understanding of the existing patterns. Let me also look at the page components to understand the UI patterns:

🔧 Tool: Glob
Input: {
  "pattern": "**/src/pages/**/*.tsx",
  "path": "/projects/healthcare-system-ns"
}
Let me read the Appointments page and the App.tsx to understand routing patterns:

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/pages/Appointments.tsx"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/App.tsx",
  "path": "/projects/healthcare-system-ns/src"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/App.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/AppointmentsContent.tsx"
}
Now I have a complete understanding of the codebase. Let me start implementing the pre-consultation feature. I'll begin with the database migration:

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/supabase/migrations/20260618200000_pre_consultations.sql",
  "content": "-- FR-022: Pre-Consultation Health Declaration\n-- Table: pre_consultations\n-- APIs: create, update (auto-save), submit\n-- Flags: drug_allergy, severe_pain for EMR highlighting\n\n-- ─── Pre-Consultation Status ─────────────────────────────────────────────────\n\nCREATE TYPE public.pre_consultation_status AS ENUM (\n  'DRAFT',      -- Patient is filling in the form (auto-save)\n  'SUBMITTED'   -- Patient has completed and submitted (immutable)\n);\n\n-- ─── Pre-Consultation Table ──────────────────────────────────────────────────\n\nCREATE TABLE public.pre_consultations (\n  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  appointment_id    UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,\n  patient_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n  status            public.pre_consultation_status NOT NULL DEFAULT 'DRAFT',\n\n  -- ═══ Nhóm 1: Triệu chứng hiện tại (Current Symptoms) ═══\n  chief_complaint       TEXT,                    -- Lý do đến khám (required for submit)\n  symptom_duration      INTEGER,                 -- Số lượng (e.g., 3)\n  symptom_duration_unit TEXT,                    -- Đơn vị: 'days' | 'weeks' | 'months'\n  pain_scale            INTEGER CHECK (pain_scale IS NULL OR (pain_scale >= 0 AND pain_scale <= 10)),\n  symptom_tags          TEXT[],                  -- Multi-select: ['fever', 'cough', 'shortness_of_breath', ...]\n\n  -- ═══ Nhóm 2: Bệnh sử (Medical History) ═══\n  medical_history       JSONB DEFAULT '[]'::jsonb,\n    -- Array of { condition: string, details?: string }\n    -- e.g., [{\"condition\": \"diabetes\", \"details\": \"Type 2, 5 years\"}, {\"condition\": \"hypertension\"}]\n  surgical_history      TEXT,\n  family_history        JSONB DEFAULT '[]'::jsonb,\n    -- Array of { condition: string, relation?: string }\n    -- e.g., [{\"condition\": \"heart_disease\", \"relation\": \"father\"}]\n\n  -- ═══ Nhóm 3: Thuốc đang dùng (Current Medications) ═══\n  current_medications   JSONB DEFAULT '[]'::jsonb,\n    -- Array of { name: string, dose: string, frequency: string }\n    -- e.g., [{\"name\": \"Amlodipine\", \"dose\": \"5mg\", \"frequency\": \"1v/ngày\"}]\n  otc_supplements       TEXT,    -- Over-the-counter drugs and supplements\n\n  -- ═══ Nhóm 4: Dị ứng (Allergies) ═══\n  drug_allergies        JSONB DEFAULT '[]'::jsonb,\n    -- Array of { drug: string, reaction: string }\n    -- e.g., [{\"drug\": \"Penicillin\", \"reaction\": \"Sốc phản vệ\"}]\n  food_allergies        JSONB DEFAULT '[]'::jsonb,\n    -- Array of { food: string, reaction: string }\n\n  -- ═══ Nhóm 5: Lối sống (Lifestyle) ═══\n  smoking               TEXT,    -- 'never' | 'former' | 'current'\n  smoking_frequency     TEXT,    -- e.g., '10 điếu/ngày' (only if smoking = 'current')\n  alcohol               TEXT,    -- 'never' | 'occasionally' | 'regularly'\n  alcohol_frequency     TEXT,    -- e.g., '2-3 lần/tuần'\n  exercise              TEXT,    -- 'never' | 'occasionally' | 'regularly'\n  exercise_frequency    TEXT,    -- e.g., '30 phút/ngày'\n\n  -- ═══ Computed Flags (RULE-022d, RULE-022e) ═══\n  flags                 JSONB DEFAULT '{}'::jsonb,\n    -- { drug_allergy: boolean, severe_pain: boolean }\n    -- Computed on submit based on drug_allergies and pain_scale\n\n  -- ═══ Metadata ═══\n  submitted_at          TIMESTAMPTZ,             -- When form was submitted (null = draft)\n  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),\n  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCOMMENT ON TABLE public.pre_consultations IS\n  'Pre-consultation health declarations (FR-022). Patients fill before appointment. Immutable after SUBMITTED (RULE-022c).';\n\nCOMMENT ON COLUMN public.pre_consultations.flags IS\n  'Computed warning flags: drug_allergy (RULE-022d), severe_pain >= 7 (RULE-022e)';\n\n-- ─── Indexes ─────────────────────────────────────────────────────────────────\n\nCREATE INDEX pre_consult_patient_idx ON public.pre_consultations (patient_id, status);\nCREATE INDEX pre_consult_appointment_idx ON public.pre_consultations (appointment_id);\nCREATE INDEX pre_consult_flags_idx ON public.pre_consultations USING GIN (flags) WHERE status = 'SUBMITTED';\n\n-- ─── Updated At Trigger ──────────────────────────────────────────────────────\n\nCREATE TRIGGER pre_consultations_set_updated_at\n  BEFORE UPDATE ON public.pre_consultations\n  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();\n\n-- ─── RLS ─────────────────────────────────────────────────────────────────────\n\nALTER TABLE public.pre_consultations ENABLE ROW LEVEL SECURITY;\n\n-- Patients can read and write their own pre-consultations\nCREATE POLICY \"pre_consult_patient_select\" ON public.pre_consultations\n  FOR SELECT\n  USING (patient_id = auth.uid());\n\nCREATE POLICY \"pre_consult_patient_insert\" ON public.pre_consultations\n  FOR INSERT\n  WITH CHECK (patient_id = auth.uid());\n\nCREATE POLICY \"pre_consult_patient_update\" ON public.pre_consultations\n  FOR UPDATE\n  USING (patient_id = auth.uid() AND status = 'DRAFT')\n  WITH CHECK (patient_id = auth.uid() AND status = 'DRAFT');\n\n-- Doctors can read all pre-consultations\nCREATE POLICY \"pre_consult_doctor_select\" ON public.pre_consultations\n  FOR SELECT\n  USING (\n    EXISTS (\n      SELECT 1 FROM public.user_profiles\n      WHERE user_id = auth.uid() AND role = 'doctor'\n    )\n  );\n\n-- Staff can read all pre-consultations\nCREATE POLICY \"pre_consult_staff_select\" ON public.pre_consultations\n  FOR SELECT\n  USING (\n    EXISTS (\n      SELECT 1 FROM public.user_profiles\n      WHERE user_id = auth.uid() AND role = 'staff'\n    )\n  );\n\n-- Admin has full access\nCREATE POLICY \"pre_consult_admin_all\" ON public.pre_consultations\n  FOR ALL\n  USING (\n    EXISTS (\n      SELECT 1 FROM public.user_profiles\n      WHERE user_id = auth.uid() AND role = 'admin'\n    )\n  )\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM public.user_profiles\n      WHERE user_id = auth.uid() AND role = 'admin'\n    )\n  );\n\n-- ─── RPC: create_pre_consultation ────────────────────────────────────────────\n-- Creates a new draft pre-consultation for an appointment\n-- RULE-022a: Only for CONFIRMED appointments, not EMERGENCY\n\nCREATE OR REPLACE FUNCTION public.create_pre_consultation(\n  p_appointment_id UUID\n) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$\nDECLARE\n  v_user_id       UUID;\n  v_appt_status   public.appointment_status;\n  v_appt_patient  UUID;\n  v_existing_id   UUID;\n  v_new_id        UUID;\nBEGIN\n  v_user_id := auth.uid();\n  IF v_user_id IS NULL THEN\n    RAISE EXCEPTION 'UNAUTHORIZED' USING errcode = 'P0001';\n  END IF;\n\n  -- Check appointment exists and belongs to user\n  SELECT status, patient_id INTO v_appt_status, v_appt_patient\n  FROM public.appointments\n  WHERE id = p_appointment_id;\n\n  IF NOT FOUND THEN\n    RAISE EXCEPTION 'APPOINTMENT_NOT_FOUND' USING errcode = 'P0002';\n  END IF;\n\n  IF v_appt_patient != v_user_id THEN\n    RAISE EXCEPTION 'UNAUTHORIZED' USING errcode = 'P0001';\n  END IF;\n\n  -- RULE-022a: Only CONFIRMED appointments (not EMERGENCY)\n  IF v_appt_status != 'CONFIRMED' THEN\n    RAISE EXCEPTION 'INVALID_APPOINTMENT_STATUS: Only CONFIRMED appointments can have pre-consultation' USING errcode = 'P0003';\n  END IF;\n\n  -- Check if pre-consultation already exists\n  SELECT id INTO v_existing_id\n  FROM public.pre_consultations\n  WHERE appointment_id = p_appointment_id;\n\n  IF FOUND THEN\n    RETURN v_existing_id;  -- Return existing one (idempotent)\n  END IF;\n\n  -- Create new draft\n  INSERT INTO public.pre_consultations (appointment_id, patient_id)\n  VALUES (p_appointment_id, v_user_id)\n  RETURNING id INTO v_new_id;\n\n  RETURN v_new_id;\nEND;\n$$;\n\n-- ─── RPC: update_pre_consultation ────────────────────────────────────────────\n-- Updates draft pre-consultation (auto-save during form fill)\n-- RULE-022b: Cannot update after SUBMITTED\n\nCREATE OR REPLACE FUNCTION public.update_pre_consultation(\n  p_id                    UUID,\n  p_chief_complaint       TEXT      DEFAULT NULL,\n  p_symptom_duration      INTEGER   DEFAULT NULL,\n  p_symptom_duration_unit TEXT      DEFAULT NULL,\n  p_pain_scale            INTEGER   DEFAULT NULL,\n  p_symptom_tags          TEXT[]    DEFAULT NULL,\n  p_medical_history       JSONB     DEFAULT NULL,\n  p_surgical_history      TEXT      DEFAULT NULL,\n  p_family_history        JSONB     DEFAULT NULL,\n  p_current_medications   JSONB     DEFAULT NULL,\n  p_otc_supplements       TEXT      DEFAULT NULL,\n  p_drug_allergies        JSONB     DEFAULT NULL,\n  p_food_allergies        JSONB     DEFAULT NULL,\n  p_smoking               TEXT      DEFAULT NULL,\n  p_smoking_frequency     TEXT      DEFAULT NULL,\n  p_alcohol               TEXT      DEFAULT NULL,\n  p_alcohol_frequency     TEXT      DEFAULT NULL,\n  p_exercise              TEXT      DEFAULT NULL,\n  p_exercise_frequency    TEXT      DEFAULT NULL\n) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$\nDECLARE\n  v_user_id     UUID;\n  v_status      public.pre_consultation_status;\n  v_patient_id  UUID;\nBEGIN\n  v_user_id := auth.uid();\n  IF v_user_id IS NULL THEN\n    RAISE EXCEPTION 'UNAUTHORIZED' USING errcode = 'P0001';\n  END IF;\n\n  -- Get current status and verify ownership\n  SELECT status, patient_id INTO v_status, v_patient_id\n  FROM public.pre_consultations\n  WHERE id = p_id\n  FOR UPDATE;\n\n  IF NOT FOUND THEN\n    RAISE EXCEPTION 'NOT_FOUND' USING errcode = 'P0002';\n  END IF;\n\n  IF v_patient_id != v_user_id THEN\n    RAISE EXCEPTION 'UNAUTHORIZED' USING errcode = 'P0001';\n  END IF;\n\n  -- RULE-022b: Cannot update after SUBMITTED\n  IF v_status = 'SUBMITTED' THEN\n    RAISE EXCEPTION 'ALREADY_SUBMITTED: Cannot modify submitted pre-consultation' USING errcode = 'P0004';\n  END IF;\n\n  -- Update all provided fields\n  UPDATE public.pre_consultations SET\n    chief_complaint       = COALESCE(p_chief_complaint, chief_complaint),\n    symptom_duration      = COALESCE(p_symptom_duration, symptom_duration),\n    symptom_duration_unit = COALESCE(p_symptom_duration_unit, symptom_duration_unit),\n    pain_scale            = COALESCE(p_pain_scale, pain_scale),\n    symptom_tags          = COALESCE(p_symptom_tags, symptom_tags),\n    medical_history       = COALESCE(p_medical_history, medical_history),\n    surgical_history      = COALESCE(p_surgical_history, surgical_history),\n    family_history        = COALESCE(p_family_history, family_history),\n    current_medications   = COALESCE(p_current_medications, current_medications),\n    otc_supplements       = COALESCE(p_otc_supplements, otc_supplements),\n    drug_allergies        = COALESCE(p_drug_allergies, drug_allergies),\n    food_allergies        = COALESCE(p_food_allergies, food_allergies),\n    smoking               = COALESCE(p_smoking, smoking),\n    smoking_frequency     = COALESCE(p_smoking_frequency, smoking_frequency),\n    alcohol               = COALESCE(p_alcohol, alcohol),\n    alcohol_frequency     = COALESCE(p_alcohol_frequency, alcohol_frequency),\n    exercise              = COALESCE(p_exercise, exercise),\n    exercise_frequency    = COALESCE(p_exercise_frequency, exercise_frequency)\n  WHERE id = p_id;\n\n  RETURN p_id;\nEND;\n$$;\n\n-- ─── RPC: submit_pre_consultation ────────────────────────────────────────────\n-- Finalizes pre-consultation, validates required fields, computes flags\n-- RULE-022d: drug_allergies >= 1 → flag\n-- RULE-022e: pain_scale >= 7 → flag\n\nCREATE OR REPLACE FUNCTION public.submit_pre_consultation(\n  p_id UUID\n) RETURNS TABLE (\n  id             UUID,\n  flags          JSONB\n) LANGUAGE plpgsql SECURITY DEFINER AS $$\nDECLARE\n  v_user_id           UUID;\n  v_status            public.pre_consultation_status;\n  v_patient_id        UUID;\n  v_chief_complaint   TEXT;\n  v_symptom_duration  INTEGER;\n  v_pain_scale        INTEGER;\n  v_drug_allergies    JSONB;\n  v_computed_flags    JSONB;\nBEGIN\n  v_user_id := auth.uid();\n  IF v_user_id IS NULL THEN\n    RAISE EXCEPTION 'UNAUTHORIZED' USING errcode = 'P0001';\n  END IF;\n\n  -- Get current data and verify ownership\n  SELECT\n    pc.status,\n    pc.patient_id,\n    pc.chief_complaint,\n    pc.symptom_duration,\n    pc.pain_scale,\n    pc.drug_allergies\n  INTO\n    v_status,\n    v_patient_id,\n    v_chief_complaint,\n    v_symptom_duration,\n    v_pain_scale,\n    v_drug_allergies\n  FROM public.pre_consultations pc\n  WHERE pc.id = p_id\n  FOR UPDATE;\n\n  IF NOT FOUND THEN\n    RAISE EXCEPTION 'NOT_FOUND' USING errcode = 'P0002';\n  END IF;\n\n  IF v_patient_id != v_user_id THEN\n    RAISE EXCEPTION 'UNAUTHORIZED' USING errcode = 'P0001';\n  END IF;\n\n  IF v_status = 'SUBMITTED' THEN\n    RAISE EXCEPTION 'ALREADY_SUBMITTED' USING errcode = 'P0004';\n  END IF;\n\n  -- Validate required fields\n  IF v_chief_complaint IS NULL OR v_chief_complaint = '' THEN\n    RAISE EXCEPTION 'VALIDATION_ERROR: chief_complaint is required' USING errcode = 'P0010';\n  END IF;\n\n  IF v_symptom_duration IS NULL THEN\n    RAISE EXCEPTION 'VALIDATION_ERROR: symptom_duration is required' USING errcode = 'P0011';\n  END IF;\n\n  -- Compute flags (RULE-022d, RULE-022e)\n  v_computed_flags := jsonb_build_object(\n    'drug_allergy', (v_drug_allergies IS NOT NULL AND jsonb_array_length(v_drug_allergies) > 0),\n    'severe_pain', (v_pain_scale IS NOT NULL AND v_pain_scale >= 7)\n  );\n\n  -- Update to SUBMITTED with computed flags\n  UPDATE public.pre_consultations SET\n    status       = 'SUBMITTED',\n    flags        = v_computed_flags,\n    submitted_at = now()\n  WHERE pre_consultations.id = p_id;\n\n  RETURN QUERY SELECT p_id, v_computed_flags;\nEND;\n$$;\n\n-- ─── RPC: get_pre_consultation_by_appointment ────────────────────────────────\n-- Gets pre-consultation data for a specific appointment (doctor EMR view)\n\nCREATE OR REPLACE FUNCTION public.get_pre_consultation_by_appointment(\n  p_appointment_id UUID\n) RETURNS TABLE (\n  id                    UUID,\n  appointment_id        UUID,\n  patient_id            UUID,\n  status                public.pre_consultation_status,\n  chief_complaint       TEXT,\n  symptom_duration      INTEGER,\n  symptom_duration_unit TEXT,\n  pain_scale            INTEGER,\n  symptom_tags          TEXT[],\n  medical_history       JSONB,\n  surgical_history      TEXT,\n  family_history        JSONB,\n  current_medications   JSONB,\n  otc_supplements       TEXT,\n  drug_allergies        JSONB,\n  food_allergies        JSONB,\n  smoking               TEXT,\n  smoking_frequency     TEXT,\n  alcohol               TEXT,\n  alcohol_frequency     TEXT,\n  exercise              TEXT,\n  exercise_frequency    TEXT,\n  flags                 JSONB,\n  submitted_at          TIMESTAMPTZ,\n  created_at            TIMESTAMPTZ,\n  updated_at            TIMESTAMPTZ\n) LANGUAGE plpgsql SECURITY DEFINER AS $$\nDECLARE\n  v_user_id   UUID;\n  v_role      TEXT;\nBEGIN\n  v_user_id := auth.uid();\n  IF v_user_id IS NULL THEN\n    RAISE EXCEPTION 'UNAUTHORIZED' USING errcode = 'P0001';\n  END IF;\n\n  -- Check if user is doctor/staff/admin or the patient themselves\n  SELECT role INTO v_role\n  FROM public.user_profiles\n  WHERE user_id = v_user_id;\n\n  -- For patients, verify they own the appointment\n  IF v_role = 'patient' OR v_role IS NULL THEN\n    IF NOT EXISTS (\n      SELECT 1 FROM public.appointments a\n      WHERE a.id = p_appointment_id AND a.patient_id = v_user_id\n    ) THEN\n      RAISE EXCEPTION 'UNAUTHORIZED' USING errcode = 'P0001';\n    END IF;\n  END IF;\n\n  RETURN QUERY\n  SELECT\n    pc.id,\n    pc.appointment_id,\n    pc.patient_id,\n    pc.status,\n    pc.chief_complaint,\n    pc.symptom_duration,\n    pc.symptom_duration_unit,\n    pc.pain_scale,\n    pc.symptom_tags,\n    pc.medical_history,\n    pc.surgical_history,\n    pc.family_history,\n    pc.current_medications,\n    pc.otc_supplements,\n    pc.drug_allergies,\n    pc.food_allergies,\n    pc.smoking,\n    pc.smoking_frequency,\n    pc.alcohol,\n    pc.alcohol_frequency,\n    pc.exercise,\n    pc.exercise_frequency,\n    pc.flags,\n    pc.submitted_at,\n    pc.created_at,\n    pc.updated_at\n  FROM public.pre_consultations pc\n  WHERE pc.appointment_id = p_appointment_id;\nEND;\n$$;\n\n-- ─── Realtime (doctor screen updates when patient submits) ───────────────────\n\nALTER PUBLICATION supabase_realtime ADD TABLE public.pre_consultations;\nALTER TABLE public.pre_consultations REPLICA IDENTITY FULL;\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create database migration for pre_consultations table",
      "status": "completed",
      "activeForm": "Creating database migration for pre_consultations table"
    },
    {
      "content": "Create TypeScript types for pre-consultation",
      "status": "in_progress",
      "activeForm": "Creating TypeScript types for pre-consultation"
    },
    {
      "content": "Create API functions for pre-consultation CRUD",
      "status": "pending",
      "activeForm": "Creating API functions for pre-consultation CRUD"
    },
    {
      "content": "Create patient pre-consultation form component",
      "status": "pending",
      "activeForm": "Creating patient pre-consultation form component"
    },
    {
      "content": "Create hook for managing pre-consultation form state",
      "status": "pending",
      "activeForm": "Creating hook for managing pre-consultation form state"
    },
    {
      "content": "Create pre-consultation page for patients",
      "status": "pending",
      "activeForm": "Creating pre-consultation page for patients"
    },
    {
      "content": "Create doctor view component for pre-consultation data",
      "status": "pending",
      "activeForm": "Creating doctor view component for pre-consultation data"
    },
    {
      "content": "Add routing and integrate with appointments",
      "status": "pending",
      "activeForm": "Adding routing and integrating with appointments"
    }
  ]
}
Now let me create the TypeScript types:

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/types/pre-consultation.ts",
  "content": "/**\n * FR-022: Pre-Consultation Health Declaration Types\n * Allows patients to fill health declaration before appointment\n */\n\nexport type PreConsultationStatus = 'DRAFT' | 'SUBMITTED';\n\n// ─── Medical History ─────────────────────────────────────────────────────────\n\nexport type MedicalHistoryItem = {\n  condition: string;    // e.g., 'diabetes', 'hypertension', 'heart_disease'\n  details?: string;     // e.g., 'Type 2, 5 years'\n};\n\nexport type FamilyHistoryItem = {\n  condition: string;\n  relation?: string;    // e.g., 'father', 'mother', 'sibling'\n};\n\n// ─── Medications ─────────────────────────────────────────────────────────────\n\nexport type MedicationItem = {\n  name: string;         // e.g., 'Amlodipine'\n  dose: string;         // e.g., '5mg'\n  frequency: string;    // e.g., '1v/ngày'\n};\n\n// ─── Allergies ───────────────────────────────────────────────────────────────\n\nexport type DrugAllergyItem = {\n  drug: string;         // e.g., 'Penicillin'\n  reaction: string;     // e.g., 'Sốc phản vệ'\n};\n\nexport type FoodAllergyItem = {\n  food: string;\n  reaction: string;\n};\n\n// ─── Flags (Computed on Submit) ──────────────────────────────────────────────\n\nexport type PreConsultationFlags = {\n  drug_allergy: boolean;  // RULE-022d: drug_allergies >= 1\n  severe_pain: boolean;   // RULE-022e: pain_scale >= 7\n};\n\n// ─── Symptom Duration Unit ───────────────────────────────────────────────────\n\nexport type SymptomDurationUnit = 'days' | 'weeks' | 'months';\n\n// ─── Lifestyle Options ───────────────────────────────────────────────────────\n\nexport type SmokingStatus = 'never' | 'former' | 'current';\nexport type AlcoholStatus = 'never' | 'occasionally' | 'regularly';\nexport type ExerciseStatus = 'never' | 'occasionally' | 'regularly';\n\n// ─── Full Pre-Consultation Record ────────────────────────────────────────────\n\nexport type PreConsultation = {\n  id: string;\n  appointment_id: string;\n  patient_id: string;\n  status: PreConsultationStatus;\n\n  // Nhóm 1: Triệu chứng hiện tại\n  chief_complaint: string | null;\n  symptom_duration: number | null;\n  symptom_duration_unit: SymptomDurationUnit | null;\n  pain_scale: number | null;\n  symptom_tags: string[];\n\n  // Nhóm 2: Bệnh sử\n  medical_history: MedicalHistoryItem[];\n  surgical_history: string | null;\n  family_history: FamilyHistoryItem[];\n\n  // Nhóm 3: Thuốc đang dùng\n  current_medications: MedicationItem[];\n  otc_supplements: string | null;\n\n  // Nhóm 4: Dị ứng\n  drug_allergies: DrugAllergyItem[];\n  food_allergies: FoodAllergyItem[];\n\n  // Nhóm 5: Lối sống\n  smoking: SmokingStatus | null;\n  smoking_frequency: string | null;\n  alcohol: AlcoholStatus | null;\n  alcohol_frequency: string | null;\n  exercise: ExerciseStatus | null;\n  exercise_frequency: string | null;\n\n  // Computed\n  flags: PreConsultationFlags;\n  submitted_at: string | null;\n  created_at: string;\n  updated_at: string;\n};\n\n// ─── Form Data (for editing) ─────────────────────────────────────────────────\n\nexport type PreConsultationFormData = {\n  // Nhóm 1: Triệu chứng hiện tại\n  chief_complaint: string;\n  symptom_duration: number | null;\n  symptom_duration_unit: SymptomDurationUnit;\n  pain_scale: number;\n  symptom_tags: string[];\n\n  // Nhóm 2: Bệnh sử\n  medical_history: MedicalHistoryItem[];\n  surgical_history: string;\n  family_history: FamilyHistoryItem[];\n\n  // Nhóm 3: Thuốc đang dùng\n  current_medications: MedicationItem[];\n  otc_supplements: string;\n\n  // Nhóm 4: Dị ứng\n  drug_allergies: DrugAllergyItem[];\n  food_allergies: FoodAllergyItem[];\n\n  // Nhóm 5: Lối sống\n  smoking: SmokingStatus;\n  smoking_frequency: string;\n  alcohol: AlcoholStatus;\n  alcohol_frequency: string;\n  exercise: ExerciseStatus;\n  exercise_frequency: string;\n};\n\n// ─── API Input Types ─────────────────────────────────────────────────────────\n\nexport type CreatePreConsultationInput = {\n  appointment_id: string;\n};\n\nexport type UpdatePreConsultationInput = Partial<{\n  chief_complaint: string;\n  symptom_duration: number;\n  symptom_duration_unit: SymptomDurationUnit;\n  pain_scale: number;\n  symptom_tags: string[];\n  medical_history: MedicalHistoryItem[];\n  surgical_history: string;\n  family_history: FamilyHistoryItem[];\n  current_medications: MedicationItem[];\n  otc_supplements: string;\n  drug_allergies: DrugAllergyItem[];\n  food_allergies: FoodAllergyItem[];\n  smoking: SmokingStatus;\n  smoking_frequency: string;\n  alcohol: AlcoholStatus;\n  alcohol_frequency: string;\n  exercise: ExerciseStatus;\n  exercise_frequency: string;\n}>;\n\nexport type SubmitPreConsultationResult = {\n  id: string;\n  flags: PreConsultationFlags;\n};\n\n// ─── Form Steps ──────────────────────────────────────────────────────────────\n\nexport type PreConsultationStep =\n  | 'symptoms'\n  | 'medical_history'\n  | 'medications'\n  | 'allergies'\n  | 'lifestyle';\n\nexport const PRE_CONSULTATION_STEPS: PreConsultationStep[] = [\n  'symptoms',\n  'medical_history',\n  'medications',\n  'allergies',\n  'lifestyle',\n];\n\nexport const STEP_LABELS: Record<PreConsultationStep, string> = {\n  symptoms: 'Triệu chứng hiện tại',\n  medical_history: 'Bệnh sử',\n  medications: 'Thuốc đang dùng',\n  allergies: 'Dị ứng',\n  lifestyle: 'Lối sống',\n};\n\nexport const STEP_NUMBERS: Record<PreConsultationStep, number> = {\n  symptoms: 1,\n  medical_history: 2,\n  medications: 3,\n  allergies: 4,\n  lifestyle: 5,\n};\n\n// ─── Symptom Tags Options ────────────────────────────────────────────────────\n\nexport const SYMPTOM_TAG_OPTIONS = [\n  { value: 'fever', label: 'Sốt' },\n  { value: 'cough', label: 'Ho' },\n  { value: 'shortness_of_breath', label: 'Khó thở' },\n  { value: 'fatigue', label: 'Mệt' },\n  { value: 'nausea', label: 'Buồn nôn' },\n  { value: 'palpitations', label: 'Hồi hộp' },\n  { value: 'headache', label: 'Đau đầu' },\n  { value: 'dizziness', label: 'Chóng mặt' },\n  { value: 'chest_pain', label: 'Đau ngực' },\n  { value: 'abdominal_pain', label: 'Đau bụng' },\n] as const;\n\n// ─── Medical History Condition Options ───────────────────────────────────────\n\nexport const MEDICAL_CONDITION_OPTIONS = [\n  { value: 'diabetes', label: 'Tiểu đường' },\n  { value: 'hypertension', label: 'Cao huyết áp' },\n  { value: 'heart_disease', label: 'Tim mạch' },\n  { value: 'asthma', label: 'Hen suyễn' },\n  { value: 'stroke', label: 'Đột quỵ' },\n  { value: 'cancer', label: 'Ung thư' },\n  { value: 'kidney_disease', label: 'Bệnh thận' },\n  { value: 'liver_disease', label: 'Bệnh gan' },\n  { value: 'thyroid', label: 'Tuyến giáp' },\n] as const;\n\n// ─── Duration Unit Labels ────────────────────────────────────────────────────\n\nexport const DURATION_UNIT_LABELS: Record<SymptomDurationUnit, string> = {\n  days: 'Ngày',\n  weeks: 'Tuần',\n  months: 'Tháng',\n};\n\n// ─── Lifestyle Labels ────────────────────────────────────────────────────────\n\nexport const SMOKING_LABELS: Record<SmokingStatus, string> = {\n  never: 'Không bao giờ',\n  former: 'Đã bỏ',\n  current: 'Đang hút',\n};\n\nexport const ALCOHOL_LABELS: Record<AlcoholStatus, string> = {\n  never: 'Không bao giờ',\n  occasionally: 'Thỉnh thoảng',\n  regularly: 'Thường xuyên',\n};\n\nexport const EXERCISE_LABELS: Record<ExerciseStatus, string> = {\n  never: 'Không bao giờ',\n  occasionally: 'Thỉnh thoảng',\n  regularly: 'Thường xuyên',\n};\n\n// ─── Default Form Data ───────────────────────────────────────────────────────\n\nexport const DEFAULT_FORM_DATA: PreConsultationFormData = {\n  chief_complaint: '',\n  symptom_duration: null,\n  symptom_duration_unit: 'days',\n  pain_scale: 0,\n  symptom_tags: [],\n  medical_history: [],\n  surgical_history: '',\n  family_history: [],\n  current_medications: [],\n  otc_supplements: '',\n  drug_allergies: [],\n  food_allergies: [],\n  smoking: 'never',\n  smoking_frequency: '',\n  alcohol: 'never',\n  alcohol_frequency: '',\n  exercise: 'never',\n  exercise_frequency: '',\n};\n\n// ─── Validation ──────────────────────────────────────────────────────────────\n\nexport type PreConsultationValidationErrors = Partial<{\n  chief_complaint: string;\n  symptom_duration: string;\n}>;\n\nexport function validatePreConsultation(\n  data: PreConsultationFormData\n): PreConsultationValidationErrors {\n  const errors: PreConsultationValidationErrors = {};\n\n  if (!data.chief_complaint || data.chief_complaint.trim() === '') {\n    errors.chief_complaint = 'Vui lòng nhập lý do đến khám';\n  }\n\n  if (data.symptom_duration === null || data.symptom_duration <= 0) {\n    errors.symptom_duration = 'Vui lòng nhập thời gian triệu chứng';\n  }\n\n  return errors;\n}\n\nexport function isFormValid(data: PreConsultationFormData): boolean {\n  const errors = validatePreConsultation(data);\n  return Object.keys(errors).length === 0;\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create database migration for pre_consultations table",
      "status": "completed",
      "activeForm": "Creating database migration for pre_consultations table"
    },
    {
      "content": "Create TypeScript types for pre-consultation",
      "status": "completed",
      "activeForm": "Creating TypeScript types for pre-consultation"
    },
    {
      "content": "Create API functions for pre-consultation CRUD",
      "status": "in_progress",
      "activeForm": "Creating API functions for pre-consultation CRUD"
    },
    {
      "content": "Create patient pre-consultation form component",
      "status": "pending",
      "activeForm": "Creating patient pre-consultation form component"
    },
    {
      "content": "Create hook for managing pre-consultation form state",
      "status": "pending",
      "activeForm": "Creating hook for managing pre-consultation form state"
    },
    {
      "content": "Create pre-consultation page for patients",
      "status": "pending",
      "activeForm": "Creating pre-consultation page for patients"
    },
    {
      "content": "Create doctor view component for pre-consultation data",
      "status": "pending",
      "activeForm": "Creating doctor view component for pre-consultation data"
    },
    {
      "content": "Add routing and integrate with appointments",
      "status": "pending",
      "activeForm": "Adding routing and integrating with appointments"
    }
  ]
}
Now let me create the API functions:

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/lib/pre-consultation-api.ts",
  "content": "/**\n * FR-022: Pre-Consultation Health Declaration API\n * CRUD operations for pre-consultation forms\n */\n\nimport { supabase } from '@/lib/supabase';\nimport type {\n  PreConsultation,\n  UpdatePreConsultationInput,\n  SubmitPreConsultationResult,\n  PreConsultationFlags,\n  MedicalHistoryItem,\n  FamilyHistoryItem,\n  MedicationItem,\n  DrugAllergyItem,\n  FoodAllergyItem,\n  PreConsultationStatus,\n  SymptomDurationUnit,\n  SmokingStatus,\n  AlcoholStatus,\n  ExerciseStatus,\n} from '@/types/pre-consultation';\n\n// ─── Type Guards & Parsers ───────────────────────────────────────────────────\n\nfunction parseJsonArray<T>(value: unknown): T[] {\n  if (Array.isArray(value)) return value as T[];\n  if (typeof value === 'string') {\n    try {\n      const parsed = JSON.parse(value);\n      return Array.isArray(parsed) ? parsed : [];\n    } catch {\n      return [];\n    }\n  }\n  return [];\n}\n\nfunction parseFlags(value: unknown): PreConsultationFlags {\n  if (typeof value === 'object' && value !== null) {\n    const obj = value as Record<string, unknown>;\n    return {\n      drug_allergy: Boolean(obj.drug_allergy),\n      severe_pain: Boolean(obj.severe_pain),\n    };\n  }\n  return { drug_allergy: false, severe_pain: false };\n}\n\nfunction parseStringArray(value: unknown): string[] {\n  if (Array.isArray(value)) return value.map(String);\n  return [];\n}\n\n// ─── Row Mapper ──────────────────────────────────────────────────────────────\n\nfunction mapPreConsultationRow(row: Record<string, unknown>): PreConsultation {\n  return {\n    id: String(row.id),\n    appointment_id: String(row.appointment_id),\n    patient_id: String(row.patient_id),\n    status: row.status as PreConsultationStatus,\n\n    // Nhóm 1: Triệu chứng\n    chief_complaint: row.chief_complaint != null ? String(row.chief_complaint) : null,\n    symptom_duration: row.symptom_duration != null ? Number(row.symptom_duration) : null,\n    symptom_duration_unit: row.symptom_duration_unit as SymptomDurationUnit | null,\n    pain_scale: row.pain_scale != null ? Number(row.pain_scale) : null,\n    symptom_tags: parseStringArray(row.symptom_tags),\n\n    // Nhóm 2: Bệnh sử\n    medical_history: parseJsonArray<MedicalHistoryItem>(row.medical_history),\n    surgical_history: row.surgical_history != null ? String(row.surgical_history) : null,\n    family_history: parseJsonArray<FamilyHistoryItem>(row.family_history),\n\n    // Nhóm 3: Thuốc\n    current_medications: parseJsonArray<MedicationItem>(row.current_medications),\n    otc_supplements: row.otc_supplements != null ? String(row.otc_supplements) : null,\n\n    // Nhóm 4: Dị ứng\n    drug_allergies: parseJsonArray<DrugAllergyItem>(row.drug_allergies),\n    food_allergies: parseJsonArray<FoodAllergyItem>(row.food_allergies),\n\n    // Nhóm 5: Lối sống\n    smoking: row.smoking as SmokingStatus | null,\n    smoking_frequency: row.smoking_frequency != null ? String(row.smoking_frequency) : null,\n    alcohol: row.alcohol as AlcoholStatus | null,\n    alcohol_frequency: row.alcohol_frequency != null ? String(row.alcohol_frequency) : null,\n    exercise: row.exercise as ExerciseStatus | null,\n    exercise_frequency: row.exercise_frequency != null ? String(row.exercise_frequency) : null,\n\n    // Metadata\n    flags: parseFlags(row.flags),\n    submitted_at: row.submitted_at != null ? String(row.submitted_at) : null,\n    created_at: String(row.created_at),\n    updated_at: String(row.updated_at),\n  };\n}\n\n// ─── API Functions ───────────────────────────────────────────────────────────\n\n/**\n * Creates a new pre-consultation draft for an appointment\n * Returns the existing one if already created (idempotent)\n */\nexport async function createPreConsultation(appointmentId: string): Promise<string> {\n  const { data, error } = await supabase.rpc('create_pre_consultation', {\n    p_appointment_id: appointmentId,\n  });\n\n  if (error) throw new Error(mapApiError(error.message));\n  return data as string;\n}\n\n/**\n * Gets a pre-consultation by its ID\n */\nexport async function getPreConsultation(id: string): Promise<PreConsultation | null> {\n  const { data, error } = await supabase\n    .from('pre_consultations')\n    .select('*')\n    .eq('id', id)\n    .maybeSingle();\n\n  if (error) throw new Error(error.message);\n  if (!data) return null;\n  return mapPreConsultationRow(data as Record<string, unknown>);\n}\n\n/**\n * Gets a pre-consultation by appointment ID (for patient editing or doctor viewing)\n */\nexport async function getPreConsultationByAppointment(\n  appointmentId: string\n): Promise<PreConsultation | null> {\n  const { data, error } = await supabase.rpc('get_pre_consultation_by_appointment', {\n    p_appointment_id: appointmentId,\n  });\n\n  if (error) throw new Error(mapApiError(error.message));\n\n  const rows = data as Record<string, unknown>[] | null;\n  if (!rows || rows.length === 0) return null;\n  return mapPreConsultationRow(rows[0]);\n}\n\n/**\n * Updates a draft pre-consultation (auto-save)\n * RULE-022b: Cannot update after SUBMITTED\n */\nexport async function updatePreConsultation(\n  id: string,\n  input: UpdatePreConsultationInput\n): Promise<string> {\n  const { data, error } = await supabase.rpc('update_pre_consultation', {\n    p_id: id,\n    p_chief_complaint: input.chief_complaint ?? null,\n    p_symptom_duration: input.symptom_duration ?? null,\n    p_symptom_duration_unit: input.symptom_duration_unit ?? null,\n    p_pain_scale: input.pain_scale ?? null,\n    p_symptom_tags: input.symptom_tags ?? null,\n    p_medical_history: input.medical_history ? JSON.stringify(input.medical_history) : null,\n    p_surgical_history: input.surgical_history ?? null,\n    p_family_history: input.family_history ? JSON.stringify(input.family_history) : null,\n    p_current_medications: input.current_medications ? JSON.stringify(input.current_medications) : null,\n    p_otc_supplements: input.otc_supplements ?? null,\n    p_drug_allergies: input.drug_allergies ? JSON.stringify(input.drug_allergies) : null,\n    p_food_allergies: input.food_allergies ? JSON.stringify(input.food_allergies) : null,\n    p_smoking: input.smoking ?? null,\n    p_smoking_frequency: input.smoking_frequency ?? null,\n    p_alcohol: input.alcohol ?? null,\n    p_alcohol_frequency: input.alcohol_frequency ?? null,\n    p_exercise: input.exercise ?? null,\n    p_exercise_frequency: input.exercise_frequency ?? null,\n  });\n\n  if (error) throw new Error(mapApiError(error.message));\n  return data as string;\n}\n\n/**\n * Submits a pre-consultation (finalizes, computes flags)\n * RULE-022b: After SUBMITTED, cannot be modified\n * RULE-022d: drug_allergies >= 1 → flag\n * RULE-022e: pain_scale >= 7 → flag\n */\nexport async function submitPreConsultation(id: string): Promise<SubmitPreConsultationResult> {\n  const { data, error } = await supabase.rpc('submit_pre_consultation', {\n    p_id: id,\n  });\n\n  if (error) throw new Error(mapApiError(error.message));\n\n  const rows = data as { id: string; flags: PreConsultationFlags }[] | null;\n  if (!rows || rows.length === 0) {\n    throw new Error('Không nhận được kết quả từ server');\n  }\n\n  return {\n    id: String(rows[0].id),\n    flags: parseFlags(rows[0].flags),\n  };\n}\n\n/**\n * Gets all pre-consultations for the current patient\n */\nexport async function getMyPreConsultations(): Promise<PreConsultation[]> {\n  const { data, error } = await supabase\n    .from('pre_consultations')\n    .select('*')\n    .order('created_at', { ascending: false });\n\n  if (error) throw new Error(error.message);\n  return ((data ?? []) as Record<string, unknown>[]).map(mapPreConsultationRow);\n}\n\n/**\n * Checks if a pre-consultation exists for an appointment\n */\nexport async function hasPreConsultation(appointmentId: string): Promise<boolean> {\n  const { data, error } = await supabase\n    .from('pre_consultations')\n    .select('id')\n    .eq('appointment_id', appointmentId)\n    .maybeSingle();\n\n  if (error) throw new Error(error.message);\n  return data !== null;\n}\n\n/**\n * Gets pre-consultation status for an appointment\n * Returns: 'none' | 'draft' | 'submitted'\n */\nexport async function getPreConsultationStatus(\n  appointmentId: string\n): Promise<'none' | 'draft' | 'submitted'> {\n  const { data, error } = await supabase\n    .from('pre_consultations')\n    .select('status')\n    .eq('appointment_id', appointmentId)\n    .maybeSingle();\n\n  if (error) throw new Error(error.message);\n  if (!data) return 'none';\n  return (data as { status: string }).status.toLowerCase() as 'draft' | 'submitted';\n}\n\n// ─── Error Mapping ───────────────────────────────────────────────────────────\n\nfunction mapApiError(message: string): string {\n  if (message.includes('UNAUTHORIZED'))\n    return 'Bạn không có quyền thực hiện thao tác này.';\n  if (message.includes('APPOINTMENT_NOT_FOUND'))\n    return 'Không tìm thấy lịch hẹn.';\n  if (message.includes('INVALID_APPOINTMENT_STATUS'))\n    return 'Chỉ có thể khai báo trước khám cho lịch hẹn đã xác nhận.';\n  if (message.includes('NOT_FOUND'))\n    return 'Không tìm thấy phiếu khai báo.';\n  if (message.includes('ALREADY_SUBMITTED'))\n    return 'Phiếu khai báo đã được gửi, không thể sửa đổi.';\n  if (message.includes('VALIDATION_ERROR: chief_complaint'))\n    return 'Vui lòng nhập lý do đến khám.';\n  if (message.includes('VALIDATION_ERROR: symptom_duration'))\n    return 'Vui lòng nhập thời gian triệu chứng.';\n  return message;\n}\n\n// ─── Error Code Constants ────────────────────────────────────────────────────\n\nexport const PRE_CONSULTATION_ERRORS = {\n  UNAUTHORIZED: 'UNAUTHORIZED',\n  APPOINTMENT_NOT_FOUND: 'APPOINTMENT_NOT_FOUND',\n  INVALID_APPOINTMENT_STATUS: 'INVALID_APPOINTMENT_STATUS',\n  NOT_FOUND: 'NOT_FOUND',\n  ALREADY_SUBMITTED: 'ALREADY_SUBMITTED',\n  VALIDATION_ERROR: 'VALIDATION_ERROR',\n} as const;\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create database migration for pre_consultations table",
      "status": "completed",
      "activeForm": "Creating database migration for pre_consultations table"
    },
    {
      "content": "Create TypeScript types for pre-consultation",
      "status": "completed",
      "activeForm": "Creating TypeScript types for pre-consultation"
    },
    {
      "content": "Create API functions for pre-consultation CRUD",
      "status": "completed",
      "activeForm": "Creating API functions for pre-consultation CRUD"
    },
    {
      "content": "Create patient pre-consultation form component",
      "status": "in_progress",
      "activeForm": "Creating patient pre-consultation form component"
    },
    {
      "content": "Create hook for managing pre-consultation form state",
      "status": "pending",
      "activeForm": "Creating hook for managing pre-consultation form state"
    },
    {
      "content": "Create pre-consultation page for patients",
      "status": "pending",
      "activeForm": "Creating pre-consultation page for patients"
    },
    {
      "content": "Create doctor view component for pre-consultation data",
      "status": "pending",
      "activeForm": "Creating doctor view component for pre-consultation data"
    },
    {
      "content": "Add routing and integrate with appointments",
      "status": "pending",
      "activeForm": "Adding routing and integrating with appointments"
    }
  ]
}
Now let me create the hook for managing the form state:

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/hooks/usePreConsultationForm.ts",
  "content": "/**\n * FR-022: Pre-Consultation Form Hook\n * Manages form state with auto-save functionality\n */\n\nimport { useState, useEffect, useCallback, useRef } from 'react';\nimport { toast } from 'sonner';\nimport {\n  createPreConsultation,\n  getPreConsultationByAppointment,\n  updatePreConsultation,\n  submitPreConsultation,\n} from '@/lib/pre-consultation-api';\nimport type {\n  PreConsultation,\n  PreConsultationFormData,\n  PreConsultationStep,\n  UpdatePreConsultationInput,\n  SubmitPreConsultationResult,\n} from '@/types/pre-consultation';\nimport {\n  DEFAULT_FORM_DATA,\n  PRE_CONSULTATION_STEPS,\n  validatePreConsultation,\n  isFormValid,\n} from '@/types/pre-consultation';\n\n// Auto-save debounce delay (2 seconds as per spec)\nconst AUTO_SAVE_DELAY = 2000;\n\nexport type UsePreConsultationFormReturn = {\n  // Data\n  formData: PreConsultationFormData;\n  preConsultationId: string | null;\n  isSubmitted: boolean;\n  appointmentInfo: {\n    date: string;\n    time: string;\n    specialty: string;\n    doctor: string;\n  } | null;\n\n  // Step navigation\n  currentStep: PreConsultationStep;\n  currentStepIndex: number;\n  totalSteps: number;\n  progress: number;\n  setCurrentStep: (step: PreConsultationStep) => void;\n  goToNextStep: () => void;\n  goToPrevStep: () => void;\n  canGoNext: boolean;\n  canGoPrev: boolean;\n\n  // Form operations\n  updateField: <K extends keyof PreConsultationFormData>(\n    field: K,\n    value: PreConsultationFormData[K]\n  ) => void;\n  updateFields: (updates: Partial<PreConsultationFormData>) => void;\n\n  // Actions\n  saveDraft: () => Promise<void>;\n  submit: () => Promise<SubmitPreConsultationResult | null>;\n\n  // Status\n  loading: boolean;\n  saving: boolean;\n  submitting: boolean;\n  error: string | null;\n  validationErrors: Partial<Record<keyof PreConsultationFormData, string>>;\n};\n\nexport function usePreConsultationForm(\n  appointmentId: string\n): UsePreConsultationFormReturn {\n  // ─── State ───────────────────────────────────────────────────────────────────\n\n  const [formData, setFormData] = useState<PreConsultationFormData>(DEFAULT_FORM_DATA);\n  const [preConsultationId, setPreConsultationId] = useState<string | null>(null);\n  const [isSubmitted, setIsSubmitted] = useState(false);\n  const [currentStep, setCurrentStep] = useState<PreConsultationStep>('symptoms');\n\n  const [loading, setLoading] = useState(true);\n  const [saving, setSaving] = useState(false);\n  const [submitting, setSubmitting] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n  const [validationErrors, setValidationErrors] = useState<\n    Partial<Record<keyof PreConsultationFormData, string>>\n  >({});\n\n  // For auto-save debouncing\n  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const pendingChanges = useRef<UpdatePreConsultationInput>({});\n  const isInitialized = useRef(false);\n\n  // ─── Initialize ──────────────────────────────────────────────────────────────\n\n  useEffect(() => {\n    async function initialize() {\n      setLoading(true);\n      setError(null);\n\n      try {\n        // Try to get existing pre-consultation\n        let existing = await getPreConsultationByAppointment(appointmentId);\n\n        if (!existing) {\n          // Create a new draft\n          const newId = await createPreConsultation(appointmentId);\n          existing = await getPreConsultationByAppointment(appointmentId);\n          setPreConsultationId(newId);\n        } else {\n          setPreConsultationId(existing.id);\n        }\n\n        if (existing) {\n          // Populate form data from existing record\n          setFormData(preConsultationToFormData(existing));\n          setIsSubmitted(existing.status === 'SUBMITTED');\n        }\n\n        isInitialized.current = true;\n      } catch (e) {\n        const msg = (e as Error).message;\n        setError(msg);\n        toast.error(msg);\n      } finally {\n        setLoading(false);\n      }\n    }\n\n    initialize();\n\n    // Cleanup auto-save timer on unmount\n    return () => {\n      if (autoSaveTimer.current) {\n        clearTimeout(autoSaveTimer.current);\n      }\n    };\n  }, [appointmentId]);\n\n  // ─── Auto-Save Logic ─────────────────────────────────────────────────────────\n\n  const triggerAutoSave = useCallback(() => {\n    if (!preConsultationId || isSubmitted || !isInitialized.current) return;\n\n    // Clear existing timer\n    if (autoSaveTimer.current) {\n      clearTimeout(autoSaveTimer.current);\n    }\n\n    // Set new timer\n    autoSaveTimer.current = setTimeout(async () => {\n      if (Object.keys(pendingChanges.current).length === 0) return;\n\n      setSaving(true);\n      try {\n        await updatePreConsultation(preConsultationId, pendingChanges.current);\n        pendingChanges.current = {};\n      } catch (e) {\n        console.error('Auto-save failed:', e);\n        // Don't show error toast for auto-save failures\n      } finally {\n        setSaving(false);\n      }\n    }, AUTO_SAVE_DELAY);\n  }, [preConsultationId, isSubmitted]);\n\n  // ─── Update Field ────────────────────────────────────────────────────────────\n\n  const updateField = useCallback(\n    <K extends keyof PreConsultationFormData>(\n      field: K,\n      value: PreConsultationFormData[K]\n    ) => {\n      if (isSubmitted) return;\n\n      setFormData((prev) => ({ ...prev, [field]: value }));\n\n      // Queue for auto-save\n      pendingChanges.current = {\n        ...pendingChanges.current,\n        [field]: value,\n      } as UpdatePreConsultationInput;\n\n      triggerAutoSave();\n\n      // Clear validation error for this field\n      setValidationErrors((prev) => {\n        const { [field]: _, ...rest } = prev;\n        return rest;\n      });\n    },\n    [isSubmitted, triggerAutoSave]\n  );\n\n  const updateFields = useCallback(\n    (updates: Partial<PreConsultationFormData>) => {\n      if (isSubmitted) return;\n\n      setFormData((prev) => ({ ...prev, ...updates }));\n\n      // Queue for auto-save\n      pendingChanges.current = {\n        ...pendingChanges.current,\n        ...updates,\n      } as UpdatePreConsultationInput;\n\n      triggerAutoSave();\n    },\n    [isSubmitted, triggerAutoSave]\n  );\n\n  // ─── Manual Save Draft ───────────────────────────────────────────────────────\n\n  const saveDraft = useCallback(async () => {\n    if (!preConsultationId || isSubmitted) return;\n\n    // Clear auto-save timer\n    if (autoSaveTimer.current) {\n      clearTimeout(autoSaveTimer.current);\n    }\n\n    setSaving(true);\n    try {\n      // Save all current form data\n      await updatePreConsultation(preConsultationId, formDataToInput(formData));\n      pendingChanges.current = {};\n      toast.success('Đã lưu nháp');\n    } catch (e) {\n      const msg = (e as Error).message;\n      toast.error(msg);\n      throw e;\n    } finally {\n      setSaving(false);\n    }\n  }, [preConsultationId, isSubmitted, formData]);\n\n  // ─── Submit ──────────────────────────────────────────────────────────────────\n\n  const submit = useCallback(async (): Promise<SubmitPreConsultationResult | null> => {\n    if (!preConsultationId || isSubmitted) return null;\n\n    // Validate\n    const errors = validatePreConsultation(formData);\n    if (Object.keys(errors).length > 0) {\n      setValidationErrors(errors);\n      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');\n      return null;\n    }\n\n    setSubmitting(true);\n    try {\n      // First save any pending changes\n      if (Object.keys(pendingChanges.current).length > 0) {\n        await updatePreConsultation(preConsultationId, pendingChanges.current);\n        pendingChanges.current = {};\n      }\n\n      // Then submit\n      const result = await submitPreConsultation(preConsultationId);\n      setIsSubmitted(true);\n      toast.success('Đã gửi phiếu khai báo thành công!');\n\n      // Show warning if flags were set\n      if (result.flags.drug_allergy) {\n        toast.info('Thông tin dị ứng thuốc đã được ghi nhận để bác sĩ lưu ý.');\n      }\n      if (result.flags.severe_pain) {\n        toast.info('Mức độ đau của bạn sẽ được thông báo cho đội ngũ y tế.');\n      }\n\n      return result;\n    } catch (e) {\n      const msg = (e as Error).message;\n      toast.error(msg);\n      return null;\n    } finally {\n      setSubmitting(false);\n    }\n  }, [preConsultationId, isSubmitted, formData]);\n\n  // ─── Step Navigation ─────────────────────────────────────────────────────────\n\n  const currentStepIndex = PRE_CONSULTATION_STEPS.indexOf(currentStep);\n  const totalSteps = PRE_CONSULTATION_STEPS.length;\n  const progress = ((currentStepIndex + 1) / totalSteps) * 100;\n\n  const canGoNext = currentStepIndex < totalSteps - 1;\n  const canGoPrev = currentStepIndex > 0;\n\n  const goToNextStep = useCallback(() => {\n    if (canGoNext) {\n      setCurrentStep(PRE_CONSULTATION_STEPS[currentStepIndex + 1]);\n    }\n  }, [canGoNext, currentStepIndex]);\n\n  const goToPrevStep = useCallback(() => {\n    if (canGoPrev) {\n      setCurrentStep(PRE_CONSULTATION_STEPS[currentStepIndex - 1]);\n    }\n  }, [canGoPrev, currentStepIndex]);\n\n  // ─── Return ──────────────────────────────────────────────────────────────────\n\n  return {\n    formData,\n    preConsultationId,\n    isSubmitted,\n    appointmentInfo: null, // Will be populated from parent component\n\n    currentStep,\n    currentStepIndex,\n    totalSteps,\n    progress,\n    setCurrentStep,\n    goToNextStep,\n    goToPrevStep,\n    canGoNext,\n    canGoPrev,\n\n    updateField,\n    updateFields,\n\n    saveDraft,\n    submit,\n\n    loading,\n    saving,\n    submitting,\n    error,\n    validationErrors,\n  };\n}\n\n// ─── Helpers ─────────────────────────────────────────────────────────────────\n\nfunction preConsultationToFormData(pc: PreConsultation): PreConsultationFormData {\n  return {\n    chief_complaint: pc.chief_complaint ?? '',\n    symptom_duration: pc.symptom_duration,\n    symptom_duration_unit: pc.symptom_duration_unit ?? 'days',\n    pain_scale: pc.pain_scale ?? 0,\n    symptom_tags: pc.symptom_tags,\n    medical_history: pc.medical_history,\n    surgical_history: pc.surgical_history ?? '',\n    family_history: pc.family_history,\n    current_medications: pc.current_medications,\n    otc_supplements: pc.otc_supplements ?? '',\n    drug_allergies: pc.drug_allergies,\n    food_allergies: pc.food_allergies,\n    smoking: pc.smoking ?? 'never',\n    smoking_frequency: pc.smoking_frequency ?? '',\n    alcohol: pc.alcohol ?? 'never',\n    alcohol_frequency: pc.alcohol_frequency ?? '',\n    exercise: pc.exercise ?? 'never',\n    exercise_frequency: pc.exercise_frequency ?? '',\n  };\n}\n\nfunction formDataToInput(data: PreConsultationFormData): UpdatePreConsultationInput {\n  return {\n    chief_complaint: data.chief_complaint || undefined,\n    symptom_duration: data.symptom_duration ?? undefined,\n    symptom_duration_unit: data.symptom_duration_unit,\n    pain_scale: data.pain_scale,\n    symptom_tags: data.symptom_tags,\n    medical_history: data.medical_history,\n    surgical_history: data.surgical_history || undefined,\n    family_history: data.family_history,\n    current_medications: data.current_medications,\n    otc_supplements: data.otc_supplements || undefined,\n    drug_allergies: data.drug_allergies,\n    food_allergies: data.food_allergies,\n    smoking: data.smoking,\n    smoking_frequency: data.smoking_frequency || undefined,\n    alcohol: data.alcohol,\n    alcohol_frequency: data.alcohol_frequency || undefined,\n    exercise: data.exercise,\n    exercise_frequency: data.exercise_frequency || undefined,\n  };\n}\n\nexport { isFormValid, validatePreConsultation };\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create database migration for pre_consultations table",
      "status": "completed",
      "activeForm": "Creating database migration for pre_consultations table"
    },
    {
      "content": "Create TypeScript types for pre-consultation",
      "status": "completed",
      "activeForm": "Creating TypeScript types for pre-consultation"
    },
    {
      "content": "Create API functions for pre-consultation CRUD",
      "status": "completed",
      "activeForm": "Creating API functions for pre-consultation CRUD"
    },
    {
      "content": "Create patient pre-consultation form component",
      "status": "in_progress",
      "activeForm": "Creating patient pre-consultation form component"
    },
    {
      "content": "Create hook for managing pre-consultation form state",
      "status": "completed",
      "activeForm": "Creating hook for managing pre-consultation form state"
    },
    {
      "content": "Create pre-consultation page for patients",
      "status": "pending",
      "activeForm": "Creating pre-consultation page for patients"
    },
    {
      "content": "Create doctor view component for pre-consultation data",
      "status": "pending",
      "activeForm": "Creating doctor view component for pre-consultation data"
    },
    {
      "content": "Add routing and integrate with appointments",
      "status": "pending",
      "activeForm": "Adding routing and integrating with appointments"
    }
  ]
}
Now let me create the form components. First, let me check what UI components are available:

🔧 Tool: Glob
Input: {
  "pattern": "**/src/components/ui/*.tsx",
  "path": "/projects/healthcare-system-ns"
}
Good, they have a slider, checkbox, input, select, etc. Now let me create the pre-consultation form components:

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/pre-consultation/PreConsultationForm.tsx",
  "content": "/**\n * FR-022: Pre-Consultation Form Component\n * Multi-step form for health declaration before appointment\n */\n\nimport { useEffect, useState } from 'react';\nimport { useParams, useNavigate } from 'react-router-dom';\nimport { format, parseISO } from 'date-fns';\nimport { vi } from 'date-fns/locale';\nimport {\n  CalendarDays,\n  User,\n  Loader2,\n  ChevronLeft,\n  ChevronRight,\n  Check,\n  Save,\n  AlertCircle,\n  FileText,\n} from 'lucide-react';\nimport { toast } from 'sonner';\n\nimport { Button } from '@/components/ui/button';\nimport { Progress } from '@/components/ui/progress';\nimport { Card, CardContent } from '@/components/ui/card';\nimport { Alert, AlertDescription } from '@/components/ui/alert';\n\nimport { usePreConsultationForm } from '@/hooks/usePreConsultationForm';\nimport { fetchMyAppointments } from '@/lib/appointment-api';\nimport type { Appointment } from '@/types/appointment';\nimport { STEP_LABELS, STEP_NUMBERS } from '@/types/pre-consultation';\n\nimport SymptomsStep from './steps/SymptomsStep';\nimport MedicalHistoryStep from './steps/MedicalHistoryStep';\nimport MedicationsStep from './steps/MedicationsStep';\nimport AllergiesStep from './steps/AllergiesStep';\nimport LifestyleStep from './steps/LifestyleStep';\n\nexport default function PreConsultationForm() {\n  const { appointmentId } = useParams<{ appointmentId: string }>();\n  const navigate = useNavigate();\n  const [appointment, setAppointment] = useState<Appointment | null>(null);\n  const [loadingAppointment, setLoadingAppointment] = useState(true);\n\n  // Load appointment info\n  useEffect(() => {\n    async function loadAppointment() {\n      if (!appointmentId) return;\n\n      try {\n        const appointments = await fetchMyAppointments();\n        const apt = appointments.find((a) => a.id === appointmentId);\n        if (apt) {\n          setAppointment(apt);\n        } else {\n          toast.error('Không tìm thấy lịch hẹn');\n          navigate('/appointments');\n        }\n      } catch (e) {\n        toast.error((e as Error).message);\n      } finally {\n        setLoadingAppointment(false);\n      }\n    }\n\n    loadAppointment();\n  }, [appointmentId, navigate]);\n\n  // Pre-consultation form hook\n  const form = usePreConsultationForm(appointmentId ?? '');\n\n  // Loading state\n  if (loadingAppointment || form.loading) {\n    return (\n      <div className=\"flex items-center justify-center min-h-[400px]\">\n        <Loader2 className=\"h-8 w-8 animate-spin text-primary\" />\n      </div>\n    );\n  }\n\n  // Error state\n  if (form.error) {\n    return (\n      <div className=\"max-w-2xl mx-auto p-4\">\n        <Alert variant=\"destructive\">\n          <AlertCircle className=\"h-4 w-4\" />\n          <AlertDescription>{form.error}</AlertDescription>\n        </Alert>\n        <Button\n          variant=\"outline\"\n          className=\"mt-4\"\n          onClick={() => navigate('/appointments')}\n        >\n          <ChevronLeft className=\"h-4 w-4 mr-2\" />\n          Quay lại lịch hẹn\n        </Button>\n      </div>\n    );\n  }\n\n  // Already submitted state\n  if (form.isSubmitted) {\n    return (\n      <div className=\"max-w-2xl mx-auto p-4\">\n        <Card className=\"text-center py-12\">\n          <CardContent>\n            <div className=\"h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4\">\n              <Check className=\"h-8 w-8 text-green-600\" />\n            </div>\n            <h2 className=\"text-xl font-bold text-foreground mb-2\">\n              Phiếu khai báo đã được gửi\n            </h2>\n            <p className=\"text-muted-foreground mb-6\">\n              Cảm ơn bạn đã hoàn thành khai báo y tế trước khám. Bác sĩ sẽ xem\n              thông tin này trước khi tiến hành khám.\n            </p>\n            <Button onClick={() => navigate('/appointments')}>\n              Quay lại lịch hẹn\n            </Button>\n          </CardContent>\n        </Card>\n      </div>\n    );\n  }\n\n  const dateLabel = appointment?.slot_date\n    ? format(parseISO(appointment.slot_date), \"EEEE, dd/MM/yyyy 'lúc' HH:mm\", {\n        locale: vi,\n      })\n    : '';\n\n  // Render current step\n  function renderStep() {\n    switch (form.currentStep) {\n      case 'symptoms':\n        return (\n          <SymptomsStep\n            formData={form.formData}\n            updateField={form.updateField}\n            validationErrors={form.validationErrors}\n          />\n        );\n      case 'medical_history':\n        return (\n          <MedicalHistoryStep\n            formData={form.formData}\n            updateField={form.updateField}\n            updateFields={form.updateFields}\n          />\n        );\n      case 'medications':\n        return (\n          <MedicationsStep\n            formData={form.formData}\n            updateField={form.updateField}\n            updateFields={form.updateFields}\n          />\n        );\n      case 'allergies':\n        return (\n          <AllergiesStep\n            formData={form.formData}\n            updateField={form.updateField}\n            updateFields={form.updateFields}\n          />\n        );\n      case 'lifestyle':\n        return (\n          <LifestyleStep\n            formData={form.formData}\n            updateField={form.updateField}\n          />\n        );\n      default:\n        return null;\n    }\n  }\n\n  return (\n    <div className=\"max-w-3xl mx-auto p-4 pb-24\">\n      {/* Header */}\n      <div className=\"mb-6\">\n        <h1 className=\"text-2xl font-bold text-primary mb-2\">\n          KHAI BAO Y TE TRUOC KHAM\n        </h1>\n\n        {/* Appointment Info Card */}\n        <Card className=\"bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20\">\n          <CardContent className=\"py-4\">\n            <div className=\"flex items-start justify-between\">\n              <div className=\"flex items-start gap-3\">\n                <CalendarDays className=\"h-5 w-5 text-primary mt-0.5\" />\n                <div>\n                  <p className=\"text-sm font-semibold text-primary\">\n                    Lich: {appointment?.slot_date\n                      ? format(parseISO(appointment.slot_date), 'dd/MM/yyyy', { locale: vi })\n                      : ''}{' '}\n                    {appointment?.start_time?.slice(0, 5)} - {appointment?.specialty_name}\n                  </p>\n                  <p className=\"text-xs text-muted-foreground mt-0.5\">\n                    Vui long hoan thanh to khai de bac si nam ro tinh trang cua ban\n                    truoc khi bat dau buoi kham.\n                  </p>\n                </div>\n              </div>\n              <div className=\"flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5\">\n                <FileText className=\"h-4 w-4 text-primary\" />\n                <span className=\"text-xs font-semibold text-primary\">\n                  Ho so y te\n                </span>\n              </div>\n            </div>\n          </CardContent>\n        </Card>\n      </div>\n\n      {/* Progress */}\n      <div className=\"mb-6\">\n        <div className=\"flex items-center justify-between mb-2\">\n          <p className=\"text-sm font-bold text-primary uppercase tracking-wider\">\n            Phan {STEP_NUMBERS[form.currentStep]}/5:{' '}\n            {STEP_LABELS[form.currentStep]}\n          </p>\n          <p className=\"text-sm text-muted-foreground\">\n            {Math.round(form.progress)}% Hoan thanh\n          </p>\n        </div>\n        <Progress value={form.progress} className=\"h-2\" />\n      </div>\n\n      {/* Auto-save indicator */}\n      {form.saving && (\n        <div className=\"flex items-center gap-2 text-xs text-muted-foreground mb-4\">\n          <Loader2 className=\"h-3 w-3 animate-spin\" />\n          Dang luu...\n        </div>\n      )}\n\n      {/* Step Content */}\n      <Card className=\"mb-6\">\n        <CardContent className=\"pt-6\">{renderStep()}</CardContent>\n      </Card>\n\n      {/* Navigation Buttons - Fixed at bottom */}\n      <div className=\"fixed bottom-0 left-0 right-0 bg-background border-t p-4\">\n        <div className=\"max-w-3xl mx-auto flex items-center gap-3\">\n          <Button\n            variant=\"outline\"\n            onClick={form.saveDraft}\n            disabled={form.saving || form.submitting}\n            className=\"flex-shrink-0\"\n          >\n            {form.saving ? (\n              <Loader2 className=\"h-4 w-4 animate-spin mr-2\" />\n            ) : (\n              <Save className=\"h-4 w-4 mr-2\" />\n            )}\n            Luu nhap\n          </Button>\n\n          <div className=\"flex-1\" />\n\n          {form.canGoPrev && (\n            <Button\n              variant=\"outline\"\n              onClick={form.goToPrevStep}\n              disabled={form.submitting}\n            >\n              <ChevronLeft className=\"h-4 w-4 mr-1\" />\n              Quay lai\n            </Button>\n          )}\n\n          {form.canGoNext ? (\n            <Button onClick={form.goToNextStep} disabled={form.submitting}>\n              Tiep tuc\n              <ChevronRight className=\"h-4 w-4 ml-1\" />\n            </Button>\n          ) : (\n            <Button\n              onClick={async () => {\n                const result = await form.submit();\n                if (result) {\n                  // Successfully submitted, will show success state\n                }\n              }}\n              disabled={form.submitting}\n              className=\"bg-primary hover:bg-primary/90\"\n            >\n              {form.submitting ? (\n                <>\n                  <Loader2 className=\"h-4 w-4 animate-spin mr-2\" />\n                  Dang gui...\n                </>\n              ) : (\n                <>\n                  <Check className=\"h-4 w-4 mr-2\" />\n                  Hoan tat\n                </>\n              )}\n            </Button>\n          )}\n        </div>\n      </div>\n    </div>\n  );\n}\n"
}
Now let me create the step components:

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/pre-consultation/steps/SymptomsStep.tsx",
  "content": "/**\n * FR-022: Current Symptoms Step (Nhom 1: Trieu chung hien tai)\n */\n\nimport { AlertCircle, Info } from 'lucide-react';\nimport { Label } from '@/components/ui/label';\nimport { Input } from '@/components/ui/input';\nimport { Textarea } from '@/components/ui/textarea';\nimport { Slider } from '@/components/ui/slider';\nimport {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from '@/components/ui/select';\nimport { Alert, AlertDescription } from '@/components/ui/alert';\nimport { Checkbox } from '@/components/ui/checkbox';\n\nimport type { PreConsultationFormData } from '@/types/pre-consultation';\nimport {\n  SYMPTOM_TAG_OPTIONS,\n  DURATION_UNIT_LABELS,\n  type SymptomDurationUnit,\n} from '@/types/pre-consultation';\n\ntype Props = {\n  formData: PreConsultationFormData;\n  updateField: <K extends keyof PreConsultationFormData>(\n    field: K,\n    value: PreConsultationFormData[K]\n  ) => void;\n  validationErrors: Partial<Record<keyof PreConsultationFormData, string>>;\n};\n\nexport default function SymptomsStep({\n  formData,\n  updateField,\n  validationErrors,\n}: Props) {\n  const toggleSymptomTag = (tag: string) => {\n    const current = formData.symptom_tags;\n    const updated = current.includes(tag)\n      ? current.filter((t) => t !== tag)\n      : [...current, tag];\n    updateField('symptom_tags', updated);\n  };\n\n  const painScaleLabel = (value: number) => {\n    if (value === 0) return 'Khong dau';\n    if (value <= 3) return 'Dau nhe';\n    if (value <= 6) return 'Dau vua';\n    return 'Du doi';\n  };\n\n  const painScaleColor = (value: number) => {\n    if (value === 0) return 'text-green-600';\n    if (value <= 3) return 'text-yellow-600';\n    if (value <= 6) return 'text-orange-500';\n    return 'text-red-600';\n  };\n\n  return (\n    <div className=\"space-y-6\">\n      {/* Important Notice */}\n      <Alert className=\"bg-amber-50 border-amber-200\">\n        <Info className=\"h-4 w-4 text-amber-600\" />\n        <AlertDescription className=\"text-amber-800\">\n          <strong>Ghi chu quan trong:</strong> Neu ban cam thay kho tho du doi\n          hoac dau that nguc lan ra canh tay trai, vui long goi cap cuu ngay lap\n          tuc.\n        </AlertDescription>\n      </Alert>\n\n      {/* Chief Complaint */}\n      <div className=\"space-y-2\">\n        <Label htmlFor=\"chief_complaint\" className=\"flex items-center gap-1\">\n          Ly do ban den kham lan nay? <span className=\"text-red-500\">*</span>\n        </Label>\n        <Textarea\n          id=\"chief_complaint\"\n          placeholder=\"Vi du: Dau nguc trai, hoi hop 3 ngay\"\n          value={formData.chief_complaint}\n          onChange={(e) => updateField('chief_complaint', e.target.value)}\n          rows={3}\n          className={validationErrors.chief_complaint ? 'border-red-500' : ''}\n        />\n        {validationErrors.chief_complaint && (\n          <p className=\"text-sm text-red-500 flex items-center gap-1\">\n            <AlertCircle className=\"h-3 w-3\" />\n            {validationErrors.chief_complaint}\n          </p>\n        )}\n      </div>\n\n      {/* Symptom Duration */}\n      <div className=\"space-y-2\">\n        <Label className=\"flex items-center gap-1\">\n          Trieu chung keo dai bao lau? <span className=\"text-red-500\">*</span>\n        </Label>\n        <div className=\"flex gap-3\">\n          <Input\n            type=\"number\"\n            placeholder=\"So luong\"\n            value={formData.symptom_duration ?? ''}\n            onChange={(e) =>\n              updateField(\n                'symptom_duration',\n                e.target.value ? parseInt(e.target.value, 10) : null\n              )\n            }\n            min={1}\n            className={`w-24 ${validationErrors.symptom_duration ? 'border-red-500' : ''}`}\n          />\n          <Select\n            value={formData.symptom_duration_unit}\n            onValueChange={(v) =>\n              updateField('symptom_duration_unit', v as SymptomDurationUnit)\n            }\n          >\n            <SelectTrigger className=\"w-32\">\n              <SelectValue />\n            </SelectTrigger>\n            <SelectContent>\n              {(\n                Object.entries(DURATION_UNIT_LABELS) as [\n                  SymptomDurationUnit,\n                  string,\n                ][]\n              ).map(([value, label]) => (\n                <SelectItem key={value} value={value}>\n                  {label}\n                </SelectItem>\n              ))}\n            </SelectContent>\n          </Select>\n        </div>\n        {validationErrors.symptom_duration && (\n          <p className=\"text-sm text-red-500 flex items-center gap-1\">\n            <AlertCircle className=\"h-3 w-3\" />\n            {validationErrors.symptom_duration}\n          </p>\n        )}\n      </div>\n\n      {/* Pain Scale */}\n      <div className=\"space-y-4\">\n        <div className=\"flex items-center justify-between\">\n          <Label>Muc do dau (0-10):</Label>\n          <span className={`text-2xl font-bold ${painScaleColor(formData.pain_scale)}`}>\n            {formData.pain_scale}/10\n          </span>\n        </div>\n        <Slider\n          value={[formData.pain_scale]}\n          onValueChange={([value]) => updateField('pain_scale', value)}\n          min={0}\n          max={10}\n          step={1}\n          className=\"w-full\"\n        />\n        <div className=\"flex justify-between text-xs text-muted-foreground\">\n          <span>Khong dau</span>\n          <span>Dau vua</span>\n          <span>Du doi</span>\n        </div>\n        {formData.pain_scale >= 7 && (\n          <Alert className=\"bg-red-50 border-red-200\">\n            <AlertCircle className=\"h-4 w-4 text-red-600\" />\n            <AlertDescription className=\"text-red-800\">\n              Muc do dau cao. Thong tin nay se duoc bao cao cho doi ngu y te de\n              ho tro ban som hon.\n            </AlertDescription>\n          </Alert>\n        )}\n      </div>\n\n      {/* Symptom Tags */}\n      <div className=\"space-y-3\">\n        <Label>Trieu chung di kem (chon nhieu):</Label>\n        <div className=\"flex flex-wrap gap-2\">\n          {SYMPTOM_TAG_OPTIONS.map(({ value, label }) => {\n            const isSelected = formData.symptom_tags.includes(value);\n            return (\n              <button\n                key={value}\n                type=\"button\"\n                onClick={() => toggleSymptomTag(value)}\n                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-colors ${\n                  isSelected\n                    ? 'bg-primary/10 border-primary text-primary'\n                    : 'bg-background border-border text-foreground hover:bg-muted'\n                }`}\n              >\n                {isSelected && (\n                  <span className=\"h-4 w-4 rounded-full bg-primary flex items-center justify-center\">\n                    <svg\n                      className=\"h-3 w-3 text-white\"\n                      fill=\"none\"\n                      viewBox=\"0 0 24 24\"\n                      stroke=\"currentColor\"\n                    >\n                      <path\n                        strokeLinecap=\"round\"\n                        strokeLinejoin=\"round\"\n                        strokeWidth={3}\n                        d=\"M5 13l4 4L19 7\"\n                      />\n                    </svg>\n                  </span>\n                )}\n                {label}\n              </button>\n            );\n          })}\n        </div>\n      </div>\n    </div>\n  );\n}\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/pre-consultation/steps/MedicalHistoryStep.tsx",
  "content": "/**\n * FR-022: Medical History Step (Nhom 2: Benh su)\n */\n\nimport { useState } from 'react';\nimport { Plus, X } from 'lucide-react';\nimport { Label } from '@/components/ui/label';\nimport { Input } from '@/components/ui/input';\nimport { Textarea } from '@/components/ui/textarea';\nimport { Button } from '@/components/ui/button';\nimport { Checkbox } from '@/components/ui/checkbox';\nimport { Card, CardContent } from '@/components/ui/card';\n\nimport type {\n  PreConsultationFormData,\n  MedicalHistoryItem,\n  FamilyHistoryItem,\n} from '@/types/pre-consultation';\nimport { MEDICAL_CONDITION_OPTIONS } from '@/types/pre-consultation';\n\ntype Props = {\n  formData: PreConsultationFormData;\n  updateField: <K extends keyof PreConsultationFormData>(\n    field: K,\n    value: PreConsultationFormData[K]\n  ) => void;\n  updateFields: (updates: Partial<PreConsultationFormData>) => void;\n};\n\nexport default function MedicalHistoryStep({\n  formData,\n  updateField,\n  updateFields,\n}: Props) {\n  const [customCondition, setCustomCondition] = useState('');\n\n  // ─── Medical History ─────────────────────────────────────────────────────────\n\n  const toggleMedicalCondition = (condition: string) => {\n    const current = formData.medical_history;\n    const exists = current.find((item) => item.condition === condition);\n\n    if (exists) {\n      updateField(\n        'medical_history',\n        current.filter((item) => item.condition !== condition)\n      );\n    } else {\n      updateField('medical_history', [\n        ...current,\n        { condition, details: '' },\n      ]);\n    }\n  };\n\n  const updateMedicalDetails = (condition: string, details: string) => {\n    const current = formData.medical_history;\n    const updated = current.map((item) =>\n      item.condition === condition ? { ...item, details } : item\n    );\n    updateField('medical_history', updated);\n  };\n\n  const addCustomMedicalCondition = () => {\n    if (!customCondition.trim()) return;\n\n    const exists = formData.medical_history.find(\n      (item) => item.condition === customCondition.trim()\n    );\n\n    if (!exists) {\n      updateField('medical_history', [\n        ...formData.medical_history,\n        { condition: customCondition.trim(), details: '' },\n      ]);\n    }\n    setCustomCondition('');\n  };\n\n  // ─── Family History ──────────────────────────────────────────────────────────\n\n  const addFamilyHistory = () => {\n    updateField('family_history', [\n      ...formData.family_history,\n      { condition: '', relation: '' },\n    ]);\n  };\n\n  const updateFamilyHistory = (\n    index: number,\n    field: keyof FamilyHistoryItem,\n    value: string\n  ) => {\n    const updated = formData.family_history.map((item, i) =>\n      i === index ? { ...item, [field]: value } : item\n    );\n    updateField('family_history', updated);\n  };\n\n  const removeFamilyHistory = (index: number) => {\n    updateField(\n      'family_history',\n      formData.family_history.filter((_, i) => i !== index)\n    );\n  };\n\n  return (\n    <div className=\"space-y-8\">\n      {/* Medical History */}\n      <div className=\"space-y-4\">\n        <Label className=\"text-base font-semibold\">\n          Tien su benh ly cua ban\n        </Label>\n        <p className=\"text-sm text-muted-foreground\">\n          Chon cac benh ma ban da hoac dang mac. Them chi tiet neu co (vd: thoi\n          gian mac, tinh trang hien tai)\n        </p>\n\n        <div className=\"grid grid-cols-2 gap-3\">\n          {MEDICAL_CONDITION_OPTIONS.map(({ value, label }) => {\n            const item = formData.medical_history.find(\n              (h) => h.condition === value\n            );\n            const isSelected = !!item;\n\n            return (\n              <div key={value} className=\"space-y-2\">\n                <div className=\"flex items-center space-x-2\">\n                  <Checkbox\n                    id={`condition-${value}`}\n                    checked={isSelected}\n                    onCheckedChange={() => toggleMedicalCondition(value)}\n                  />\n                  <label\n                    htmlFor={`condition-${value}`}\n                    className=\"text-sm font-medium leading-none cursor-pointer\"\n                  >\n                    {label}\n                  </label>\n                </div>\n                {isSelected && (\n                  <Input\n                    placeholder=\"Chi tiet (vd: 2 nam, dang dieu tri)\"\n                    value={item?.details ?? ''}\n                    onChange={(e) =>\n                      updateMedicalDetails(value, e.target.value)\n                    }\n                    className=\"ml-6 text-sm\"\n                  />\n                )}\n              </div>\n            );\n          })}\n        </div>\n\n        {/* Custom conditions */}\n        {formData.medical_history\n          .filter(\n            (item) =>\n              !MEDICAL_CONDITION_OPTIONS.find(\n                (opt) => opt.value === item.condition\n              )\n          )\n          .map((item) => (\n            <Card key={item.condition} className=\"bg-muted/30\">\n              <CardContent className=\"py-3\">\n                <div className=\"flex items-center justify-between\">\n                  <span className=\"text-sm font-medium\">{item.condition}</span>\n                  <Button\n                    variant=\"ghost\"\n                    size=\"sm\"\n                    onClick={() => toggleMedicalCondition(item.condition)}\n                  >\n                    <X className=\"h-4 w-4\" />\n                  </Button>\n                </div>\n                <Input\n                  placeholder=\"Chi tiet\"\n                  value={item.details ?? ''}\n                  onChange={(e) =>\n                    updateMedicalDetails(item.condition, e.target.value)\n                  }\n                  className=\"mt-2 text-sm\"\n                />\n              </CardContent>\n            </Card>\n          ))}\n\n        {/* Add custom condition */}\n        <div className=\"flex gap-2\">\n          <Input\n            placeholder=\"Benh khac...\"\n            value={customCondition}\n            onChange={(e) => setCustomCondition(e.target.value)}\n            onKeyDown={(e) => e.key === 'Enter' && addCustomMedicalCondition()}\n          />\n          <Button\n            variant=\"outline\"\n            onClick={addCustomMedicalCondition}\n            disabled={!customCondition.trim()}\n          >\n            <Plus className=\"h-4 w-4\" />\n          </Button>\n        </div>\n      </div>\n\n      {/* Surgical History */}\n      <div className=\"space-y-2\">\n        <Label htmlFor=\"surgical_history\">Tien su phau thuat</Label>\n        <Textarea\n          id=\"surgical_history\"\n          placeholder=\"Vd: Cat ruot thua nam 2020, mo tim nam 2018...\"\n          value={formData.surgical_history}\n          onChange={(e) => updateField('surgical_history', e.target.value)}\n          rows={2}\n        />\n      </div>\n\n      {/* Family History */}\n      <div className=\"space-y-4\">\n        <div className=\"flex items-center justify-between\">\n          <Label className=\"text-base font-semibold\">\n            Tien su benh ly gia dinh\n          </Label>\n          <Button variant=\"outline\" size=\"sm\" onClick={addFamilyHistory}>\n            <Plus className=\"h-4 w-4 mr-1\" />\n            Them\n          </Button>\n        </div>\n        <p className=\"text-sm text-muted-foreground\">\n          Ghi lai cac benh ma nguoi than trong gia dinh da mac (cha, me, anh chi\n          em, ong ba)\n        </p>\n\n        {formData.family_history.length === 0 && (\n          <p className=\"text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-lg\">\n            Chua co thong tin. Nhan \"Them\" de bat dau.\n          </p>\n        )}\n\n        {formData.family_history.map((item, index) => (\n          <Card key={index} className=\"bg-muted/30\">\n            <CardContent className=\"py-3\">\n              <div className=\"flex gap-3 items-start\">\n                <div className=\"flex-1 space-y-2\">\n                  <Input\n                    placeholder=\"Ten benh (vd: Tim mach, Tieu duong)\"\n                    value={item.condition}\n                    onChange={(e) =>\n                      updateFamilyHistory(index, 'condition', e.target.value)\n                    }\n                  />\n                  <Input\n                    placeholder=\"Moi quan he (vd: Cha, Me, Ong noi)\"\n                    value={item.relation ?? ''}\n                    onChange={(e) =>\n                      updateFamilyHistory(index, 'relation', e.target.value)\n                    }\n                  />\n                </div>\n                <Button\n                  variant=\"ghost\"\n                  size=\"sm\"\n                  onClick={() => removeFamilyHistory(index)}\n                >\n                  <X className=\"h-4 w-4\" />\n                </Button>\n              </div>\n            </CardContent>\n          </Card>\n        ))}\n      </div>\n    </div>\n  );\n}\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/pre-consultation/steps/MedicationsStep.tsx",
  "content": "/**\n * FR-022: Medications Step (Nhom 3: Thuoc dang dung)\n */\n\nimport { Plus, X, Pill } from 'lucide-react';\nimport { Label } from '@/components/ui/label';\nimport { Input } from '@/components/ui/input';\nimport { Textarea } from '@/components/ui/textarea';\nimport { Button } from '@/components/ui/button';\nimport { Card, CardContent } from '@/components/ui/card';\n\nimport type {\n  PreConsultationFormData,\n  MedicationItem,\n} from '@/types/pre-consultation';\n\ntype Props = {\n  formData: PreConsultationFormData;\n  updateField: <K extends keyof PreConsultationFormData>(\n    field: K,\n    value: PreConsultationFormData[K]\n  ) => void;\n  updateFields: (updates: Partial<PreConsultationFormData>) => void;\n};\n\nexport default function MedicationsStep({\n  formData,\n  updateField,\n  updateFields,\n}: Props) {\n  // ─── Current Medications ─────────────────────────────────────────────────────\n\n  const addMedication = () => {\n    updateField('current_medications', [\n      ...formData.current_medications,\n      { name: '', dose: '', frequency: '' },\n    ]);\n  };\n\n  const updateMedication = (\n    index: number,\n    field: keyof MedicationItem,\n    value: string\n  ) => {\n    const updated = formData.current_medications.map((item, i) =>\n      i === index ? { ...item, [field]: value } : item\n    );\n    updateField('current_medications', updated);\n  };\n\n  const removeMedication = (index: number) => {\n    updateField(\n      'current_medications',\n      formData.current_medications.filter((_, i) => i !== index)\n    );\n  };\n\n  return (\n    <div className=\"space-y-8\">\n      {/* Current Medications */}\n      <div className=\"space-y-4\">\n        <div className=\"flex items-center justify-between\">\n          <div>\n            <Label className=\"text-base font-semibold\">\n              Thuoc ban dang su dung\n            </Label>\n            <p className=\"text-sm text-muted-foreground mt-1\">\n              Liet ke tat ca cac loai thuoc ban dang dung, bao gom thuoc ke don\n              va khong ke don\n            </p>\n          </div>\n          <Button variant=\"outline\" size=\"sm\" onClick={addMedication}>\n            <Plus className=\"h-4 w-4 mr-1\" />\n            Them thuoc\n          </Button>\n        </div>\n\n        {formData.current_medications.length === 0 && (\n          <div className=\"py-8 text-center border border-dashed rounded-lg\">\n            <Pill className=\"h-10 w-10 mx-auto text-muted-foreground/40 mb-3\" />\n            <p className=\"text-sm text-muted-foreground\">\n              Chua co thuoc nao duoc them.\n            </p>\n            <p className=\"text-xs text-muted-foreground mt-1\">\n              Nhan \"Them thuoc\" de bat dau liet ke.\n            </p>\n          </div>\n        )}\n\n        {formData.current_medications.map((med, index) => (\n          <Card key={index} className=\"bg-muted/30\">\n            <CardContent className=\"py-4\">\n              <div className=\"flex gap-3 items-start\">\n                <div className=\"flex-1 space-y-3\">\n                  <Input\n                    placeholder=\"Ten thuoc (vd: Amlodipine)\"\n                    value={med.name}\n                    onChange={(e) =>\n                      updateMedication(index, 'name', e.target.value)\n                    }\n                  />\n                  <div className=\"grid grid-cols-2 gap-3\">\n                    <Input\n                      placeholder=\"Lieu luong (vd: 5mg)\"\n                      value={med.dose}\n                      onChange={(e) =>\n                        updateMedication(index, 'dose', e.target.value)\n                      }\n                    />\n                    <Input\n                      placeholder=\"Tan suat (vd: 1 vien/ngay)\"\n                      value={med.frequency}\n                      onChange={(e) =>\n                        updateMedication(index, 'frequency', e.target.value)\n                      }\n                    />\n                  </div>\n                </div>\n                <Button\n                  variant=\"ghost\"\n                  size=\"sm\"\n                  onClick={() => removeMedication(index)}\n                >\n                  <X className=\"h-4 w-4\" />\n                </Button>\n              </div>\n            </CardContent>\n          </Card>\n        ))}\n\n        {/* Common medications quick add */}\n        {formData.current_medications.length > 0 && (\n          <Button\n            variant=\"ghost\"\n            size=\"sm\"\n            onClick={addMedication}\n            className=\"w-full border border-dashed\"\n          >\n            <Plus className=\"h-4 w-4 mr-2\" />\n            Them thuoc khac\n          </Button>\n        )}\n      </div>\n\n      {/* OTC Supplements */}\n      <div className=\"space-y-2\">\n        <Label htmlFor=\"otc_supplements\">\n          Thuc pham chuc nang va vitamin\n        </Label>\n        <p className=\"text-sm text-muted-foreground\">\n          Liet ke cac loai vitamin, thuc pham bo sung, thao duoc ma ban dang su\n          dung\n        </p>\n        <Textarea\n          id=\"otc_supplements\"\n          placeholder=\"Vd: Vitamin D 1000IU/ngay, Omega-3, Canxi...\"\n          value={formData.otc_supplements}\n          onChange={(e) => updateField('otc_supplements', e.target.value)}\n          rows={3}\n        />\n      </div>\n    </div>\n  );\n}\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/pre-consultation/steps/AllergiesStep.tsx",
  "content": "/**\n * FR-022: Allergies Step (Nhom 4: Di ung)\n */\n\nimport { Plus, X, AlertTriangle } from 'lucide-react';\nimport { Label } from '@/components/ui/label';\nimport { Input } from '@/components/ui/input';\nimport { Button } from '@/components/ui/button';\nimport { Card, CardContent } from '@/components/ui/card';\nimport { Alert, AlertDescription } from '@/components/ui/alert';\n\nimport type {\n  PreConsultationFormData,\n  DrugAllergyItem,\n  FoodAllergyItem,\n} from '@/types/pre-consultation';\n\ntype Props = {\n  formData: PreConsultationFormData;\n  updateField: <K extends keyof PreConsultationFormData>(\n    field: K,\n    value: PreConsultationFormData[K]\n  ) => void;\n  updateFields: (updates: Partial<PreConsultationFormData>) => void;\n};\n\nexport default function AllergiesStep({\n  formData,\n  updateField,\n  updateFields,\n}: Props) {\n  // ─── Drug Allergies ──────────────────────────────────────────────────────────\n\n  const addDrugAllergy = () => {\n    updateField('drug_allergies', [\n      ...formData.drug_allergies,\n      { drug: '', reaction: '' },\n    ]);\n  };\n\n  const updateDrugAllergy = (\n    index: number,\n    field: keyof DrugAllergyItem,\n    value: string\n  ) => {\n    const updated = formData.drug_allergies.map((item, i) =>\n      i === index ? { ...item, [field]: value } : item\n    );\n    updateField('drug_allergies', updated);\n  };\n\n  const removeDrugAllergy = (index: number) => {\n    updateField(\n      'drug_allergies',\n      formData.drug_allergies.filter((_, i) => i !== index)\n    );\n  };\n\n  // ─── Food Allergies ──────────────────────────────────────────────────────────\n\n  const addFoodAllergy = () => {\n    updateField('food_allergies', [\n      ...formData.food_allergies,\n      { food: '', reaction: '' },\n    ]);\n  };\n\n  const updateFoodAllergy = (\n    index: number,\n    field: keyof FoodAllergyItem,\n    value: string\n  ) => {\n    const updated = formData.food_allergies.map((item, i) =>\n      i === index ? { ...item, [field]: value } : item\n    );\n    updateField('food_allergies', updated);\n  };\n\n  const removeFoodAllergy = (index: number) => {\n    updateField(\n      'food_allergies',\n      formData.food_allergies.filter((_, i) => i !== index)\n    );\n  };\n\n  const hasDrugAllergies = formData.drug_allergies.length > 0;\n\n  return (\n    <div className=\"space-y-8\">\n      {/* Important Notice */}\n      <Alert className=\"bg-red-50 border-red-200\">\n        <AlertTriangle className=\"h-4 w-4 text-red-600\" />\n        <AlertDescription className=\"text-red-800\">\n          <strong>Luu y quan trong:</strong> Thong tin di ung thuoc rat quan\n          trong de dam bao an toan khi ke don. Vui long khai bao day du.\n        </AlertDescription>\n      </Alert>\n\n      {/* Drug Allergies */}\n      <div className=\"space-y-4\">\n        <div className=\"flex items-center justify-between\">\n          <div>\n            <Label className=\"text-base font-semibold flex items-center gap-2\">\n              Di ung thuoc\n              {hasDrugAllergies && (\n                <span className=\"bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full\">\n                  Co di ung\n                </span>\n              )}\n            </Label>\n            <p className=\"text-sm text-muted-foreground mt-1\">\n              Liet ke cac loai thuoc ma ban bi di ung va phan ung da xay ra\n            </p>\n          </div>\n          <Button\n            variant=\"outline\"\n            size=\"sm\"\n            onClick={addDrugAllergy}\n            className=\"border-red-200 text-red-700 hover:bg-red-50\"\n          >\n            <Plus className=\"h-4 w-4 mr-1\" />\n            Them\n          </Button>\n        </div>\n\n        {formData.drug_allergies.length === 0 && (\n          <div className=\"py-6 text-center border border-dashed border-muted-foreground/30 rounded-lg\">\n            <p className=\"text-sm text-muted-foreground\">\n              Khong co di ung thuoc da biet.\n            </p>\n            <p className=\"text-xs text-muted-foreground mt-1\">\n              Nhan \"Them\" neu ban co di ung voi bat ky loai thuoc nao.\n            </p>\n          </div>\n        )}\n\n        {formData.drug_allergies.map((allergy, index) => (\n          <Card\n            key={index}\n            className=\"bg-red-50/50 border-red-200\"\n          >\n            <CardContent className=\"py-4\">\n              <div className=\"flex gap-3 items-start\">\n                <div className=\"flex-1 space-y-3\">\n                  <Input\n                    placeholder=\"Ten thuoc (vd: Penicillin, Aspirin)\"\n                    value={allergy.drug}\n                    onChange={(e) =>\n                      updateDrugAllergy(index, 'drug', e.target.value)\n                    }\n                    className=\"border-red-200 focus:border-red-400\"\n                  />\n                  <Input\n                    placeholder=\"Phan ung (vd: Phat ban, Soc phan ve, Kho tho)\"\n                    value={allergy.reaction}\n                    onChange={(e) =>\n                      updateDrugAllergy(index, 'reaction', e.target.value)\n                    }\n                    className=\"border-red-200 focus:border-red-400\"\n                  />\n                </div>\n                <Button\n                  variant=\"ghost\"\n                  size=\"sm\"\n                  onClick={() => removeDrugAllergy(index)}\n                  className=\"text-red-600 hover:text-red-700 hover:bg-red-100\"\n                >\n                  <X className=\"h-4 w-4\" />\n                </Button>\n              </div>\n            </CardContent>\n          </Card>\n        ))}\n      </div>\n\n      {/* Food Allergies */}\n      <div className=\"space-y-4\">\n        <div className=\"flex items-center justify-between\">\n          <div>\n            <Label className=\"text-base font-semibold\">Di ung thuc an</Label>\n            <p className=\"text-sm text-muted-foreground mt-1\">\n              Liet ke cac loai thuc an ma ban bi di ung\n            </p>\n          </div>\n          <Button variant=\"outline\" size=\"sm\" onClick={addFoodAllergy}>\n            <Plus className=\"h-4 w-4 mr-1\" />\n            Them\n          </Button>\n        </div>\n\n        {formData.food_allergies.length === 0 && (\n          <div className=\"py-6 text-center border border-dashed border-muted-foreground/30 rounded-lg\">\n            <p className=\"text-sm text-muted-foreground\">\n              Khong co di ung thuc an da biet.\n            </p>\n          </div>\n        )}\n\n        {formData.food_allergies.map((allergy, index) => (\n          <Card key={index} className=\"bg-muted/30\">\n            <CardContent className=\"py-4\">\n              <div className=\"flex gap-3 items-start\">\n                <div className=\"flex-1 space-y-3\">\n                  <Input\n                    placeholder=\"Loai thuc an (vd: Hai san, Dau phong, Sua)\"\n                    value={allergy.food}\n                    onChange={(e) =>\n                      updateFoodAllergy(index, 'food', e.target.value)\n                    }\n                  />\n                  <Input\n                    placeholder=\"Phan ung (vd: Noi me day, Kho tho, Ngua)\"\n                    value={allergy.reaction}\n                    onChange={(e) =>\n                      updateFoodAllergy(index, 'reaction', e.target.value)\n                    }\n                  />\n                </div>\n                <Button\n                  variant=\"ghost\"\n                  size=\"sm\"\n                  onClick={() => removeFoodAllergy(index)}\n                >\n                  <X className=\"h-4 w-4\" />\n                </Button>\n              </div>\n            </CardContent>\n          </Card>\n        ))}\n      </div>\n    </div>\n  );\n}\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/pre-consultation/steps/LifestyleStep.tsx",
  "content": "/**\n * FR-022: Lifestyle Step (Nhom 5: Loi song)\n */\n\nimport { Cigarette, Wine, Dumbbell } from 'lucide-react';\nimport { Label } from '@/components/ui/label';\nimport { Input } from '@/components/ui/input';\nimport { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';\nimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';\n\nimport type { PreConsultationFormData } from '@/types/pre-consultation';\nimport {\n  SMOKING_LABELS,\n  ALCOHOL_LABELS,\n  EXERCISE_LABELS,\n  type SmokingStatus,\n  type AlcoholStatus,\n  type ExerciseStatus,\n} from '@/types/pre-consultation';\n\ntype Props = {\n  formData: PreConsultationFormData;\n  updateField: <K extends keyof PreConsultationFormData>(\n    field: K,\n    value: PreConsultationFormData[K]\n  ) => void;\n};\n\nexport default function LifestyleStep({ formData, updateField }: Props) {\n  return (\n    <div className=\"space-y-6\">\n      <div>\n        <p className=\"text-sm text-muted-foreground\">\n          Thong tin ve loi song giup bac si danh gia tong quan suc khoe cua ban\n          va dua ra loi khuyen phu hop.\n        </p>\n      </div>\n\n      {/* Smoking */}\n      <Card>\n        <CardHeader className=\"pb-3\">\n          <CardTitle className=\"text-base flex items-center gap-2\">\n            <Cigarette className=\"h-5 w-5 text-muted-foreground\" />\n            Hut thuoc\n          </CardTitle>\n        </CardHeader>\n        <CardContent className=\"space-y-4\">\n          <RadioGroup\n            value={formData.smoking}\n            onValueChange={(v) => updateField('smoking', v as SmokingStatus)}\n            className=\"flex flex-wrap gap-4\"\n          >\n            {(Object.entries(SMOKING_LABELS) as [SmokingStatus, string][]).map(\n              ([value, label]) => (\n                <div key={value} className=\"flex items-center space-x-2\">\n                  <RadioGroupItem value={value} id={`smoking-${value}`} />\n                  <Label\n                    htmlFor={`smoking-${value}`}\n                    className=\"cursor-pointer\"\n                  >\n                    {label}\n                  </Label>\n                </div>\n              )\n            )}\n          </RadioGroup>\n\n          {formData.smoking === 'current' && (\n            <Input\n              placeholder=\"Tan suat (vd: 10 dieu/ngay)\"\n              value={formData.smoking_frequency}\n              onChange={(e) =>\n                updateField('smoking_frequency', e.target.value)\n              }\n              className=\"mt-2\"\n            />\n          )}\n\n          {formData.smoking === 'former' && (\n            <Input\n              placeholder=\"Da bo khi nao? (vd: 2 nam truoc)\"\n              value={formData.smoking_frequency}\n              onChange={(e) =>\n                updateField('smoking_frequency', e.target.value)\n              }\n              className=\"mt-2\"\n            />\n          )}\n        </CardContent>\n      </Card>\n\n      {/* Alcohol */}\n      <Card>\n        <CardHeader className=\"pb-3\">\n          <CardTitle className=\"text-base flex items-center gap-2\">\n            <Wine className=\"h-5 w-5 text-muted-foreground\" />\n            Ruou bia\n          </CardTitle>\n        </CardHeader>\n        <CardContent className=\"space-y-4\">\n          <RadioGroup\n            value={formData.alcohol}\n            onValueChange={(v) => updateField('alcohol', v as AlcoholStatus)}\n            className=\"flex flex-wrap gap-4\"\n          >\n            {(Object.entries(ALCOHOL_LABELS) as [AlcoholStatus, string][]).map(\n              ([value, label]) => (\n                <div key={value} className=\"flex items-center space-x-2\">\n                  <RadioGroupItem value={value} id={`alcohol-${value}`} />\n                  <Label\n                    htmlFor={`alcohol-${value}`}\n                    className=\"cursor-pointer\"\n                  >\n                    {label}\n                  </Label>\n                </div>\n              )\n            )}\n          </RadioGroup>\n\n          {(formData.alcohol === 'occasionally' ||\n            formData.alcohol === 'regularly') && (\n            <Input\n              placeholder=\"Tan suat (vd: 2-3 lan/tuan, 1 chai bia/ngay)\"\n              value={formData.alcohol_frequency}\n              onChange={(e) =>\n                updateField('alcohol_frequency', e.target.value)\n              }\n              className=\"mt-2\"\n            />\n          )}\n        </CardContent>\n      </Card>\n\n      {/* Exercise */}\n      <Card>\n        <CardHeader className=\"pb-3\">\n          <CardTitle className=\"text-base flex items-center gap-2\">\n            <Dumbbell className=\"h-5 w-5 text-muted-foreground\" />\n            Van dong/Tap the duc\n          </CardTitle>\n        </CardHeader>\n        <CardContent className=\"space-y-4\">\n          <RadioGroup\n            value={formData.exercise}\n            onValueChange={(v) => updateField('exercise', v as ExerciseStatus)}\n            className=\"flex flex-wrap gap-4\"\n          >\n            {(Object.entries(EXERCISE_LABELS) as [ExerciseStatus, string][]).map(\n              ([value, label]) => (\n                <div key={value} className=\"flex items-center space-x-2\">\n                  <RadioGroupItem value={value} id={`exercise-${value}`} />\n                  <Label\n                    htmlFor={`exercise-${value}`}\n                    className=\"cursor-pointer\"\n                  >\n                    {label}\n                  </Label>\n                </div>\n              )\n            )}\n          </RadioGroup>\n\n          {(formData.exercise === 'occasionally' ||\n            formData.exercise === 'regularly') && (\n            <Input\n              placeholder=\"Chi tiet (vd: 30 phut/ngay, 3 lan/tuan)\"\n              value={formData.exercise_frequency}\n              onChange={(e) =>\n                updateField('exercise_frequency', e.target.value)\n              }\n              className=\"mt-2\"\n            />\n          )}\n        </CardContent>\n      </Card>\n    </div>\n  );\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create database migration for pre_consultations table",
      "status": "completed",
      "activeForm": "Creating database migration for pre_consultations table"
    },
    {
      "content": "Create TypeScript types for pre-consultation",
      "status": "completed",
      "activeForm": "Creating TypeScript types for pre-consultation"
    },
    {
      "content": "Create API functions for pre-consultation CRUD",
      "status": "completed",
      "activeForm": "Creating API functions for pre-consultation CRUD"
    },
    {
      "content": "Create patient pre-consultation form component",
      "status": "completed",
      "activeForm": "Creating patient pre-consultation form component"
    },
    {
      "content": "Create hook for managing pre-consultation form state",
      "status": "completed",
      "activeForm": "Creating hook for managing pre-consultation form state"
    },
    {
      "content": "Create pre-consultation page for patients",
      "status": "in_progress",
      "activeForm": "Creating pre-consultation page for patients"
    },
    {
      "content": "Create doctor view component for pre-consultation data",
      "status": "pending",
      "activeForm": "Creating doctor view component for pre-consultation data"
    },
    {
      "content": "Add routing and integrate with appointments",
      "status": "pending",
      "activeForm": "Adding routing and integrating with appointments"
    }
  ]
}
Now let me create the pre-consultation page for patients:

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/pages/PreConsultation.tsx",
  "content": "/**\n * FR-022: Pre-Consultation Page\n * Patient-facing page for filling health declaration form\n */\n\nimport TopNav from '@/components/TopNav';\nimport Sidebar from '@/components/Sidebar';\nimport PreConsultationForm from '@/components/pre-consultation/PreConsultationForm';\n\nexport default function PreConsultation() {\n  return (\n    <div className=\"flex min-h-screen flex-col\">\n      <TopNav />\n      <div className=\"flex flex-1\">\n        <Sidebar />\n        <main className=\"flex-1 overflow-y-auto bg-muted/30\">\n          <PreConsultationForm />\n        </main>\n      </div>\n    </div>\n  );\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create database migration for pre_consultations table",
      "status": "completed",
      "activeForm": "Creating database migration for pre_consultations table"
    },
    {
      "content": "Create TypeScript types for pre-consultation",
      "status": "completed",
      "activeForm": "Creating TypeScript types for pre-consultation"
    },
    {
      "content": "Create API functions for pre-consultation CRUD",
      "status": "completed",
      "activeForm": "Creating API functions for pre-consultation CRUD"
    },
    {
      "content": "Create patient pre-consultation form component",
      "status": "completed",
      "activeForm": "Creating patient pre-consultation form component"
    },
    {
      "content": "Create hook for managing pre-consultation form state",
      "status": "completed",
      "activeForm": "Creating hook for managing pre-consultation form state"
    },
    {
      "content": "Create pre-consultation page for patients",
      "status": "completed",
      "activeForm": "Creating pre-consultation page for patients"
    },
    {
      "content": "Create doctor view component for pre-consultation data",
      "status": "in_progress",
      "activeForm": "Creating doctor view component for pre-consultation data"
    },
    {
      "content": "Add routing and integrate with appointments",
      "status": "pending",
      "activeForm": "Adding routing and integrating with appointments"
    }
  ]
}
Now let me create the doctor view component for pre-consultation data:

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/pre-consultation/PreConsultationView.tsx",
  "content": "/**\n * FR-022: Pre-Consultation View Component\n * Doctor EMR view for pre-consultation data with warning banners\n */\n\nimport { useEffect, useState } from 'react';\nimport {\n  AlertTriangle,\n  Activity,\n  Loader2,\n  Heart,\n  Pill,\n  Apple,\n  Cigarette,\n  Wine,\n  Dumbbell,\n  Stethoscope,\n  History,\n  Users,\n  Sparkles,\n  FileQuestion,\n} from 'lucide-react';\nimport { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';\nimport { Badge } from '@/components/ui/badge';\nimport { Button } from '@/components/ui/button';\nimport { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';\nimport { Separator } from '@/components/ui/separator';\n\nimport { getPreConsultationByAppointment } from '@/lib/pre-consultation-api';\nimport type { PreConsultation } from '@/types/pre-consultation';\nimport {\n  SYMPTOM_TAG_OPTIONS,\n  MEDICAL_CONDITION_OPTIONS,\n  DURATION_UNIT_LABELS,\n  SMOKING_LABELS,\n  ALCOHOL_LABELS,\n  EXERCISE_LABELS,\n} from '@/types/pre-consultation';\n\ntype Props = {\n  appointmentId: string;\n  onGenerateSOAP?: (preConsultation: PreConsultation) => void;\n};\n\nexport default function PreConsultationView({\n  appointmentId,\n  onGenerateSOAP,\n}: Props) {\n  const [preConsult, setPreConsult] = useState<PreConsultation | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n\n  useEffect(() => {\n    async function load() {\n      setLoading(true);\n      setError(null);\n      try {\n        const data = await getPreConsultationByAppointment(appointmentId);\n        setPreConsult(data);\n      } catch (e) {\n        setError((e as Error).message);\n      } finally {\n        setLoading(false);\n      }\n    }\n\n    load();\n  }, [appointmentId]);\n\n  if (loading) {\n    return (\n      <div className=\"flex items-center justify-center py-12\">\n        <Loader2 className=\"h-6 w-6 animate-spin text-primary\" />\n      </div>\n    );\n  }\n\n  if (error) {\n    return (\n      <Alert variant=\"destructive\">\n        <AlertTriangle className=\"h-4 w-4\" />\n        <AlertTitle>Loi</AlertTitle>\n        <AlertDescription>{error}</AlertDescription>\n      </Alert>\n    );\n  }\n\n  if (!preConsult) {\n    return (\n      <div className=\"text-center py-12 text-muted-foreground\">\n        <FileQuestion className=\"h-12 w-12 mx-auto mb-4 opacity-50\" />\n        <p className=\"font-medium\">Chua co khai bao</p>\n        <p className=\"text-sm mt-1\">\n          Benh nhan chua dien phieu khai bao truoc kham.\n        </p>\n      </div>\n    );\n  }\n\n  if (preConsult.status === 'DRAFT') {\n    return (\n      <div className=\"text-center py-12 text-muted-foreground\">\n        <FileQuestion className=\"h-12 w-12 mx-auto mb-4 opacity-50\" />\n        <p className=\"font-medium\">Dang khai bao</p>\n        <p className=\"text-sm mt-1\">\n          Benh nhan dang trong qua trinh dien phieu. Du lieu se hien thi khi\n          hoan tat.\n        </p>\n      </div>\n    );\n  }\n\n  const hasDrugAllergy = preConsult.flags?.drug_allergy;\n  const hasSeverePain = preConsult.flags?.severe_pain;\n\n  // Helper to get symptom tag label\n  const getSymptomLabel = (tag: string) => {\n    const option = SYMPTOM_TAG_OPTIONS.find((o) => o.value === tag);\n    return option?.label ?? tag;\n  };\n\n  // Helper to get condition label\n  const getConditionLabel = (condition: string) => {\n    const option = MEDICAL_CONDITION_OPTIONS.find((o) => o.value === condition);\n    return option?.label ?? condition;\n  };\n\n  return (\n    <div className=\"space-y-4\">\n      {/* Warning Banners */}\n      {(hasDrugAllergy || hasSeverePain) && (\n        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-3\">\n          {hasDrugAllergy && (\n            <Alert className=\"bg-red-100 border-red-300\">\n              <AlertTriangle className=\"h-5 w-5 text-red-600\" />\n              <AlertTitle className=\"text-red-800 font-bold\">\n                CANH BAO DI UNG\n              </AlertTitle>\n              <AlertDescription className=\"text-red-700\">\n                {preConsult.drug_allergies.map((a) => (\n                  <span key={a.drug}>\n                    {a.drug} → {a.reaction}\n                  </span>\n                ))}\n              </AlertDescription>\n            </Alert>\n          )}\n\n          {hasSeverePain && (\n            <Alert className=\"bg-orange-100 border-orange-300\">\n              <Activity className=\"h-5 w-5 text-orange-600\" />\n              <AlertTitle className=\"text-orange-800 font-bold\">\n                MUC DO DAU\n              </AlertTitle>\n              <AlertDescription className=\"text-orange-700\">\n                Dau du doi ({preConsult.pain_scale}/10)\n              </AlertDescription>\n            </Alert>\n          )}\n        </div>\n      )}\n\n      {/* Main Content Grid */}\n      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-4\">\n        {/* Left Column - Symptoms & Lifestyle */}\n        <div className=\"space-y-4\">\n          {/* Chief Complaint & Symptoms */}\n          <Card>\n            <CardHeader className=\"pb-2\">\n              <CardTitle className=\"text-sm flex items-center gap-2 text-primary\">\n                <Stethoscope className=\"h-4 w-4\" />\n                Trieu chung chinh\n              </CardTitle>\n            </CardHeader>\n            <CardContent>\n              <p className=\"font-semibold text-lg text-foreground\">\n                {preConsult.chief_complaint}\n              </p>\n              {preConsult.symptom_duration && (\n                <p className=\"text-sm text-muted-foreground mt-1\">\n                  Thoi gian: {preConsult.symptom_duration}{' '}\n                  {preConsult.symptom_duration_unit &&\n                    DURATION_UNIT_LABELS[preConsult.symptom_duration_unit].toLowerCase()}\n                </p>\n              )}\n\n              {preConsult.symptom_tags.length > 0 && (\n                <div className=\"mt-3\">\n                  <p className=\"text-xs text-muted-foreground mb-2\">DI KEM</p>\n                  <div className=\"flex flex-wrap gap-1.5\">\n                    {preConsult.symptom_tags.map((tag) => (\n                      <Badge\n                        key={tag}\n                        variant=\"secondary\"\n                        className=\"text-xs\"\n                      >\n                        {getSymptomLabel(tag)}\n                      </Badge>\n                    ))}\n                  </div>\n                </div>\n              )}\n            </CardContent>\n          </Card>\n\n          {/* Lifestyle */}\n          <Card className=\"bg-purple-50/50 border-purple-100\">\n            <CardHeader className=\"pb-2\">\n              <CardTitle className=\"text-sm flex items-center gap-2 text-purple-700\">\n                <Heart className=\"h-4 w-4\" />\n                Loi song\n              </CardTitle>\n            </CardHeader>\n            <CardContent className=\"space-y-3\">\n              <div className=\"flex items-center gap-3\">\n                <Cigarette className=\"h-4 w-4 text-muted-foreground\" />\n                <div>\n                  <p className=\"text-xs text-muted-foreground uppercase\">\n                    Hut thuoc\n                  </p>\n                  <p className=\"font-medium\">\n                    {preConsult.smoking && SMOKING_LABELS[preConsult.smoking]}\n                    {preConsult.smoking_frequency &&\n                      ` (${preConsult.smoking_frequency})`}\n                  </p>\n                </div>\n              </div>\n\n              <div className=\"flex items-center gap-3\">\n                <Wine className=\"h-4 w-4 text-muted-foreground\" />\n                <div>\n                  <p className=\"text-xs text-muted-foreground uppercase\">\n                    Ruou\n                  </p>\n                  <p className=\"font-medium\">\n                    {preConsult.alcohol && ALCOHOL_LABELS[preConsult.alcohol]}\n                    {preConsult.alcohol_frequency &&\n                      ` (${preConsult.alcohol_frequency})`}\n                  </p>\n                </div>\n              </div>\n\n              <div className=\"flex items-center gap-3\">\n                <Dumbbell className=\"h-4 w-4 text-muted-foreground\" />\n                <div>\n                  <p className=\"text-xs text-muted-foreground uppercase\">\n                    Van dong\n                  </p>\n                  <p className=\"font-medium\">\n                    {preConsult.exercise && EXERCISE_LABELS[preConsult.exercise]}\n                    {preConsult.exercise_frequency &&\n                      ` (${preConsult.exercise_frequency})`}\n                  </p>\n                </div>\n              </div>\n            </CardContent>\n          </Card>\n        </div>\n\n        {/* Right Column - History & Medications */}\n        <div className=\"space-y-4\">\n          {/* Medical History */}\n          <Card className=\"bg-rose-50/50 border-rose-100\">\n            <CardHeader className=\"pb-2\">\n              <CardTitle className=\"text-sm flex items-center gap-2 text-rose-700\">\n                <History className=\"h-4 w-4\" />\n                Benh su\n              </CardTitle>\n            </CardHeader>\n            <CardContent>\n              {preConsult.medical_history.length === 0 ? (\n                <p className=\"text-sm text-muted-foreground italic\">\n                  Khong co tien su benh ly dang ke\n                </p>\n              ) : (\n                <ul className=\"space-y-2\">\n                  {preConsult.medical_history.map((item, i) => (\n                    <li key={i} className=\"flex items-start gap-2\">\n                      <span className=\"h-2 w-2 rounded-full bg-rose-400 mt-2 flex-shrink-0\" />\n                      <span>\n                        {getConditionLabel(item.condition)}\n                        {item.details && (\n                          <span className=\"text-muted-foreground\">\n                            {' '}\n                            ({item.details})\n                          </span>\n                        )}\n                      </span>\n                    </li>\n                  ))}\n                </ul>\n              )}\n\n              {preConsult.surgical_history && (\n                <div className=\"mt-3 pt-3 border-t\">\n                  <p className=\"text-xs text-muted-foreground uppercase mb-1\">\n                    Phau thuat\n                  </p>\n                  <p className=\"text-sm\">{preConsult.surgical_history}</p>\n                </div>\n              )}\n\n              {preConsult.family_history.length > 0 && (\n                <div className=\"mt-3 pt-3 border-t\">\n                  <p className=\"text-xs text-muted-foreground uppercase mb-1 flex items-center gap-1\">\n                    <Users className=\"h-3 w-3\" />\n                    Gia dinh\n                  </p>\n                  <ul className=\"space-y-1\">\n                    {preConsult.family_history.map((item, i) => (\n                      <li key={i} className=\"text-sm\">\n                        {item.condition}\n                        {item.relation && (\n                          <span className=\"text-muted-foreground\">\n                            {' '}\n                            ({item.relation})\n                          </span>\n                        )}\n                      </li>\n                    ))}\n                  </ul>\n                </div>\n              )}\n            </CardContent>\n          </Card>\n\n          {/* Current Medications */}\n          <Card className=\"bg-cyan-50/50 border-cyan-100\">\n            <CardHeader className=\"pb-2\">\n              <CardTitle className=\"text-sm flex items-center gap-2 text-cyan-700\">\n                <Pill className=\"h-4 w-4\" />\n                Thuoc dang dung\n              </CardTitle>\n            </CardHeader>\n            <CardContent>\n              {preConsult.current_medications.length === 0 ? (\n                <p className=\"text-sm text-muted-foreground italic\">\n                  Khong dung thuoc\n                </p>\n              ) : (\n                <div className=\"space-y-2\">\n                  {preConsult.current_medications.map((med, i) => (\n                    <div key={i} className=\"bg-white/80 rounded-lg px-3 py-2\">\n                      <p className=\"font-medium\">{med.name} {med.dose}</p>\n                      <p className=\"text-xs text-muted-foreground\">\n                        {med.frequency}\n                      </p>\n                    </div>\n                  ))}\n                </div>\n              )}\n\n              {preConsult.otc_supplements && (\n                <div className=\"mt-3 pt-3 border-t\">\n                  <p className=\"text-xs text-muted-foreground uppercase mb-1\">\n                    Thuc pham chuc nang\n                  </p>\n                  <p className=\"text-sm\">{preConsult.otc_supplements}</p>\n                </div>\n              )}\n            </CardContent>\n          </Card>\n\n          {/* Allergies (if any) */}\n          {(preConsult.drug_allergies.length > 0 ||\n            preConsult.food_allergies.length > 0) && (\n            <Card className=\"bg-amber-50/50 border-amber-100\">\n              <CardHeader className=\"pb-2\">\n                <CardTitle className=\"text-sm flex items-center gap-2 text-amber-700\">\n                  <Apple className=\"h-4 w-4\" />\n                  Di ung\n                </CardTitle>\n              </CardHeader>\n              <CardContent className=\"space-y-3\">\n                {preConsult.drug_allergies.length > 0 && (\n                  <div>\n                    <p className=\"text-xs text-muted-foreground uppercase mb-1\">\n                      Thuoc\n                    </p>\n                    {preConsult.drug_allergies.map((a, i) => (\n                      <div key={i} className=\"text-sm\">\n                        <span className=\"font-medium text-red-700\">\n                          {a.drug}\n                        </span>\n                        <span className=\"text-muted-foreground\">\n                          {' '}\n                          → {a.reaction}\n                        </span>\n                      </div>\n                    ))}\n                  </div>\n                )}\n\n                {preConsult.food_allergies.length > 0 && (\n                  <div>\n                    <p className=\"text-xs text-muted-foreground uppercase mb-1\">\n                      Thuc pham\n                    </p>\n                    {preConsult.food_allergies.map((a, i) => (\n                      <div key={i} className=\"text-sm\">\n                        <span className=\"font-medium\">{a.food}</span>\n                        <span className=\"text-muted-foreground\">\n                          {' '}\n                          → {a.reaction}\n                        </span>\n                      </div>\n                    ))}\n                  </div>\n                )}\n              </CardContent>\n            </Card>\n          )}\n        </div>\n      </div>\n\n      {/* Generate SOAP Button */}\n      {onGenerateSOAP && (\n        <div className=\"pt-4\">\n          <Button\n            onClick={() => onGenerateSOAP(preConsult)}\n            className=\"w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70\"\n          >\n            <Sparkles className=\"h-4 w-4 mr-2\" />\n            Dung thong tin nay tao SOAP tu dong\n          </Button>\n        </div>\n      )}\n    </div>\n  );\n}\n"
}
Now let me create an index file for the pre-consultation components and update the routing:

🔧 Tool: Write
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/pre-consultation/index.ts",
  "content": "/**\n * FR-022: Pre-Consultation Components\n */\n\nexport { default as PreConsultationForm } from './PreConsultationForm';\nexport { default as PreConsultationView } from './PreConsultationView';\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create database migration for pre_consultations table",
      "status": "completed",
      "activeForm": "Creating database migration for pre_consultations table"
    },
    {
      "content": "Create TypeScript types for pre-consultation",
      "status": "completed",
      "activeForm": "Creating TypeScript types for pre-consultation"
    },
    {
      "content": "Create API functions for pre-consultation CRUD",
      "status": "completed",
      "activeForm": "Creating API functions for pre-consultation CRUD"
    },
    {
      "content": "Create patient pre-consultation form component",
      "status": "completed",
      "activeForm": "Creating patient pre-consultation form component"
    },
    {
      "content": "Create hook for managing pre-consultation form state",
      "status": "completed",
      "activeForm": "Creating hook for managing pre-consultation form state"
    },
    {
      "content": "Create pre-consultation page for patients",
      "status": "completed",
      "activeForm": "Creating pre-consultation page for patients"
    },
    {
      "content": "Create doctor view component for pre-consultation data",
      "status": "completed",
      "activeForm": "Creating doctor view component for pre-consultation data"
    },
    {
      "content": "Add routing and integrate with appointments",
      "status": "in_progress",
      "activeForm": "Adding routing and integrating with appointments"
    }
  ]
}
Now let me update the App.tsx to add the pre-consultation route:

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/App.tsx"
}

🔧 Tool: Edit
Input: {
  "file_path": "/projects/healthcare-system-ns/src/App.tsx",
  "old_string": "import BookAppointment from \"./pages/BookAppointment.tsx\";\nimport Support from \"./pages/Support.tsx\";",
  "new_string": "import BookAppointment from \"./pages/BookAppointment.tsx\";\nimport PreConsultation from \"./pages/PreConsultation.tsx\";\nimport Support from \"./pages/Support.tsx\";"
}

🔧 Tool: Edit
Input: {
  "file_path": "/projects/healthcare-system-ns/src/App.tsx",
  "old_string": "<Route\n              path=\"/appointments/book\"\n              element={\n                <ProtectedRoute requiredPortal=\"patient\">\n                  <BookAppointment />\n                </ProtectedRoute>\n              }\n            />\n            <Route\n              path=\"/support\"",
  "new_string": "<Route\n              path=\"/appointments/book\"\n              element={\n                <ProtectedRoute requiredPortal=\"patient\">\n                  <BookAppointment />\n                </ProtectedRoute>\n              }\n            />\n            <Route\n              path=\"/appointments/:appointmentId/pre-consultation\"\n              element={\n                <ProtectedRoute requiredPortal=\"patient\">\n                  <PreConsultation />\n                </ProtectedRoute>\n              }\n            />\n            <Route\n              path=\"/support\""
}
Now let me update the AppointmentsContent to add a button for pre-consultation:

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/AppointmentsContent.tsx"
}

🔧 Tool: Edit
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/AppointmentsContent.tsx",
  "old_string": "import {\n  Calendar, Plus, Loader2, QrCode, XCircle, ChevronRight, Stethoscope,\n} from 'lucide-react';",
  "new_string": "import {\n  Calendar, Plus, Loader2, QrCode, XCircle, ChevronRight, Stethoscope, ClipboardList,\n} from 'lucide-react';"
}

🔧 Tool: Edit
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/AppointmentsContent.tsx",
  "old_string": "function UpcomingCard({\n  apt, cancelling, onCancel,\n}: {\n  apt: Appointment;\n  cancelling: boolean;\n  onCancel: () => void;\n}) {\n  const dateLabel = apt.slot_date\n    ? format(parseISO(apt.slot_date), 'EEEE, dd/MM/yyyy', { locale: vi })\n    : '—';\n\n  return (\n    <div className=\"rounded-xl border bg-card p-5\">\n      <div className=\"flex items-start justify-between mb-3\">\n        <div className=\"flex items-center gap-3\">\n          <div className=\"h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0\">\n            <Stethoscope className=\"h-5 w-5 text-primary\" />\n          </div>\n          <div>\n            <p className=\"text-sm font-bold text-foreground\">{apt.specialty_name}</p>\n            <p className=\"text-xs font-semibold text-primary\">\n              {formatSlotTime(apt.start_time)} — {dateLabel}\n            </p>\n          </div>\n        </div>\n        <StatusBadge status={apt.status} />\n      </div>\n\n      {apt.note && (\n        <p className=\"text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mb-3 line-clamp-2\">\n          {apt.note}\n        </p>\n      )}\n\n      {/* QR Token */}\n      {apt.status === 'CONFIRMED' && (\n        <div className=\"flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 mb-3\">\n          <QrCode className=\"h-4 w-4 text-foreground flex-shrink-0\" />\n          <span className=\"text-[11px] font-mono text-muted-foreground truncate flex-1\">\n            {apt.qr_token}\n          </span>\n        </div>\n      )}\n\n      {/* Actions */}\n      {apt.status === 'CONFIRMED' && (\n        <button\n          onClick={onCancel}\n          disabled={cancelling}\n          className=\"flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline disabled:opacity-50\"\n        >\n          {cancelling ? (\n            <Loader2 className=\"h-3 w-3 animate-spin\" />\n          ) : (\n            <XCircle className=\"h-3.5 w-3.5\" />\n          )}\n          Hủy lịch\n        </button>\n      )}\n    </div>\n  );\n}",
  "new_string": "function UpcomingCard({\n  apt, cancelling, onCancel,\n}: {\n  apt: Appointment;\n  cancelling: boolean;\n  onCancel: () => void;\n}) {\n  const navigate = useNavigate();\n  const dateLabel = apt.slot_date\n    ? format(parseISO(apt.slot_date), 'EEEE, dd/MM/yyyy', { locale: vi })\n    : '—';\n\n  return (\n    <div className=\"rounded-xl border bg-card p-5\">\n      <div className=\"flex items-start justify-between mb-3\">\n        <div className=\"flex items-center gap-3\">\n          <div className=\"h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0\">\n            <Stethoscope className=\"h-5 w-5 text-primary\" />\n          </div>\n          <div>\n            <p className=\"text-sm font-bold text-foreground\">{apt.specialty_name}</p>\n            <p className=\"text-xs font-semibold text-primary\">\n              {formatSlotTime(apt.start_time)} — {dateLabel}\n            </p>\n          </div>\n        </div>\n        <StatusBadge status={apt.status} />\n      </div>\n\n      {apt.note && (\n        <p className=\"text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mb-3 line-clamp-2\">\n          {apt.note}\n        </p>\n      )}\n\n      {/* QR Token */}\n      {apt.status === 'CONFIRMED' && (\n        <div className=\"flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 mb-3\">\n          <QrCode className=\"h-4 w-4 text-foreground flex-shrink-0\" />\n          <span className=\"text-[11px] font-mono text-muted-foreground truncate flex-1\">\n            {apt.qr_token}\n          </span>\n        </div>\n      )}\n\n      {/* Actions */}\n      {apt.status === 'CONFIRMED' && (\n        <div className=\"flex items-center gap-4\">\n          {/* Pre-consultation button */}\n          <button\n            onClick={() => navigate(`/appointments/${apt.id}/pre-consultation`)}\n            className=\"flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline\"\n          >\n            <ClipboardList className=\"h-3.5 w-3.5\" />\n            Khai báo trước khám\n          </button>\n\n          {/* Cancel button */}\n          <button\n            onClick={onCancel}\n            disabled={cancelling}\n            className=\"flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline disabled:opacity-50\"\n          >\n            {cancelling ? (\n              <Loader2 className=\"h-3 w-3 animate-spin\" />\n            ) : (\n              <XCircle className=\"h-3.5 w-3.5\" />\n            )}\n            Hủy lịch\n          </button>\n        </div>\n      )}\n    </div>\n  );\n}"
}
Now let me also add a pre-consultation tab to the doctor's view. Let me check if there's a provider appointments page where we can integrate this:

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/pages/provider/ProviderAppointmentsPage.tsx"
}
Let me check the AppointmentDetailSheet to integrate the pre-consultation view there:

🔧 Tool: Read
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/admin/appointments/AppointmentDetailSheet.tsx"
}
Let me update the AppointmentDetailSheet to include a tab for pre-consultation data:

🔧 Tool: Edit
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/admin/appointments/AppointmentDetailSheet.tsx",
  "old_string": "import { useEffect, useState } from \"react\";\nimport { format, differenceInYears, parseISO } from \"date-fns\";\nimport { Clock, Stethoscope, Phone, CalendarCheck, X, FileUser, UserRoundPlus } from \"lucide-react\";\nimport { Sheet, SheetContent, SheetHeader, SheetTitle } from \"@/components/ui/sheet\";\nimport { Button } from \"@/components/ui/button\";\nimport { Badge } from \"@/components/ui/badge\";\nimport CancelDialog from \"./CancelDialog\";\nimport RescheduleDialog from \"./RescheduleDialog\";\nimport PatientRecordDialog from \"./PatientRecordDialog\";\nimport AdminCreateProfileDialog from \"./AdminCreateProfileDialog\";\nimport type { AdminAppointment } from \"@/types/admin-appointment\";\nimport {\n  ADMIN_STATUS_LABEL, ADMIN_STATUS_DOT,\n} from \"@/types/admin-appointment\";\nimport { adminCheckinAppointment } from \"@/lib/admin-appointment-api\";\nimport { supabase } from \"@/lib/supabase\";\nimport { toast } from \"sonner\";\nimport { Loader2 } from \"lucide-react\";",
  "new_string": "import { useEffect, useState } from \"react\";\nimport { format, differenceInYears, parseISO } from \"date-fns\";\nimport { Clock, Stethoscope, Phone, CalendarCheck, X, FileUser, UserRoundPlus, ClipboardList } from \"lucide-react\";\nimport { Sheet, SheetContent, SheetHeader, SheetTitle } from \"@/components/ui/sheet\";\nimport { Button } from \"@/components/ui/button\";\nimport { Badge } from \"@/components/ui/badge\";\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from \"@/components/ui/tabs\";\nimport CancelDialog from \"./CancelDialog\";\nimport RescheduleDialog from \"./RescheduleDialog\";\nimport PatientRecordDialog from \"./PatientRecordDialog\";\nimport AdminCreateProfileDialog from \"./AdminCreateProfileDialog\";\nimport PreConsultationView from \"@/components/pre-consultation/PreConsultationView\";\nimport type { AdminAppointment } from \"@/types/admin-appointment\";\nimport {\n  ADMIN_STATUS_LABEL, ADMIN_STATUS_DOT,\n} from \"@/types/admin-appointment\";\nimport { adminCheckinAppointment } from \"@/lib/admin-appointment-api\";\nimport { supabase } from \"@/lib/supabase\";\nimport { toast } from \"sonner\";\nimport { Loader2 } from \"lucide-react\";"
}

🔧 Tool: Edit
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/admin/appointments/AppointmentDetailSheet.tsx",
  "old_string": "const [createProfileOpen, setCreateProfileOpen] = useState(false);\n  // null = still checking, true/false = has uploaded ID documents\n  const [hasProfile, setHasProfile] = useState<boolean | null>(null);",
  "new_string": "const [createProfileOpen, setCreateProfileOpen] = useState(false);\n  // null = still checking, true/false = has uploaded ID documents\n  const [hasProfile, setHasProfile] = useState<boolean | null>(null);\n  const [activeTab, setActiveTab] = useState<\"info\" | \"preconsult\">(\"info\");"
}
Now let me update the Sheet content to use tabs:

🔧 Tool: Edit
Input: {
  "file_path": "/projects/healthcare-system-ns/src/components/admin/appointments/AppointmentDetailSheet.tsx",
  "old_string": "<Sheet open={open} onOpenChange={onClose}>\n        <SheetContent className=\"w-full sm:max-w-md overflow-y-auto\">\n          <SheetHeader className=\"mb-6\">\n            <SheetTitle>Chi tiết lịch hẹn</SheetTitle>\n          </SheetHeader>\n\n          {/* Patient card */}\n          <div className=\"rounded-2xl bg-card border p-5 mb-4 space-y-4\">\n            <div className=\"flex items-center gap-4\">\n              <div className=\"h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary\">\n                {initials}\n              </div>\n              <div>\n                <p className=\"font-semibold text-lg leading-tight\">{appointment.patient_name || \"—\"}</p>\n                {age !== null && (\n                  <p className=\"text-sm text-muted-foreground\">{age} tuổi</p>\n                )}\n              </div>\n            </div>\n\n            {appointment.patient_phone && (\n              <div className=\"flex items-center gap-2 text-sm text-muted-foreground\">\n                <Phone className=\"h-4 w-4\" />\n                {appointment.patient_phone}\n              </div>\n            )}\n\n            {appointment.specialty_name && (\n              <div className=\"flex items-center gap-2 text-sm text-muted-foreground\">\n                <Stethoscope className=\"h-4 w-4\" />\n                {appointment.specialty_name}\n              </div>\n            )}\n          </div>\n\n          {/* Time + Doctor cards */}\n          <div className=\"grid grid-cols-2 gap-3 mb-4\">\n            <div className=\"rounded-2xl bg-cyan-50 border border-cyan-100 p-4\">\n              <div className=\"flex items-center gap-2 mb-2\">\n                <Clock className=\"h-4 w-4 text-cyan-600\" />\n                <span className=\"text-xs font-medium text-cyan-700 uppercase tracking-wide\">Giờ hẹn</span>\n              </div>\n              <p className=\"text-lg font-bold text-cyan-900\">\n                {appointment.slot_date && appointment.start_time\n                  ? appointment.start_time.slice(0, 5)\n                  : \"Walk-in\"}\n              </p>\n              {appointment.slot_date && (\n                <p className=\"text-xs text-cyan-700 mt-0.5\">\n                  {format(parseISO(appointment.slot_date), \"dd/MM/yyyy\")}\n                </p>\n              )}\n            </div>\n\n            <div className=\"rounded-2xl bg-purple-50 border border-purple-100 p-4\">\n              <div className=\"flex items-center gap-2 mb-2\">\n                <CalendarCheck className=\"h-4 w-4 text-purple-600\" />\n                <span className=\"text-xs font-medium text-purple-700 uppercase tracking-wide\">Bác sĩ</span>\n              </div>\n              <p className=\"text-sm font-bold text-purple-900 leading-tight\">\n                {appointment.doctor_name || \"—\"}\n              </p>\n            </div>\n          </div>\n\n          {/* Reason */}\n          {appointment.note && (\n            <div className=\"rounded-2xl bg-muted/50 border p-4 mb-4 space-y-1\">\n              <p className=\"text-xs font-medium text-muted-foreground uppercase tracking-wide\">Lý do khám</p>\n              <p className=\"text-sm italic\">\"{appointment.note}\"</p>\n            </div>\n          )}\n\n          {/* Status + walk-in badge */}\n          <div className=\"flex items-center justify-between rounded-2xl bg-muted/30 border px-4 py-3 mb-6\">\n            <div className=\"flex items-center gap-2\">\n              <span className={`h-2.5 w-2.5 rounded-full ${ADMIN_STATUS_DOT[appointment.status]}`} />\n              <span className=\"text-sm font-medium\">{ADMIN_STATUS_LABEL[appointment.status]}</span>\n              {appointment.walk_in && (\n                <Badge variant=\"secondary\" className=\"text-xs\">Walk-in</Badge>\n              )}\n            </div>\n            <span className=\"text-xs text-muted-foreground font-mono\">#{shortId}</span>\n          </div>\n\n          {/* Cancel reason if cancelled */}\n          {appointment.status === \"CANCELLED\" && appointment.cancel_reason && (\n            <div className=\"rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 mb-6 flex gap-3\">\n              <X className=\"h-4 w-4 text-destructive shrink-0 mt-0.5\" />\n              <div>\n                <p className=\"text-xs font-medium text-destructive mb-0.5\">Lý do hủy</p>\n                <p className=\"text-sm text-destructive/80\">{appointment.cancel_reason}</p>\n              </div>\n            </div>\n          )}\n\n          {/* Actions */}\n          <div className=\"space-y-2\">\n            {hasProfile === false ? (\n              <Button variant=\"outline\" className=\"w-full\" onClick={() => setCreateProfileOpen(true)}>\n                <UserRoundPlus className=\"mr-2 h-4 w-4\" />\n                Tạo hồ sơ bệnh nhân\n              </Button>\n            ) : (\n              <Button variant=\"outline\" className=\"w-full\" onClick={() => setProfileOpen(true)}>\n                <FileUser className=\"mr-2 h-4 w-4\" />\n                Xem hồ sơ bệnh nhân\n              </Button>\n            )}\n\n            {canCheckin && (\n              <Button\n                className=\"w-full\"\n                onClick={handleCheckin}\n                disabled={checkingIn || hasProfile === false || hasProfile === null}\n                title={hasProfile === false ? \"Bệnh nhân chưa có hồ sơ\" : undefined}\n              >\n                {checkingIn\n                  ? <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />\n                  : <CalendarCheck className=\"mr-2 h-4 w-4\" />\n                }\n                Check-in ngay\n                {hasProfile === null && <Loader2 className=\"ml-2 h-3 w-3 animate-spin opacity-60\" />}\n              </Button>\n            )}\n\n            {canReschedule && (\n              <Button variant=\"outline\" className=\"w-full\" onClick={() => setRescheduleOpen(true)}>\n                Đổi lịch\n              </Button>\n            )}\n\n            {canCancel && (\n              <Button variant=\"ghost\" className=\"w-full text-destructive hover:text-destructive hover:bg-destructive/10\"\n                onClick={() => setCancelOpen(true)}>\n                Hủy lịch hẹn\n              </Button>\n            )}\n          </div>\n        </SheetContent>\n      </Sheet>",
  "new_string": "<Sheet open={open} onOpenChange={onClose}>\n        <SheetContent className=\"w-full sm:max-w-lg overflow-y-auto\">\n          <SheetHeader className=\"mb-4\">\n            <SheetTitle>Chi tiết lịch hẹn</SheetTitle>\n          </SheetHeader>\n\n          {/* Tabs */}\n          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as \"info\" | \"preconsult\")}>\n            <TabsList className=\"w-full mb-4\">\n              <TabsTrigger value=\"info\" className=\"flex-1\">\n                <Stethoscope className=\"h-4 w-4 mr-2\" />\n                Thông tin\n              </TabsTrigger>\n              <TabsTrigger value=\"preconsult\" className=\"flex-1\">\n                <ClipboardList className=\"h-4 w-4 mr-2\" />\n                Khai báo trước khám\n              </TabsTrigger>\n            </TabsList>\n\n            {/* Info Tab */}\n            <TabsContent value=\"info\">\n              {/* Patient card */}\n              <div className=\"rounded-2xl bg-card border p-5 mb-4 space-y-4\">\n                <div className=\"flex items-center gap-4\">\n                  <div className=\"h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary\">\n                    {initials}\n                  </div>\n                  <div>\n                    <p className=\"font-semibold text-lg leading-tight\">{appointment.patient_name || \"—\"}</p>\n                    {age !== null && (\n                      <p className=\"text-sm text-muted-foreground\">{age} tuổi</p>\n                    )}\n                  </div>\n                </div>\n\n                {appointment.patient_phone && (\n                  <div className=\"flex items-center gap-2 text-sm text-muted-foreground\">\n                    <Phone className=\"h-4 w-4\" />\n                    {appointment.patient_phone}\n                  </div>\n                )}\n\n                {appointment.specialty_name && (\n                  <div className=\"flex items-center gap-2 text-sm text-muted-foreground\">\n                    <Stethoscope className=\"h-4 w-4\" />\n                    {appointment.specialty_name}\n                  </div>\n                )}\n              </div>\n\n              {/* Time + Doctor cards */}\n              <div className=\"grid grid-cols-2 gap-3 mb-4\">\n                <div className=\"rounded-2xl bg-cyan-50 border border-cyan-100 p-4\">\n                  <div className=\"flex items-center gap-2 mb-2\">\n                    <Clock className=\"h-4 w-4 text-cyan-600\" />\n                    <span className=\"text-xs font-medium text-cyan-700 uppercase tracking-wide\">Giờ hẹn</span>\n                  </div>\n                  <p className=\"text-lg font-bold text-cyan-900\">\n                    {appointment.slot_date && appointment.start_time\n                      ? appointment.start_time.slice(0, 5)\n                      : \"Walk-in\"}\n                  </p>\n                  {appointment.slot_date && (\n                    <p className=\"text-xs text-cyan-700 mt-0.5\">\n                      {format(parseISO(appointment.slot_date), \"dd/MM/yyyy\")}\n                    </p>\n                  )}\n                </div>\n\n                <div className=\"rounded-2xl bg-purple-50 border border-purple-100 p-4\">\n                  <div className=\"flex items-center gap-2 mb-2\">\n                    <CalendarCheck className=\"h-4 w-4 text-purple-600\" />\n                    <span className=\"text-xs font-medium text-purple-700 uppercase tracking-wide\">Bác sĩ</span>\n                  </div>\n                  <p className=\"text-sm font-bold text-purple-900 leading-tight\">\n                    {appointment.doctor_name || \"—\"}\n                  </p>\n                </div>\n              </div>\n\n              {/* Reason */}\n              {appointment.note && (\n                <div className=\"rounded-2xl bg-muted/50 border p-4 mb-4 space-y-1\">\n                  <p className=\"text-xs font-medium text-muted-foreground uppercase tracking-wide\">Lý do khám</p>\n                  <p className=\"text-sm italic\">\"{appointment.note}\"</p>\n                </div>\n              )}\n\n              {/* Status + walk-in badge */}\n              <div className=\"flex items-center justify-between rounded-2xl bg-muted/30 border px-4 py-3 mb-6\">\n                <div className=\"flex items-center gap-2\">\n                  <span className={`h-2.5 w-2.5 rounded-full ${ADMIN_STATUS_DOT[appointment.status]}`} />\n                  <span className=\"text-sm font-medium\">{ADMIN_STATUS_LABEL[appointment.status]}</span>\n                  {appointment.walk_in && (\n                    <Badge variant=\"secondary\" className=\"text-xs\">Walk-in</Badge>\n                  )}\n                </div>\n                <span className=\"text-xs text-muted-foreground font-mono\">#{shortId}</span>\n              </div>\n\n              {/* Cancel reason if cancelled */}\n              {appointment.status === \"CANCELLED\" && appointment.cancel_reason && (\n                <div className=\"rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 mb-6 flex gap-3\">\n                  <X className=\"h-4 w-4 text-destructive shrink-0 mt-0.5\" />\n                  <div>\n                    <p className=\"text-xs font-medium text-destructive mb-0.5\">Lý do hủy</p>\n                    <p className=\"text-sm text-destructive/80\">{appointment.cancel_reason}</p>\n                  </div>\n                </div>\n              )}\n\n              {/* Actions */}\n              <div className=\"space-y-2\">\n                {hasProfile === false ? (\n                  <Button variant=\"outline\" className=\"w-full\" onClick={() => setCreateProfileOpen(true)}>\n                    <UserRoundPlus className=\"mr-2 h-4 w-4\" />\n                    Tạo hồ sơ bệnh nhân\n                  </Button>\n                ) : (\n                  <Button variant=\"outline\" className=\"w-full\" onClick={() => setProfileOpen(true)}>\n                    <FileUser className=\"mr-2 h-4 w-4\" />\n                    Xem hồ sơ bệnh nhân\n                  </Button>\n                )}\n\n                {canCheckin && (\n                  <Button\n                    className=\"w-full\"\n                    onClick={handleCheckin}\n                    disabled={checkingIn || hasProfile === false || hasProfile === null}\n                    title={hasProfile === false ? \"Bệnh nhân chưa có hồ sơ\" : undefined}\n                  >\n                    {checkingIn\n                      ? <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />\n                      : <CalendarCheck className=\"mr-2 h-4 w-4\" />\n                    }\n                    Check-in ngay\n                    {hasProfile === null && <Loader2 className=\"ml-2 h-3 w-3 animate-spin opacity-60\" />}\n                  </Button>\n                )}\n\n                {canReschedule && (\n                  <Button variant=\"outline\" className=\"w-full\" onClick={() => setRescheduleOpen(true)}>\n                    Đổi lịch\n                  </Button>\n                )}\n\n                {canCancel && (\n                  <Button variant=\"ghost\" className=\"w-full text-destructive hover:text-destructive hover:bg-destructive/10\"\n                    onClick={() => setCancelOpen(true)}>\n                    Hủy lịch hẹn\n                  </Button>\n                )}\n              </div>\n            </TabsContent>\n\n            {/* Pre-consultation Tab */}\n            <TabsContent value=\"preconsult\">\n              <PreConsultationView\n                appointmentId={appointment.id}\n                onGenerateSOAP={(pc) => {\n                  // TODO: Integrate with SOAP generation (FR-024)\n                  toast.info(\"Chức năng tạo SOAP tự động đang được phát triển.\");\n                }}\n              />\n            </TabsContent>\n          </Tabs>\n        </SheetContent>\n      </Sheet>"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create database migration for pre_consultations table",
      "status": "completed",
      "activeForm": "Creating database migration for pre_consultations table"
    },
    {
      "content": "Create TypeScript types for pre-consultation",
      "status": "completed",
      "activeForm": "Creating TypeScript types for pre-consultation"
    },
    {
      "content": "Create API functions for pre-consultation CRUD",
      "status": "completed",
      "activeForm": "Creating API functions for pre-consultation CRUD"
    },
    {
      "content": "Create patient pre-consultation form component",
      "status": "completed",
      "activeForm": "Creating patient pre-consultation form component"
    },
    {
      "content": "Create hook for managing pre-consultation form state",
      "status": "completed",
      "activeForm": "Creating hook for managing pre-consultation form state"
    },
    {
      "content": "Create pre-consultation page for patients",
      "status": "completed",
      "activeForm": "Creating pre-consultation page for patients"
    },
    {
      "content": "Create doctor view component for pre-consultation data",
      "status": "completed",
      "activeForm": "Creating doctor view component for pre-consultation data"
    },
    {
      "content": "Add routing and integrate with appointments",
      "status": "completed",
      "activeForm": "Adding routing and integrating with appointments"
    }
  ]
}
Now let me verify the code compiles by checking for any TypeScript errors. Let me also check if there's a tsconfig to understand the project setup:

🔧 Tool: Bash
Input: {
  "command": "cd /projects/healthcare-system-ns && npm run typecheck 2>&1 || true",
  "description": "Run TypeScript type checking",
  "timeout": 60000
}

🔧 Tool: Bash
Input: {
  "command": "cd /projects/healthcare-system-ns && npx tsc --noEmit 2>&1 | head -100",
  "description": "Run TypeScript compiler",
  "timeout": 120000
}

🔧 Tool: Bash
Input: {
  "command": "cd /projects/healthcare-system-ns && npm run build 2>&1 | head -100",
  "description": "Run build to check for errors",
  "timeout": 120000
}

🔧 Tool: Bash
Input: {
  "command": "cd /projects/healthcare-system-ns && npm install 2>&1 | tail -20",
  "description": "Install npm dependencies",
  "timeout": 180000
}

🔧 Tool: Bash
Input: {
  "command": "cd /projects/healthcare-system-ns && npm run build 2>&1 | tail -80",
  "description": "Run build to check for errors",
  "timeout": 180000
}
The build completed successfully. The code compiles without TypeScript errors. Now let me create a quick summary of all the files I created/modified:

🔧 Tool: Bash
Input: {
  "command": "cd /projects/healthcare-system-ns && git status 2>&1",
  "description": "Check git status for all changes"
}
All the implementation is complete. Let me provide the final summary:

<summary>
## Summary: FR-022 - Pre-Consultation Health Declaration (Khai Báo Y Tế Trước Khám)

### Changes Implemented

#### Database Layer
- Created new migration `20260618200000_pre_consultations.sql` with:
  - `pre_consultations` table with all 5 data groups (symptoms, medical history, medications, allergies, lifestyle)
  - Status enum: `DRAFT` (auto-save while filling) and `SUBMITTED` (immutable after completion)
  - Computed `flags` field for `drug_allergy` and `severe_pain` warnings
  - RPC functions: `create_pre_consultation`, `update_pre_consultation`, `submit_pre_consultation`, `get_pre_consultation_by_appointment`
  - RLS policies for patients (CRUD own), doctors/staff (read), admin (full)
  - Realtime enabled for live updates

#### API Layer
- Created `src/lib/pre-consultation-api.ts` with type-safe functions:
  - `createPreConsultation()` - Creates new draft (idempotent)
  - `getPreConsultationByAppointment()` - Fetch by appointment
  - `updatePreConsultation()` - Auto-save updates
  - `submitPreConsultation()` - Finalize and compute flags
  - `getPreConsultationStatus()` - Check status quickly

#### Type Definitions
- Created `src/types/pre-consultation.ts` with:
  - All data types (MedicalHistoryItem, MedicationItem, DrugAllergyItem, etc.)
  - Form data types and validation functions
  - Constants for symptom tags, medical conditions, lifestyle options
  - Step navigation types and labels (Vietnamese)

#### React Components
- Created `src/components/pre-consultation/` directory with:
  - `PreConsultationForm.tsx` - Main multi-step form container
  - `PreConsultationView.tsx` - Doctor EMR view with warning banners
  - Step components:
    - `SymptomsStep.tsx` - Chief complaint, duration, pain scale slider, symptom tags
    - `MedicalHistoryStep.tsx` - Conditions checkboxes, surgical history, family history
    - `MedicationsStep.tsx` - Current medications array, OTC supplements
    - `AllergiesStep.tsx` - Drug allergies (red styling), food allergies
    - `LifestyleStep.tsx` - Smoking, alcohol, exercise radio groups

#### Custom Hook
- Created `src/hooks/usePreConsultationForm.ts` with:
  - Auto-save with 2-second debounce
  - Multi-step navigation
  - Form validation
  - Submit with flag calculation

#### Pages & Routing
- Created `src/pages/PreConsultation.tsx` - Patient form page
- Updated `src/App.tsx` - Added route `/appointments/:appointmentId/pre-consultation`

#### Integration
- Updated `src/components/AppointmentsContent.tsx`:
  - Added "Khai báo trước khám" button on CONFIRMED appointments
- Updated `src/components/admin/appointments/AppointmentDetailSheet.tsx`:
  - Added tabs: "Thông tin" and "Khai báo trước khám"
  - Integrated PreConsultationView for doctors to see patient data

### Files Created
- `supabase/migrations/20260618200000_pre_consultations.sql`
- `src/types/pre-consultation.ts`
- `src/lib/pre-consultation-api.ts`
- `src/hooks/usePreConsultationForm.ts`
- `src/pages/PreConsultation.tsx`
- `src/components/pre-consultation/PreConsultationForm.tsx`
- `src/components/pre-consultation/PreConsultationView.tsx`
- `src/components/pre-consultation/index.ts`
- `src/components/pre-consultation/steps/SymptomsStep.tsx`
- `src/components/pre-consultation/steps/MedicalHistoryStep.tsx`
- `src/components/pre-consultation/steps/MedicationsStep.tsx`
- `src/components/pre-consultation/steps/AllergiesStep.tsx`
- `src/components/pre-consultation/steps/LifestyleStep.tsx`

### Files Modified
- `src/App.tsx` - Added pre-consultation route
- `src/components/AppointmentsContent.tsx` - Added pre-consultation button
- `src/components/admin/appointments/AppointmentDetailSheet.tsx` - Added pre-consultation tab

### Notes for Developer
1. **Database Migration**: Run `supabase db push` or apply the migration to create the `pre_consultations` table
2. **Business Rules Implemented**:
   - RULE-022a: Only CONFIRMED appointments can have pre-consultation
   - RULE-022b: Cannot modify after SUBMITTED status
   - RULE-022c: Data stored permanently (immutable)
   - RULE-022d: `drug_allergy` flag when any drug allergy exists
   - RULE-022e: `severe_pain` flag when pain_scale >= 7
3. **Auto-save**: Form auto-saves 2 seconds after each field change
4. **Required Fields**: `chief_complaint` and `symptom_duration` are required for submission
5. **SOAP Integration**: The "Generate SOAP" button is a placeholder for FR-024 integration
6. **SMS/Push Reminders**: T-2h and T-30p reminders need to be implemented via a scheduled function (not included in this scope)
</summary>