'use client';

import { useTranslations } from 'next-intl';

interface SummaryCardProps {
  summary: string;
  keyDecisions: string[];
}

export function SummaryCard({ summary, keyDecisions }: SummaryCardProps) {
  const t = useTranslations('meeting.sections');

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5">
        <h3 className="text-xs font-semibold text-phosphor uppercase tracking-wide mb-3">
          {t('summary')}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
      </div>

      {keyDecisions.length > 0 && (
        <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5">
          <h3 className="text-xs font-semibold text-phosphor uppercase tracking-wide mb-3">
            {t('decisions')}
          </h3>
          <ul className="space-y-2">
            {keyDecisions.map((decision, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-phosphor/60 flex-shrink-0" />
                {decision}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
