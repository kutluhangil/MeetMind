'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TranscriptViewProps {
  transcript: string;
  transcriptSegments?: Array<{
    speaker: string;
    text: string;
  }> | null;
}

export function TranscriptView({ transcript, transcriptSegments }: TranscriptViewProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('common');

  const handleCopy = async () => {
    const textToCopy = transcriptSegments && transcriptSegments.length > 0
      ? transcriptSegments.map(s => `${s.speaker}: ${s.text}`).join('\n\n')
      : transcript;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to generate a consistent color class based on speaker name
  const getSpeakerColor = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'bg-rose-500/10 text-rose-400 border-rose-500/20',
    ];
    return colors[hash % colors.length];
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
      <div className="p-4 max-h-[500px] overflow-y-auto space-y-4">
        {transcriptSegments && transcriptSegments.length > 0 ? (
          <div className="space-y-4">
            {transcriptSegments.map((segment, index) => (
              <div key={index} className="flex flex-col space-y-1 p-2 rounded-xl hover:bg-obsidian-700/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getSpeakerColor(segment.speaker)}`}>
                    {segment.speaker}
                  </span>
                </div>
                <p className="text-sm text-slate-300 pl-1 leading-relaxed whitespace-pre-wrap">
                  {segment.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {transcript}
          </pre>
        )}
      </div>
    </div>
  );
}
