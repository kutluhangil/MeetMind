import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { MeetingStatus } from '@/types/database';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-worker-secret');
  if (secret !== process.env.WORKER_API_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json() as {
    type: 'status_update' | 'error';
    meetingId: string;
    status?: MeetingStatus;
    error?: string;
  };

  const admin = createAdminClient();

  if (body.type === 'status_update' && body.meetingId && body.status) {
    await admin
      .from('meetings')
      .update({ status: body.status })
      .eq('id', body.meetingId);
  }

  if (body.type === 'error' && body.meetingId) {
    await admin
      .from('meetings')
      .update({ status: 'failed', error_message: body.error ?? 'Unknown error' })
      .eq('id', body.meetingId);
  }

  return new NextResponse('OK');
}
