import { createClient } from '@/lib/supabase/server';
import { DashboardAnalytics } from '@/components/dashboard/dashboard-analytics';

export async function DashboardAnalyticsWrapper({ locale }: { locale: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [allMeetingsRes, allActionsRes] = await Promise.all([
    supabase
      .from('meetings')
      .select('title, audio_duration, sentiment, created_at')
      .eq('user_id', user.id),
    supabase
      .from('action_items')
      .select('status')
      .eq('user_id', user.id),
  ]);

  return (
    <DashboardAnalytics
      meetings={allMeetingsRes.data ?? []}
      actionItems={allActionsRes.data ?? []}
      locale={locale}
    />
  );
}

export function DashboardAnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="h-[400px] rounded-2xl bg-obsidian-800/60 border border-obsidian-600 animate-pulse" />
      <div className="h-[400px] rounded-2xl bg-obsidian-800/60 border border-obsidian-600 animate-pulse" />
    </div>
  );
}
