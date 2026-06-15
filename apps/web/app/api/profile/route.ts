import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    full_name?: string;
    locale?: 'tr' | 'en';
    slack_webhook_url?: string | null;
    notion_api_key?: string | null;
    notion_database_id?: string | null;
  };
  const update: {
    full_name?: string;
    locale?: string;
    slack_webhook_url?: string | null;
    notion_api_key?: string | null;
    notion_database_id?: string | null;
  } = {};
  if (body.full_name !== undefined) update.full_name = body.full_name;
  if (body.locale !== undefined) update.locale = body.locale;
  if (body.slack_webhook_url !== undefined) update.slack_webhook_url = body.slack_webhook_url;
  if (body.notion_api_key !== undefined) update.notion_api_key = body.notion_api_key;
  if (body.notion_database_id !== undefined) update.notion_database_id = body.notion_database_id;

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

export async function DELETE() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Supabase cascade silme: profiles → meetings → action_items, email_logs, usage_logs
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
