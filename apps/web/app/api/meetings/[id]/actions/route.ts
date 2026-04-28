import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ActionItemStatus, ActionItemPriority } from '@/types/database';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    title: string;
    description?: string;
    assignee_name?: string;
    assignee_email?: string;
    due_date?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };

  const { data: actionItem, error } = await supabase
    .from('action_items')
    .insert({
      meeting_id: params.id,
      user_id: user.id,
      title: body.title,
      description: body.description ?? null,
      assignee_name: body.assignee_name ?? null,
      assignee_email: body.assignee_email ?? null,
      due_date: body.due_date ?? null,
      priority: body.priority ?? 'medium',
      ai_extracted: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ actionItem }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    actionId: string;
    status?: ActionItemStatus;
    priority?: ActionItemPriority;
    due_date?: string | null;
    assignee_email?: string | null;
    assignee_name?: string | null;
    title?: string;
  };

  const { actionId, status, priority, due_date, assignee_email, assignee_name, title } = body;

  const { data: actionItem, error } = await supabase
    .from('action_items')
    .update({
      ...(title !== undefined && { title }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(due_date !== undefined && { due_date }),
      ...(assignee_email !== undefined && { assignee_email }),
      ...(assignee_name !== undefined && { assignee_name }),
      ...(status === 'completed' && { completed_at: new Date().toISOString() }),
    })
    .eq('id', actionId)
    .eq('meeting_id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ actionItem });
}
