import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
  const audioFilePath = body.audioFilePath as string | undefined;

  const { data: meeting, error } = await supabase
    .from('meetings')
    .update({
      ...(body.title !== undefined && { title: body.title as string }),
      ...(body.description !== undefined && { description: body.description as string | null }),
      ...(body.summary !== undefined && { summary: body.summary as string | null }),
      ...(body.key_decisions !== undefined && { key_decisions: body.key_decisions as import('@/types/database').Json | null }),
      ...(body.tags !== undefined && { tags: body.tags as string[] }),
      ...(body.meeting_date !== undefined && { meeting_date: body.meeting_date as string }),
      ...(audioFilePath !== undefined && { audio_file_path: audioFilePath, status: 'pending' }),
    })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // When a real audio file path is provided, enqueue transcription
  if (audioFilePath && audioFilePath !== '__pending__') {
    const workerUrl = `${process.env.WORKER_INTERNAL_URL ?? 'http://localhost:3002'}/enqueue`;
    try {
      const enqueueRes = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-worker-secret': process.env.WORKER_API_SECRET ?? '',
        },
        body: JSON.stringify({
          queue: 'transcription',
          jobName: `transcription:${params.id}`,
          data: {
            meetingId: params.id,
            audioFilePath,
            language: meeting.language ?? 'auto',
            userId: user.id,
            templateType: meeting.template_type ?? 'general',
          },
        }),
      });
      if (enqueueRes.ok) {
        await supabase.from('meetings').update({ status: 'queued' }).eq('id', params.id);
      }
    } catch {
      // Worker unreachable — meeting stays in 'pending', can be retried
    }
  }

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
