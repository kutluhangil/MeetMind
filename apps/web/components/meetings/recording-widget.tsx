'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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

  // Audio Context and Visualizer references
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startVisualizer = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 128; // Smaller fftSize gives a wider, smoother visual bar layout
      source.connect(analyser);

      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        // Visual Styling: Draw beautiful glowing visualizer bars
        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          // Normalize value
          barHeight = ((dataArray[i] ?? 0) / 255) * height * 0.75;
          if (barHeight < 4) barHeight = 4; // Minimum visible bar indicator

          // Draw double-sided mirrored vertical bars relative to center
          const grad = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
          grad.addColorStop(0, 'rgba(16, 185, 129, 0.1)'); // Fading edges
          grad.addColorStop(0.5, '#10b981');              // Bright glowing Phosphor center
          grad.addColorStop(1, 'rgba(16, 185, 129, 0.1)');

          ctx.fillStyle = grad;
          ctx.fillRect(x, height / 2 - barHeight / 2, barWidth - 3, barHeight);

          x += barWidth;
        }

        animationFrameIdRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.error('Failed to initialize audio visualizer:', err);
    }
  };

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
      setDuration(0);

      // Start waveform animation
      setTimeout(() => startVisualizer(stream), 100);

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
    // Cleanup visualizer
    if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => null);
    };
  }, []);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-5 p-6 rounded-2xl bg-obsidian-800/60 border border-obsidian-600 w-full">
      {error && <p className="text-sm text-red-400">{error}</p>}

      {state === 'recording' && (
        <div className="w-full flex flex-col items-center gap-3">
          {/* Animated red recording indicator */}
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full bg-red-500"
            />
            <span className="font-mono text-slate-200 text-sm font-semibold">{formatDuration(duration)}</span>
          </div>

          {/* Web Waveform Canvas */}
          <div className="w-full h-16 bg-obsidian-950/60 rounded-xl border border-obsidian-700/80 overflow-hidden flex items-center justify-center p-1">
            <canvas
              ref={canvasRef}
              width={380}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {state === 'idle' && (
        <button
          onClick={startRecording}
          className="flex justify-center items-center gap-2 px-5 py-3 min-h-[44px] w-full rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          Start Recording
        </button>
      )}

      {state === 'recording' && (
        <button
          onClick={stopRecording}
          className="flex justify-center items-center gap-2 px-5 py-3 min-h-[44px] w-full rounded-xl bg-obsidian-700 border border-obsidian-500 text-slate-300 hover:text-slate-100 text-sm font-medium transition-colors"
        >
          Stop Recording
        </button>
      )}

      {state === 'stopped' && (
        <p className="text-sm text-phosphor animate-pulse">Recording complete — processing...</p>
      )}
    </div>
  );
}
