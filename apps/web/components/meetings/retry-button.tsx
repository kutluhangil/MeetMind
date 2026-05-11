'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';

export function RetryButton({ meetingId }: { meetingId: string }) {
  const t = useTranslations('retry');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRetry = async () => {
    setLoading(true);
    try {
      await fetch(`/api/meetings/${meetingId}/retry`, { method: 'POST' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      className="mt-3 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
    >
      {loading ? t('loading') : t('button')}
    </button>
  );
}
