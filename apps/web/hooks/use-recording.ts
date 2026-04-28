'use client';

import { useState, useRef, useCallback } from 'react';

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

interface UseRecordingResult {
  state: RecordingState;
  duration: number;
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  getFile: () => File | null;
  error: string | null;
}

export function useRecording(): UseRecordingResult {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<File | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        fileRef.current = new File([blob], `recording-${Date.now()}.webm`, { type: recorder.mimeType });
        stream.getTracks().forEach((t) => t.stop());
        setState('stopped');
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setState('recording');
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      setError('Microphone access denied.');
      setState('idle');
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
  }, []);

  const getFile = useCallback(() => fileRef.current, []);

  return { state, duration, start, stop, pause, resume, getFile, error };
}
