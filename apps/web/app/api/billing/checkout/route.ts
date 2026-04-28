import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutUrl } from '@/lib/lemon-squeezy';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const variantId = searchParams.get('variantId');
  const currency = (searchParams.get('currency') ?? 'USD') as 'USD' | 'TRY';

  if (!variantId) return NextResponse.json({ error: 'variantId required' }, { status: 400 });

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
