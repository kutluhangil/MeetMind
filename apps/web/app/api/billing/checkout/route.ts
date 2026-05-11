import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutUrl } from '@/lib/lemon-squeezy';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const currency = (searchParams.get('currency') ?? 'USD') as 'USD' | 'TRY';

  // Accept either an explicit variantId or plan+interval for server-side resolution
  let variantId = searchParams.get('variantId');
  if (!variantId) {
    const plan = searchParams.get('plan') as 'pro' | 'team' | null;
    const interval = (searchParams.get('interval') ?? 'monthly') as 'monthly' | 'yearly';
    if (!plan || !['pro', 'team'].includes(plan)) {
      return NextResponse.json({ error: 'variantId or plan required' }, { status: 400 });
    }
    const key = `LEMON_${plan.toUpperCase()}_${interval.toUpperCase()}_${currency}_ID`;
    variantId = process.env[key] ?? null;
    if (!variantId) return NextResponse.json({ error: `Missing env var: ${key}` }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  const checkoutUrl = await createCheckoutUrl({
    variantId,
    userId: user.id,
    email: profile?.email ?? user.email ?? '',
    currency,
  });

  return NextResponse.json({ checkoutUrl });
}
