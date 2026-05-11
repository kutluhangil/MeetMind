'use client';

import { Link } from '@/lib/navigation';
import { StatusBadge } from '@/components/meetings/status-badge';
import { RetryButton } from '@/components/meetings/retry-button';
import type { Meeting, MeetingStatus } from '@/types/database';

export function MeetingRow({ meeting }: { meeting: Meeting }) {
  return (
    <div className="p-4 rounded-2xl bg-obsidian-800/60 border border-obsidian-600 hover:border-obsidian-400 transition-colors group">
      <div className="flex items-center justify-between gap-4">
        <Link href={`/meetings/${meeting.id}`} className="min-w-0 flex-1">
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
        </Link>
        <StatusBadge meetingId={meeting.id} initialStatus={meeting.status as MeetingStatus} />
      </div>

      {meeting.status === 'failed' && meeting.audio_file_path && (
        <div className="mt-1 pl-0">
          <RetryButton meetingId={meeting.id} />
        </div>
      )}
    </div>
  );
}
