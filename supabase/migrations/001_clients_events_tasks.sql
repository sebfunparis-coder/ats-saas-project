-- Migration 001: Tables clients, events, tasks
-- À exécuter dans l'éditeur SQL de Supabase (https://supabase.com/dashboard → SQL Editor)

-- TABLE: clients
CREATE TABLE IF NOT EXISTS public.clients (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  industry        TEXT,
  email           TEXT,
  phone           TEXT,
  website         TEXT,
  address         TEXT,
  city            TEXT,
  zip_code        TEXT,
  country         TEXT DEFAULT 'France',
  status          TEXT DEFAULT 'prospect' CHECK (status IN ('active', 'prospect', 'inactive')),
  siret           TEXT,
  size            TEXT,
  revenue         TEXT,
  emoji           TEXT DEFAULT '🏢',
  color           TEXT DEFAULT '#667EEA',
  notes           TEXT,
  contacts        JSONB DEFAULT '[]'::JSONB,
  links           JSONB DEFAULT '[]'::JSONB,
  documents       JSONB DEFAULT '[]'::JSONB,
  missions_count  INTEGER DEFAULT 0,
  last_contact    DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_company_clients"
  ON public.clients FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- TABLE: events
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'meeting'
                    CHECK (type IN ('interview','meeting','deadline','phone_screen','reminder','task')),
  date            DATE NOT NULL,
  time            TEXT,
  duration        INTEGER,
  description     TEXT,
  location        TEXT,
  attendees       JSONB DEFAULT '[]'::JSONB,
  candidate_id    UUID,
  mission_id      UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_company_events"
  ON public.events FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- TABLE: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  due_date        DATE,
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done')),
  assigned_to     TEXT,
  related_to      JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_company_tasks"
  ON public.tasks FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- TABLE: team_members (membres internes de l'équipe RH, distinct des profils Supabase Auth)
CREATE TABLE IF NOT EXISTS public.team_members (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  role            TEXT DEFAULT 'recruiter',
  avatar          TEXT,
  color           TEXT,
  active          BOOLEAN DEFAULT TRUE,
  hire_date       DATE,
  permissions     JSONB DEFAULT '["read"]'::JSONB,
  stats           JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_company_team"
  ON public.team_members FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_clients_company_id     ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_events_company_id      ON public.events(company_id);
CREATE INDEX IF NOT EXISTS idx_events_date             ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id       ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status            ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_team_members_company_id ON public.team_members(company_id);
