import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/lib/navigation';
import { StatusBadge } from '@/components/meetings/status-badge';
import type { Meeting, MeetingStatus } from '@/types/database';

export default async function MeetingsPage() {
  const t = await getTranslations('meeting');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  const list: Meeting[] = meetings ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">{t('list.title')}</h1>
        </div>
        <Link
          href="/meetings/new"
          className="px-4 py-2 rounded-xl bg-phosphor text-obsidian-950 text-sm font-semibold hover:bg-phosphor-glow transition-colors"
        >
          + {t('list.newButton')}
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl bg-obsidian-800/40 border border-obsidian-700 p-12 text-center">
          <p className="text-slate-500">{t('list.empty')}</p>
          <Link
            href="/meetings/new"
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-phosphor text-obsidian-950 text-sm font-semibold hover:bg-phosphor-glow transition-colors"
          >
            {t('list.newButton')}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/meetings/${meeting.id}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-obsidian-800/60 border border-obsidian-600 hover:border-obsidian-400 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 group-hover:text-slate-100 truncate">
                  {meeting.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-slate-500">
                    {new Date(meeting.created_at).toLocaleDateString()}
                  </p>
                  {meeting.audio_duration && (
                    <p className="text-xs text-slate-600">
                      {Math.round(meeting.audio_duration / 60)}m
                    </p>
                  )}
                </div>
              </div>
              <StatusBadge meetingId={meeting.id} initialStatus={meeting.status as MeetingStatus} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
