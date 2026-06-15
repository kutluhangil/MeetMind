'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { UploadZone } from '@/components/meetings/upload-zone';
import { RecordingWidget } from '@/components/meetings/recording-widget';

type Mode = 'upload' | 'record';

export default function NewMeetingPage() {
  const t = useTranslations('meeting.upload');
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('upload');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<'tr' | 'en' | 'auto'>('auto');
  const [templateType, setTemplateType] = useState('general');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileReady = (f: File) => {
    setFile(f);
    if (!title) {
      setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleSubmit = async () => {
    if (!file || !title.trim()) return;
    setUploading(true);
    setError(null);

    try {
      // Create meeting record first
      const createRes = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, language, audioFilePath: '__pending__', audioFileSize: file.size, templateType }),
      });
      if (!createRes.ok) {
        const { error: err } = await createRes.json() as { error: string };
        throw new Error(err);
      }
      const { meeting } = await createRes.json() as { meeting: { id: string } };

      // Get pre-signed upload URL
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, meetingId: meeting.id }),
      });
      const { uploadUrl, path } = await signRes.json() as { uploadUrl: string; path: string };

      // Upload to Supabase Storage
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

      // Update meeting with real path — this also triggers worker enqueue
      const patchRes = await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioFilePath: path }),
      });
      if (!patchRes.ok) throw new Error('Failed to update meeting path');

      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-slate-100">{t('title')}</h1>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">Meeting Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Q4 Planning Meeting"
          className="w-full px-4 py-2.5 rounded-xl bg-obsidian-800 border border-obsidian-600 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-phosphor/50"
        />
      </div>

      {/* Language */}
      <div className="space-y-1">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">Language</label>
        <div className="flex gap-2">
          {(['auto', 'tr', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                language === l
                  ? 'bg-phosphor/10 text-phosphor border border-phosphor/20'
                  : 'bg-obsidian-800 text-slate-400 border border-obsidian-600 hover:text-slate-200'
              }`}
            >
              {l === 'auto' ? 'Auto-detect' : l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Template Type */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {t('templateLabel')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['general', 'standup', 'sales', 'brainstorm', 'interview'] as const).map((tpl) => (
            <button
              key={tpl}
              type="button"
              onClick={() => setTemplateType(tpl)}
              className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                templateType === tpl
                  ? 'bg-phosphor/10 border-phosphor/40 text-slate-100 shadow-md shadow-phosphor/5'
                  : 'bg-obsidian-800 border-obsidian-600 text-slate-400 hover:border-obsidian-500 hover:text-slate-300'
              }`}
            >
              <div>
                <div className="font-semibold text-sm mb-1 text-slate-200 flex items-center justify-between">
                  <span>{t(`templates.${tpl}`)}</span>
                  {templateType === tpl && (
                    <span className="text-[9px] bg-phosphor/20 text-phosphor px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  {t(`templates.${tpl}Desc`)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
            mode === 'upload'
              ? 'bg-obsidian-700 border-obsidian-500 text-slate-200'
              : 'bg-transparent border-obsidian-700 text-slate-500 hover:text-slate-300'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode('record')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
            mode === 'record'
              ? 'bg-obsidian-700 border-obsidian-500 text-slate-200'
              : 'bg-transparent border-obsidian-700 text-slate-500 hover:text-slate-300'
          }`}
        >
          {t('record')}
        </button>
      </div>

      {mode === 'upload' ? (
        <UploadZone onFileSelect={handleFileReady} disabled={uploading} />
      ) : (
        <RecordingWidget onRecordingComplete={handleFileReady} />
      )}

      {file && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-phosphor/5 border border-phosphor/20">
          <span className="text-phosphor text-sm">✓</span>
          <span className="text-slate-300 text-sm truncate">{file.name}</span>
          <span className="text-slate-500 text-xs ml-auto">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!file || !title.trim() || uploading}
        className="w-full py-3 rounded-xl bg-phosphor text-obsidian-950 font-semibold hover:bg-phosphor-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? t('processing') : 'Start Processing'}
      </button>
    </div>
  );
}
