import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/meetings/status-badge';
import { TranscriptView } from '@/components/meetings/transcript-view';
import { SummaryCard } from '@/components/meetings/summary-card';
import { ActionListWrapper } from '@/components/meetings/action-list-wrapper';
import { EmailPreview } from '@/components/meetings/email-preview';
import type { MeetingStatus, ActionItem, Json } from '@/types/database';

export default async function MeetingDetailPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const t = await getTranslations('meeting');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: meeting } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single();

  if (!meeting) notFound();

  const { data: actionItems } = await supabase
    .from('action_items')
    .select('*')
    .eq('meeting_id', params.id)
    .order('created_at');

  const items: ActionItem[] = actionItems ?? [];
  const keyDecisions = Array.isArray(meeting.key_decisions) ? meeting.key_decisions as string[] : [];

  const participantEmails = Array.isArray(meeting.participants)
    ? (meeting.participants as Array<{ email?: string }>).map((p) => p.email).filter(Boolean) as string[]
    : [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">{meeting.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date(meeting.created_at).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <StatusBadge meetingId={meeting.id} initialStatus={meeting.status as MeetingStatus} />
      </div>

      {/* Error state */}
      {meeting.status === 'failed' && meeting.error_message && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{meeting.error_message}</p>
        </div>
      )}

      {/* Processing state */}
      {['queued', 'transcribing', 'summarizing'].includes(meeting.status) && (
        <div className="rounded-2xl bg-obsidian-800/40 border border-obsidian-700 p-8 text-center">
          <div className="w-8 h-8 border-2 border-phosphor border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Processing your meeting... this may take a few minutes.</p>
        </div>
      )}

      {/* Summary */}
      {meeting.summary ? (
        <SummaryCard summary={meeting.summary} keyDecisions={keyDecisions} />
      ) : meeting.status === 'completed' ? (
        <p className="text-slate-500 text-sm">{t('detail.noSummary')}</p>
      ) : null}

      {/* Actions */}
      {meeting.status === 'completed' && (
        <div>
          <h2 className="text-xs font-semibold text-phosphor uppercase tracking-wide mb-3">
            {t('sections.actions')}
          </h2>
          <ActionListWrapper meetingId={meeting.id} initialItems={items} />
        </div>
      )}

      {/* Transcript */}
      {meeting.transcript && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {t('sections.transcript')}
          </h2>
          <TranscriptView transcript={meeting.transcript} />
        </div>
      )}

      {/* Send email */}
      {meeting.status === 'completed' && (
        <div>
          <h2 className="text-xs font-semibold text-phosphor uppercase tracking-wide mb-3">
            {t('sections.sendEmail')}
          </h2>
          <EmailPreview
            meetingId={meeting.id}
            defaultRecipients={participantEmails}
            actionItems={items}
          />
        </div>
      )}
    </div>
  );
}
