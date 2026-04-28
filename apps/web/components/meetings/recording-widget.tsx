'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface RecordingWidgetProps {
  onRecordingComplete: (file: File) => void;
}

type RecordingState = 'idle' | 'recording' | 'stopped';

export function RecordingWidget({ onRecordingComplete }: RecordingWidgetProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        onRecordingComplete(file);
        stream.getTracks().forEach((t) => t.stop());
        setState('stopped');
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setState('recording');

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      setError('Microphone access denied. Please allow microphone access.');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-obsidian-800/60 border border-obsidian-600">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {state === 'recording' && (
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-red-500"
          />
          <span className="font-mono text-slate-200 text-sm">{formatDuration(duration)}</span>
        </div>
      )}

      {state === 'idle' && (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Start Recording
        </button>
      )}

      {state === 'recording' && (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian-700 border border-obsidian-500 text-slate-300 hover:text-slate-100 text-sm font-medium transition-colors"
        >
          Stop
        </button>
      )}

      {state === 'stopped' && (
        <p className="text-sm text-phosphor">Recording complete — processing...</p>
      )}
    </div>
  );
}
