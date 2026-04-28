'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SubscriptionInfo {
  plan: 'free' | 'pro' | 'team';
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription(userId: string | null) {
  const [info, setInfo] = useState<SubscriptionInfo>({
    plan: 'free',
    status: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const supabase = createClient();

    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setInfo({
            plan: data.plan as 'free' | 'pro' | 'team',
            status: data.status,
            currentPeriodEnd: data.current_period_end,
            cancelAtPeriodEnd: data.cancel_at_period_end,
          });
        }
        setLoading(false);
      });
  }, [userId]);

  const isPro = info.plan === 'pro' || info.plan === 'team';
  const isTeam = info.plan === 'team';

  return { ...info, isPro, isTeam, loading };
}
