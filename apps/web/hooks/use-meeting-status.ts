'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MeetingStatus } from '@/types/database';

export function useMeetingStatus(meetingId: string, initialStatus: MeetingStatus) {
  const [status, setStatus] = useState<MeetingStatus>(initialStatus);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`meeting-status:${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `id=eq.${meetingId}`,
        },
        (payload) => {
          const updated = payload.new as { status?: MeetingStatus };
          if (updated.status) setStatus(updated.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  const isProcessing = ['queued', 'transcribing', 'summarizing'].includes(status);
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  return { status, isProcessing, isCompleted, isFailed };
}
