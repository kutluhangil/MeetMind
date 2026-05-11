import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: meeting } = await supabase
    .from('meetings')
    .select('audio_file_path, language, status')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (meeting.status !== 'failed') {
    return NextResponse.json({ error: 'Only failed meetings can be retried' }, { status: 400 });
  }
  if (!meeting.audio_file_path) {
    return NextResponse.json({ error: 'No audio file to process' }, { status: 400 });
  }

  await supabase
    .from('meetings')
    .update({ status: 'pending', error_message: null })
    .eq('id', params.id);

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
        jobName: `transcription:${params.id}:retry:${Date.now()}`,
        data: {
          meetingId: params.id,
          audioFilePath: meeting.audio_file_path,
          language: meeting.language ?? 'auto',
          userId: user.id,
        },
      }),
    });

    if (enqueueRes.ok) {
      await supabase.from('meetings').update({ status: 'queued' }).eq('id', params.id);
    }
  } catch {
    // Worker unreachable — meeting stays in 'pending', can be retried later
  }

  return NextResponse.json({ success: true });
}
