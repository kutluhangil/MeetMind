'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { MeetingRow } from '@/components/meetings/meeting-row';
import type { Meeting, MeetingStatus } from '@/types/database';

const STATUS_VALUES = ['', 'completed', 'pending', 'queued', 'transcribing', 'failed'] as const;
type StatusValue = typeof STATUS_VALUES[number];

interface MeetingsResponse {
  meetings: Meeting[];
  total: number;
  page: number;
}

export function MeetingsList({ initialMeetings }: { initialMeetings: Meeting[] }) {
  const t = useTranslations('meeting');
  const tf = useTranslations('meetingFilter');
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusValue>('');
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce arama
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status) params.set('status', status);
      const res = await fetch(`/api/meetings?${params}`);
      if (res.ok) {
        const data = await res.json() as MeetingsResponse;
        setMeetings(data.meetings);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status]);

  useEffect(() => {
    // İlk yüklemede (filtre boşsa) initial data kullan
    if (!debouncedSearch && !status) {
      setMeetings(initialMeetings);
      return;
    }
    fetchMeetings();
  }, [debouncedSearch, status, fetchMeetings, initialMeetings]);

  return (
    <div className="space-y-4">
      {/* Arama ve filtre */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('list.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-obsidian-800 border border-obsidian-600 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-phosphor/50"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_VALUES.map((val) => (
            <button
              key={val}
              onClick={() => setStatus(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                status === val
                  ? 'bg-phosphor/10 text-phosphor border border-phosphor/20'
                  : 'bg-obsidian-800 text-slate-500 border border-obsidian-700 hover:text-slate-300'
              }`}
            >
              {val === '' ? tf('all') : tf(val as Exclude<StatusValue, ''>)}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-obsidian-800/40 animate-pulse" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-2xl bg-obsidian-800/40 border border-obsidian-700 p-12 text-center">
          <p className="text-slate-500">{t('list.empty')}</p>
          {!search && !status && (
            <Link
              href="/meetings/new"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-phosphor text-obsidian-950 text-sm font-semibold hover:bg-phosphor-glow transition-colors"
            >
              {t('list.newButton')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <MeetingRow key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  );
}
