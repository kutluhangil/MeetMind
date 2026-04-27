-- =============================================
-- 002_rls_policies.sql
-- =============================================

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs      ENABLE ROW LEVEL SECURITY;

-- ── Profiles ────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow profile to be created on sign-up via trigger
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ── Organizations ────────────────────────────────────────────────
CREATE POLICY "orgs_select_member" ON organizations
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

CREATE POLICY "orgs_insert_owner" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "orgs_update_owner" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

-- ── Org Members ─────────────────────────────────────────────────
CREATE POLICY "org_members_select" ON org_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR org_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "org_members_insert_owner" ON org_members
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "org_members_delete" ON org_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR org_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- ── Subscriptions ────────────────────────────────────────────────
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Subscriptions are only written by webhooks (service key bypasses RLS)

-- ── Meetings ─────────────────────────────────────────────────────
CREATE POLICY "meetings_select" ON meetings
  FOR SELECT USING (
    user_id = auth.uid()
    OR org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "meetings_insert" ON meetings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "meetings_update" ON meetings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "meetings_delete" ON meetings
  FOR DELETE USING (user_id = auth.uid());

-- ── Action Items ─────────────────────────────────────────────────
CREATE POLICY "action_items_select" ON action_items
  FOR SELECT USING (
    meeting_id IN (
      SELECT id FROM meetings
      WHERE user_id = auth.uid()
      OR org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "action_items_insert" ON action_items
  FOR INSERT WITH CHECK (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

CREATE POLICY "action_items_update" ON action_items
  FOR UPDATE USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

-- ── Email Logs ───────────────────────────────────────────────────
CREATE POLICY "email_logs_select" ON email_logs
  FOR SELECT USING (user_id = auth.uid());

-- ── Usage Logs ───────────────────────────────────────────────────
CREATE POLICY "usage_logs_select" ON usage_logs
  FOR SELECT USING (user_id = auth.uid());
