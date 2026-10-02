-- ==============================================================================
-- ClinScope Row Level Security (RLS) Configuration
-- Ensures doctors have isolated access exclusively to their own research studies,
-- protocol forms, and patient observational records.
-- ==============================================================================

-- 1. Enable RLS on all research tables
ALTER TABLE IF EXISTS public.research_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.research_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy/duplicate policies if they exist
DROP POLICY IF EXISTS "Doctors can view own studies" ON public.research_studies;
DROP POLICY IF EXISTS "Doctors can insert own studies" ON public.research_studies;
DROP POLICY IF EXISTS "Doctors can update own studies" ON public.research_studies;
DROP POLICY IF EXISTS "Doctors can delete own studies" ON public.research_studies;

DROP POLICY IF EXISTS "Doctors can view forms for own studies" ON public.research_forms;
DROP POLICY IF EXISTS "Doctors can insert forms for own studies" ON public.research_forms;
DROP POLICY IF EXISTS "Doctors can update forms for own studies" ON public.research_forms;
DROP POLICY IF EXISTS "Doctors can delete forms for own studies" ON public.research_forms;

DROP POLICY IF EXISTS "Doctors can view records for own studies" ON public.research_records;
DROP POLICY IF EXISTS "Doctors can insert records for own studies" ON public.research_records;
DROP POLICY IF EXISTS "Doctors can update records for own studies" ON public.research_records;
DROP POLICY IF EXISTS "Doctors can delete records for own studies" ON public.research_records;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 4. RESEARCH STUDIES POLICIES
CREATE POLICY "Doctors can view own studies"
  ON public.research_studies
  FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert own studies"
  ON public.research_studies
  FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own studies"
  ON public.research_studies
  FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete own studies"
  ON public.research_studies
  FOR DELETE
  USING (auth.uid() = doctor_id);

-- 5. RESEARCH FORMS POLICIES (Scoped via study_id -> doctor_id)
CREATE POLICY "Doctors can view forms for own studies"
  ON public.research_forms
  FOR SELECT
  USING (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can insert forms for own studies"
  ON public.research_forms
  FOR INSERT
  WITH CHECK (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update forms for own studies"
  ON public.research_forms
  FOR UPDATE
  USING (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  )
  WITH CHECK (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete forms for own studies"
  ON public.research_forms
  FOR DELETE
  USING (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  );

-- 6. RESEARCH RECORDS POLICIES (Scoped via study_id -> doctor_id)
CREATE POLICY "Doctors can view records for own studies"
  ON public.research_records
  FOR SELECT
  USING (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can insert records for own studies"
  ON public.research_records
  FOR INSERT
  WITH CHECK (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update records for own studies"
  ON public.research_records
  FOR UPDATE
  USING (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  )
  WITH CHECK (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete records for own studies"
  ON public.research_records
  FOR DELETE
  USING (
    study_id IN (
      SELECT id FROM public.research_studies WHERE doctor_id = auth.uid()
    )
  );
