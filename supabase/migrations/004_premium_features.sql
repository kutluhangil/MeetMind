-- =============================================
-- 004_premium_features.sql
-- =============================================

-- Create meeting messages table for Phase 1 (AI Chat)
CREATE TABLE IF NOT EXISTS meeting_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id    UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meeting_messages ENABLE ROW LEVEL SECURITY;

-- Select policy: Allow access if user owns the meeting or is in the organization
CREATE POLICY "meeting_messages_select" ON meeting_messages
  FOR SELECT USING (
    meeting_id IN (
      SELECT id FROM meetings
      WHERE user_id = auth.uid()
      OR org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    )
  );

-- Insert policy: User can insert messages if they are the author and own the meeting
CREATE POLICY "meeting_messages_insert" ON meeting_messages
  FOR INSERT WITH CHECK (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
    AND user_id = auth.uid()
  );

-- Delete policy: User can delete messages if they own the meeting
CREATE POLICY "meeting_messages_delete" ON meeting_messages
  FOR DELETE USING (
    meeting_id IN (SELECT id FROM meetings WHERE user_id = auth.uid())
  );

-- Index for fast chat queries
CREATE INDEX IF NOT EXISTS idx_meeting_messages_meeting_id ON meeting_messages(meeting_id);

-- Add template_type column for Phase 3 (AI Templates)
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'general';

-- Add transcript_segments column for Phase 2 (Speaker Diarization)
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS transcript_segments JSONB;
