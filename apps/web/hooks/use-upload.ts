'use client';

import { useState, useCallback } from 'react';

interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

interface UseUploadResult {
  upload: (file: File, meetingId: string) => Promise<string>;
  progress: UploadProgress | null;
  uploading: boolean;
  error: string | null;
  reset: () => void;
}

export function useUpload(): UseUploadResult {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, meetingId: string): Promise<string> => {
    setUploading(true);
    setError(null);
    setProgress({ loaded: 0, total: file.size, percent: 0 });

    try {
      // Get pre-signed upload URL
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, meetingId }),
      });

      if (!signRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, path } = await signRes.json() as { uploadUrl: string; path: string };

      // Upload with XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress({
              loaded: e.loaded,
              total: e.total,
              percent: Math.round((e.loaded / e.total) * 100),
            });
          }
        };
        xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      return path;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(null);
    setUploading(false);
    setError(null);
  }, []);

  return { upload, progress, uploading, error, reset };
}
