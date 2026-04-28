import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { filename, contentType, meetingId } = await req.json() as {
    filename: string;
    contentType: string;
    meetingId: string;
  };

  const storagePath = `${user.id}/${meetingId}/${filename}`;

  const { data, error } = await supabase.storage
    .from('meetings')
    .createSignedUploadUrl(storagePath);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ uploadUrl: data.signedUrl, path: storagePath });
}
