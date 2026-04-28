import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const FREE_PLAN_LIMIT = 5;

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');
  const from = (page - 1) * limit;

  const { data: meetings, error, count } = await supabase
    .from('meetings')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ meetings: meetings ?? [], total: count ?? 0, page });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check plan limits
  const { data: planData } = await admin.rpc('get_user_plan', { p_user_id: user.id });
  const plan = planData as string ?? 'free';

  if (plan === 'free') {
    const { data: usageData } = await admin.rpc('get_monthly_usage', { p_user_id: user.id });
    const usage = usageData as number ?? 0;
    if (usage >= FREE_PLAN_LIMIT) {
      return NextResponse.json(
        { error: 'Monthly meeting limit reached. Upgrade to Pro for unlimited meetings.' },
        { status: 403 }
      );
    }
  }

  const body = await req.json() as {
    title: string;
    language?: 'tr' | 'en' | 'auto';
    audioFilePath: string;
    audioFileSize?: number;
    participants?: Array<{ name: string; email?: string }>;
  };

  const { data: meeting, error } = await supabase
    .from('meetings')
    .insert({
      user_id: user.id,
      title: body.title,
      language: body.language ?? 'auto',
      audio_file_path: body.audioFilePath,
      audio_file_size: body.audioFileSize ?? null,
      participants: body.participants ?? null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log usage
  await admin.from('usage_logs').insert({
    user_id: user.id,
    action: 'meeting_created',
    period_year: new Date().getFullYear(),
    period_month: new Date().getMonth() + 1,
  });

  // Enqueue transcription job
  const workerUrl = `${process.env.WORKER_INTERNAL_URL ?? 'http://localhost:3002'}/enqueue`;
  try {
    await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-worker-secret': process.env.WORKER_API_SECRET ?? '',
      },
      body: JSON.stringify({
        queue: 'transcription',
        jobName: `transcription:${meeting.id}`,
        data: {
          meetingId: meeting.id,
          audioFilePath: body.audioFilePath,
          language: body.language ?? 'auto',
          userId: user.id,
        },
      }),
    });

    await supabase
      .from('meetings')
      .update({ status: 'queued' })
      .eq('id', meeting.id);
  } catch {
    // Worker enqueue failed — meeting stays in 'pending', can be retried
  }

  return NextResponse.json({ meeting }, { status: 201 });
}
