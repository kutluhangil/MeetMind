import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');

  const hmac = createHmac('sha256', process.env.LEMON_WEBHOOK_SECRET!);
  const digest = hmac.update(rawBody).digest('hex');
  if (digest !== signature) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    meta: { event_name: string; custom_data?: { user_id?: string } };
    data: {
      id: string;
      attributes: {
        status: string;
        currency: string;
        product_name: string;
        subscription_id?: number;
        renews_at?: string;
        ends_at?: string;
        billing_anchor?: number;
        user_email?: string;
      };
    };
  };

  const admin = createAdminClient();
  const eventName = event.meta.event_name;

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
    case 'subscription_resumed':
      await handleSubscriptionUpsert(event, admin);
      break;
    case 'subscription_cancelled':
      await handleSubscriptionCancelled(event, admin);
      break;
    case 'subscription_expired':
      await handleSubscriptionExpired(event, admin);
      break;
  }

  return new NextResponse('OK');
}

async function handleSubscriptionUpsert(event: ReturnType<typeof parseEvent>, admin: ReturnType<typeof createAdminClient>) {
  const userId = event.meta.custom_data?.user_id;
  if (!userId) return;

  const attrs = event.data.attributes;

  await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      lemon_squeezy_id: event.data.id,
      lemon_subscription_id: String(attrs.subscription_id ?? ''),
      plan: attrs.product_name.toLowerCase().includes('team') ? 'team' : 'pro',
      status: attrs.status as 'active' | 'paused' | 'cancelled' | 'expired',
      currency: (attrs.currency ?? 'USD') as 'USD' | 'TRY',
      billing_interval: attrs.billing_anchor ? 'yearly' : 'monthly',
      current_period_start: attrs.renews_at ? new Date(attrs.renews_at).toISOString() : null,
      current_period_end: attrs.ends_at ? new Date(attrs.ends_at).toISOString() : null,
    },
    { onConflict: 'lemon_squeezy_id' }
  );
}

async function handleSubscriptionCancelled(event: ReturnType<typeof parseEvent>, admin: ReturnType<typeof createAdminClient>) {
  await admin
    .from('subscriptions')
    .update({ status: 'cancelled', cancel_at_period_end: true })
    .eq('lemon_squeezy_id', event.data.id);
}

async function handleSubscriptionExpired(event: ReturnType<typeof parseEvent>, admin: ReturnType<typeof createAdminClient>) {
  await admin
    .from('subscriptions')
    .update({ status: 'expired' })
    .eq('lemon_squeezy_id', event.data.id);
}

function parseEvent(event: unknown) {
  return event as {
    meta: { event_name: string; custom_data?: { user_id?: string } };
    data: {
      id: string;
      attributes: {
        status: string;
        currency: string;
        product_name: string;
        subscription_id?: number;
        renews_at?: string;
        ends_at?: string;
        billing_anchor?: number;
      };
    };
  };
}
