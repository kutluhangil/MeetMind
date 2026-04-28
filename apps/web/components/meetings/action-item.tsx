'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { ActionItem } from '@/types/database';

const PRIORITY_COLORS = {
  low:    'text-slate-400 bg-slate-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  high:   'text-red-400 bg-red-400/10',
  urgent: 'text-purple-400 bg-purple-400/10',
};

interface ActionItemCardProps {
  item: ActionItem;
  onStatusChange: (id: string, status: ActionItem['status']) => void;
}

export function ActionItemCard({ item, onStatusChange }: ActionItemCardProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations('action');

  const isCompleted = item.status === 'completed';

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = isCompleted ? 'open' : 'completed';
    await onStatusChange(item.id, newStatus);
    setLoading(false);
  };

  return (
    <motion.div
      layout
      className={`rounded-xl border p-4 transition-all ${
        isCompleted
          ? 'bg-obsidian-800/30 border-obsidian-700 opacity-60'
          : 'bg-obsidian-800/60 border-obsidian-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border transition-colors ${
            isCompleted
              ? 'bg-phosphor border-phosphor'
              : 'bg-transparent border-obsidian-400 hover:border-phosphor'
          }`}
        >
          {isCompleted && (
            <svg viewBox="0 0 16 16" fill="none" className="w-full h-full p-0.5">
              <path d="M3 8l3 3 7-7" stroke="#050506" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
            {item.title}
          </p>
          {item.description && (
            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {item.assignee_name && (
              <span className="text-xs text-slate-400">→ {item.assignee_name}</span>
            )}
            {item.due_date && (
              <span className="text-xs text-slate-500">{item.due_date}</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${PRIORITY_COLORS[item.priority]}`}>
              {t(`priority.${item.priority}`)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
