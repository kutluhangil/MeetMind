-- =============================================
-- 001_initial_schema.sql
-- =============================================

-- User profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  locale        TEXT DEFAULT 'tr' CHECK (locale IN ('tr', 'en')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations (for Team plan)
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  owner_id      UUID NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Org members
CREATE TABLE org_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_at    TIMESTAMPTZ DEFAULT NOW(),
  joined_at     TIMESTAMPTZ,
  UNIQUE(org_id, user_id)
);

-- Subscriptions (Lemon Squeezy)
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org_id                UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lemon_squeezy_id      TEXT UNIQUE,
  lemon_subscription_id TEXT UNIQUE,
  plan                  TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  status                TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  currency              TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'TRY')),
  billing_interval      TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings
CREATE TABLE meetings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id            UUID REFERENCES organizations(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  language          TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en', 'auto')),

  -- File info
  audio_file_path   TEXT,
  audio_file_size   BIGINT,
  audio_duration    INTEGER,

  -- Processing status
  status            TEXT DEFAULT 'pending' CHECK (
                      status IN (
                        'pending',
                        'queued',
                        'transcribing',
                        'summarizing',
                        'completed',
                        'failed'
                      )
                    ),
  job_id            TEXT,
  error_message     TEXT,

  -- AI outputs
  transcript        TEXT,
  summary           TEXT,
  key_decisions     JSONB,

  -- Metadata
  meeting_date      TIMESTAMPTZ DEFAULT NOW(),
  participants      JSONB,
  tags              TEXT[],

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Action items extracted from meetings
CREATE TABLE action_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id),

  title           TEXT NOT NULL,
  description     TEXT,

  assignee_name   TEXT,
  assignee_email  TEXT,
  assignee_id     UUID REFERENCES profiles(id),

  status          TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date        DATE,
  completed_at    TIMESTAMPTZ,

  ai_extracted    BOOLEAN DEFAULT TRUE,
  confidence      FLOAT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Email send logs
CREATE TABLE email_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id),
  recipients      TEXT[],
  subject         TEXT,
  resend_id       TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at         TIMESTAMPTZ,
  error           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking for free plan limits
CREATE TABLE usage_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  org_id          UUID REFERENCES organizations(id),
  action          TEXT NOT NULL CHECK (action IN ('meeting_created', 'email_sent')),
  period_year     INTEGER NOT NULL,
  period_month    INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_meetings_user_id    ON meetings(user_id);
CREATE INDEX idx_meetings_org_id     ON meetings(org_id);
CREATE INDEX idx_meetings_status     ON meetings(status);
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC);
CREATE INDEX idx_action_items_meeting ON action_items(meeting_id);
CREATE INDEX idx_action_items_user   ON action_items(user_id);
CREATE INDEX idx_usage_logs_user     ON usage_logs(user_id, period_year, period_month);
