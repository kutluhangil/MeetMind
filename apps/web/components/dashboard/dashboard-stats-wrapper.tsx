import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Link } from '@/lib/navigation';

export async function DashboardStatsWrapper() {
  const t = await getTranslations('dashboard');
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [usageRes, planRes, actionsRes, emailsRes] = await Promise.all([
    admin.rpc('get_monthly_usage', { p_user_id: user.id }),
    admin.rpc('get_user_plan', { p_user_id: user.id }),
    supabase.from('action_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'open'),
    supabase.from('email_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'sent'),
  ]);

  const monthlyUsage = (usageRes.data as number | null) ?? 0;
  const plan = (planRes.data as string | null) ?? 'free';
  const openActionsCount = actionsRes.count ?? 0;
  const emailsSentCount = emailsRes.count ?? 0;

  const stats = [
    { label: t('stats.meetings'), value: monthlyUsage, sub: t('stats.thisMonth') },
    { label: t('stats.actions'), value: openActionsCount },
    { label: t('stats.emails'), value: emailsSentCount, sub: t('stats.thisMonth') },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-slate-100 mt-1">{stat.value}</p>
            {stat.sub && <p className="text-xs text-slate-600 mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {plan === 'free' && (
        <div className="rounded-2xl bg-phosphor/5 border border-phosphor/20 p-4 flex items-center justify-between mt-8">
          <div>
            <p className="text-sm font-medium text-phosphor">Free Plan — {monthlyUsage}/5 meetings this month</p>
            <p className="text-xs text-slate-500 mt-0.5">Upgrade to Pro for unlimited meetings.</p>
          </div>
          <Link
            href="/settings/billing"
            className="px-4 py-2 rounded-xl bg-phosphor text-obsidian-950 text-sm font-semibold hover:bg-phosphor-glow transition-colors"
          >
            Upgrade
          </Link>
        </div>
      )}
    </>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5 animate-pulse">
          <div className="h-4 w-1/3 bg-obsidian-700 rounded mb-2"></div>
          <div className="h-8 w-1/2 bg-obsidian-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}
