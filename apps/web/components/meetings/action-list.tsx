'use client';

import { useTranslations } from 'next-intl';
import { AnimatePresence } from 'framer-motion';
import { ActionItemCard } from './action-item';
import type { ActionItem } from '@/types/database';

interface ActionListProps {
  meetingId: string;
  items: ActionItem[];
  onItemUpdate: (id: string, status: ActionItem['status']) => void;
}

export function ActionList({ meetingId: _meetingId, items, onItemUpdate }: ActionListProps) {
  const t = useTranslations('meeting');
  const open = items.filter((i) => i.status !== 'completed' && i.status !== 'cancelled');
  const done = items.filter((i) => i.status === 'completed');

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-obsidian-800/40 border border-obsidian-700 p-8 text-center">
        <p className="text-slate-500 text-sm">{t('detail.noActions')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {open.map((item) => (
          <ActionItemCard key={item.id} item={item} onStatusChange={onItemUpdate} />
        ))}
      </AnimatePresence>

      {done.length > 0 && (
        <>
          <p className="text-xs text-slate-600 uppercase tracking-wide pt-2">Completed ({done.length})</p>
          <AnimatePresence initial={false}>
            {done.map((item) => (
              <ActionItemCard key={item.id} item={item} onStatusChange={onItemUpdate} />
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
