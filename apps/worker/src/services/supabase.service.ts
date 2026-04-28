import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return client;
}

export async function getMeeting(meetingId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .single();
  if (error) throw new Error(`getMeeting: ${error.message}`);
  return data;
}

export async function updateMeeting(meetingId: string, updates: Record<string, unknown>) {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from('meetings')
    .update(updates)
    .eq('id', meetingId);
  if (error) throw new Error(`updateMeeting: ${error.message}`);
}

export async function insertActionItems(
  items: Array<{
    meeting_id: string;
    user_id: string;
    title: string;
    description?: string | null;
    assignee_name?: string | null;
    assignee_email?: string | null;
    due_date?: string | null;
    priority: string;
    confidence?: number | null;
    ai_extracted: boolean;
  }>
) {
  const db = getSupabaseAdmin();
  const { error } = await db.from('action_items').insert(items);
  if (error) throw new Error(`insertActionItems: ${error.message}`);
}

export async function getActionItemsForMeeting(meetingId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('action_items')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at');
  if (error) throw new Error(`getActionItems: ${error.message}`);
  return data ?? [];
}

export async function insertEmailLog(log: {
  meeting_id: string;
  user_id: string;
  recipients: string[];
  subject: string;
  resend_id?: string | null;
  status: string;
  sent_at?: string | null;
  error?: string | null;
}) {
  const db = getSupabaseAdmin();
  const { error } = await db.from('email_logs').insert(log);
  if (error) throw new Error(`insertEmailLog: ${error.message}`);
}

export async function downloadAudioFile(storagePath: string, localPath: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.storage.from('meetings').download(storagePath);
  if (error) throw new Error(`downloadAudioFile: ${error.message}`);

  const { writeFile } = await import('fs/promises');
  const buffer = Buffer.from(await data.arrayBuffer());
  await writeFile(localPath, buffer);
}
