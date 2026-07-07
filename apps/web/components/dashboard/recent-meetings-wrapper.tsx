import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/lib/navigation';
import { RealtimeMeetingsList } from '@/components/dashboard/realtime-meetings-list';
import type { Meeting } from '@/types/database';

export async function RecentMeetingsWrapper() {
  const t = await getTranslations('dashboard');
  const cookieStore = await cookies();
  const isDemo = cookieStore.get('demo_mode')?.value === 'true';

  if (isDemo) {
    const mockMeetings = [
      { id: '1', user_id: 'demo-user', title: 'Project Kickoff', status: 'completed', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '2', user_id: 'demo-user', title: 'Weekly Sync', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', user_id: 'demo-user', title: 'Client Pitch', status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 172800000).toISOString() },
    ];
    
    return (
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

        <RealtimeMeetingsList initialMeetings={mockMeetings as any} userId="demo-user" />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const meetings: Meeting[] = data ?? [];

  return (
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

      <RealtimeMeetingsList initialMeetings={meetings} userId={user.id} />
    </div>
  );
}

export function RecentMeetingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-32 bg-obsidian-700 rounded animate-pulse" />
        <div className="h-8 w-24 bg-obsidian-700 rounded-xl animate-pulse" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-obsidian-800/60 border border-obsidian-600 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
