import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    recipients: string[];
    subject?: string;
    includeTranscript?: boolean;
  };

  if (!body.recipients?.length) {
    return NextResponse.json({ error: 'recipients required' }, { status: 400 });
  }

  // Log as pending first
  const { data: emailLog, error: logError } = await admin
    .from('email_logs')
    .insert({
      meeting_id: params.id,
      user_id: user.id,
      recipients: body.recipients,
      subject: body.subject ?? 'Meeting Summary',
      status: 'pending',
    })
    .select()
    .single();

  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 });

  // Enqueue email job via worker
  const workerUrl = `${process.env.WORKER_INTERNAL_URL ?? 'http://localhost:3002'}/enqueue`;
  try {
    await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-worker-secret': process.env.WORKER_API_SECRET ?? '',
      },
      body: JSON.stringify({
        queue: 'email',
        jobName: `email:${params.id}:${Date.now()}`,
        data: {
          meetingId: params.id,
          userId: user.id,
          recipients: body.recipients,
          subject: body.subject,
          includeTranscript: body.includeTranscript ?? false,
        },
      }),
    });
  } catch {
    // Worker unreachable — email stays pending, can be retried
  }

  return NextResponse.json({ emailLogId: emailLog.id });
}
