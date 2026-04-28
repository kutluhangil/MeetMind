import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email } = await req.json() as { email: string };
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  // Find the org this user owns
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!org) return NextResponse.json({ error: 'No organization found' }, { status: 404 });

  // Check if user already exists in system
  const { data: inviteeProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (inviteeProfile) {
    const { error } = await supabase.from('org_members').upsert({
      org_id: org.id,
      user_id: inviteeProfile.id,
      role: 'member',
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: send invite email via Resend when user doesn't exist yet

  return NextResponse.json({ success: true });
}
