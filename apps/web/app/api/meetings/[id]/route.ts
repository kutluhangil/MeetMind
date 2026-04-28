import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/database';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: actionItems } = await supabase
    .from('action_items')
    .select('*')
    .eq('meeting_id', params.id)
    .order('created_at');

  const { data: emailLogs } = await supabase
    .from('email_logs')
    .select('*')
    .eq('meeting_id', params.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    meeting,
    actionItems: actionItems ?? [],
    emailLogs: emailLogs ?? [],
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;

  const { data: meeting, error } = await supabase
    .from('meetings')
    .update({
      ...(body.title !== undefined && { title: body.title as string }),
      ...(body.description !== undefined && { description: body.description as string | null }),
      ...(body.summary !== undefined && { summary: body.summary as string | null }),
      ...(body.key_decisions !== undefined && { key_decisions: body.key_decisions as Json | null }),
      ...(body.tags !== undefined && { tags: body.tags as string[] }),
      ...(body.meeting_date !== undefined && { meeting_date: body.meeting_date as string }),
    })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ meeting });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
