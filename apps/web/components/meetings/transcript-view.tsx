'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TranscriptViewProps {
  transcript: string;
}

export function TranscriptView({ transcript }: TranscriptViewProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('common');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-obsidian-700">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Transcript</span>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-500 hover:text-phosphor transition-colors"
        >
          {copied ? t('copied') : t('copy')}
        </button>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
          {transcript}
        </pre>
      </div>
    </div>
  );
}
