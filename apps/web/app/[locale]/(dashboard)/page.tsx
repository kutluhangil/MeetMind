import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Link } from '@/lib/navigation';
import { StatusBadge } from '@/components/meetings/status-badge';
import type { Meeting, MeetingStatus } from '@/types/database';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [meetingsRes, usageRes, planRes] = await Promise.all([
    supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
    admin.rpc('get_monthly_usage', { p_user_id: user!.id }),
    admin.rpc('get_user_plan', { p_user_id: user!.id }),
  ]);

  const meetings: Meeting[] = meetingsRes.data ?? [];
  const monthlyUsage = (usageRes.data as number | null) ?? 0;
  const plan = (planRes.data as string | null) ?? 'free';

  const { count: openActionsCount } = await supabase
    .from('action_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('status', 'open');

  const { count: emailsSentCount } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('status', 'sent');

  const stats = [
    { label: t('stats.meetings'), value: monthlyUsage, sub: t('stats.thisMonth') },
    { label: t('stats.actions'), value: openActionsCount ?? 0 },
    { label: t('stats.emails'), value: emailsSentCount ?? 0, sub: t('stats.thisMonth') },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100">{t('title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-slate-100 mt-1">{stat.value}</p>
            {stat.sub && <p className="text-xs text-slate-600 mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Plan upgrade banner */}
      {plan === 'free' && (
        <div className="rounded-2xl bg-phosphor/5 border border-phosphor/20 p-4 flex items-center justify-between">
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

      {/* Recent meetings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">{t('recent.title')}</h2>
          <Link
            href="/meetings/new"
            className="px-3 py-1.5 rounded-xl bg-phosphor text-obsidian-950 text-xs font-semibold hover:bg-phosphor-glow transition-colors"
          >
            + {t('newMeeting')}
          </Link>
        </div>

        {meetings.length === 0 ? (
          <div className="rounded-2xl bg-obsidian-800/40 border border-obsidian-700 p-8 text-center">
            <p className="text-slate-500 text-sm">{t('recent.empty')}</p>
            <Link
              href="/meetings/new"
              className="inline-block mt-3 px-4 py-2 rounded-xl bg-phosphor text-obsidian-950 text-sm font-semibold hover:bg-phosphor-glow transition-colors"
            >
              {t('newMeeting')}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-obsidian-800/60 border border-obsidian-600 hover:border-obsidian-400 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-slate-100 truncate">
                    {meeting.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(meeting.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge meetingId={meeting.id} initialStatus={meeting.status as MeetingStatus} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
