'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

const ACCEPTED_TYPES = {
  'audio/mpeg':  ['.mp3'],
  'audio/mp4':   ['.m4a'],
  'audio/wav':   ['.wav'],
  'audio/webm':  ['.webm'],
  'video/mp4':   ['.mp4'],
  'video/webm':  ['.webm'],
};

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onFileSelect(acceptedFiles[0]);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
    disabled,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className="relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden bg-obsidian-800/40 backdrop-blur-xl group hover:border-phosphor/40 transition-colors"
      style={{ borderColor: isDragging ? '#4ade80' : 'rgba(255,255,255,0.06)' }}
    >
      <input {...getInputProps()} />

      <div className="absolute inset-0 bg-grid bg-obsidian-950 opacity-30" />

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-glow-phosphor"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
        <motion.div
          animate={{ y: isDragging ? -4 : 0 }}
          className="w-12 h-12 rounded-xl bg-phosphor/10 border border-phosphor/20 flex items-center justify-center"
        >
          <svg className="w-6 h-6 text-phosphor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </motion.div>
        <div>
          <p className="text-slate-200 font-medium">Drop file or click to select</p>
          <p className="text-slate-500 text-sm mt-1">MP3, MP4, WAV, M4A, WebM · Max 500MB</p>
        </div>
      </div>
    </div>
  );
}
