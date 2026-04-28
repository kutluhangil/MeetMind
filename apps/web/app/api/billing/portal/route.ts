import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('lemon_squeezy_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!subscription?.lemon_squeezy_id) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
  }

  // Fetch portal URL from Lemon Squeezy
  const response = await fetch(
    `https://api.lemonsqueezy.com/v1/subscriptions/${subscription.lemon_squeezy_id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.LEMON_API_KEY}`,
        Accept: 'application/vnd.api+json',
      },
    }
  );

  const data = await response.json() as {
    data?: { attributes?: { urls?: { customer_portal?: string } } };
  };
  const portalUrl = data.data?.attributes?.urls?.customer_portal;

  if (!portalUrl) return NextResponse.json({ error: 'Portal URL not available' }, { status: 500 });
  return NextResponse.json({ portalUrl });
}
