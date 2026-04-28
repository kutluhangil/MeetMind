'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { MeetingStatus } from '@/types/database';

const STATUS_CONFIG: Record<MeetingStatus, { label: string; color: string; bg: string; pulse: boolean }> = {
  pending:      { label: 'Pending',       color: 'text-slate-400',   bg: 'bg-slate-400/10',   pulse: false },
  queued:       { label: 'Queued',        color: 'text-indigo-400',  bg: 'bg-indigo-400/10',  pulse: true  },
  transcribing: { label: 'Transcribing',  color: 'text-amber-400',   bg: 'bg-amber-400/10',   pulse: true  },
  summarizing:  { label: 'AI Analyzing',  color: 'text-phosphor',    bg: 'bg-phosphor/10',    pulse: true  },
  completed:    { label: 'Completed',     color: 'text-phosphor',    bg: 'bg-phosphor/10',    pulse: false },
  failed:       { label: 'Failed',        color: 'text-red-400',     bg: 'bg-red-400/10',     pulse: false },
};

interface StatusBadgeProps {
  meetingId: string;
  initialStatus: MeetingStatus;
  onStatusChange?: (status: MeetingStatus) => void;
}

export function StatusBadge({ meetingId, initialStatus, onStatusChange }: StatusBadgeProps) {
  const [status, setStatus] = useState<MeetingStatus>(initialStatus);
  const config = STATUS_CONFIG[status];

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`meeting:${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `id=eq.${meetingId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status: MeetingStatus }).status;
          if (newStatus) {
            setStatus(newStatus);
            onStatusChange?.(newStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId, onStatusChange]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}
    >
      {config.pulse && (
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-current"
        />
      )}
      {config.label}
    </span>
  );
}
