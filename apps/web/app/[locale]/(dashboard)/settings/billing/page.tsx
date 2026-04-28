import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function BillingPage() {
  const t = await getTranslations('billing');
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [subscriptionRes, planRes, usageRes] = await Promise.all([
    admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.rpc('get_user_plan', { p_user_id: user!.id }),
    admin.rpc('get_monthly_usage', { p_user_id: user!.id }),
  ]);

  const subscription = subscriptionRes.data;
  const plan = (planRes.data as string | null) ?? 'free';
  const usage = (usageRes.data as number | null) ?? 0;

  const PLANS = {
    free:  { name: t('plans.free.name'),  limit: t('plans.free.limit')  },
    pro:   { name: t('plans.pro.name'),   limit: t('plans.pro.limit')   },
    team:  { name: t('plans.team.name'),  limit: t('plans.team.limit')  },
  };

  const currentPlan = PLANS[plan as keyof typeof PLANS] ?? PLANS.free;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-display font-bold text-slate-100">{t('title')}</h1>

      {/* Current plan card */}
      <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{t('currentPlan')}</p>
            <p className="text-xl font-semibold text-slate-100 mt-1">{currentPlan.name}</p>
            <p className="text-sm text-slate-400 mt-0.5">{currentPlan.limit}</p>
          </div>
          {plan === 'free' && (
            <span className="px-3 py-1 rounded-full bg-obsidian-700 text-slate-400 text-xs font-medium border border-obsidian-500">
              Free
            </span>
          )}
          {plan === 'pro' && (
            <span className="px-3 py-1 rounded-full bg-phosphor/10 text-phosphor text-xs font-medium border border-phosphor/20">
              Pro
            </span>
          )}
          {plan === 'team' && (
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
              Team
            </span>
          )}
        </div>

        {plan === 'free' && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Monthly usage</span>
              <span>{usage}/5</span>
            </div>
            <div className="w-full h-1.5 bg-obsidian-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-phosphor rounded-full transition-all"
                style={{ width: `${Math.min((usage / 5) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {subscription && (
          <div className="pt-2 border-t border-obsidian-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Renewal</span>
              <span className="text-slate-300">
                {subscription.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : '—'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade / manage */}
      {plan === 'free' ? (
        <a
          href="/pricing"
          className="block w-full py-3 rounded-xl bg-phosphor text-obsidian-950 font-semibold text-center hover:bg-phosphor-glow transition-colors"
        >
          {t('upgrade')}
        </a>
      ) : (
        <ManageButton />
      )}
    </div>
  );
}

function ManageButton() {
  return (
    <a
      href="/api/billing/portal"
      className="block w-full py-3 rounded-xl bg-obsidian-700 border border-obsidian-500 text-slate-200 font-semibold text-center hover:border-obsidian-400 hover:bg-obsidian-600 transition-colors"
    >
      Manage Subscription
    </a>
  );
}
