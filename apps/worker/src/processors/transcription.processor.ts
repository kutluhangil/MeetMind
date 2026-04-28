import { Job } from 'bullmq';
import path from 'path';
import { TranscriptionJobData } from '../queues/transcription.queue.js';
import { summaryQueue, SummaryJobData } from '../queues/summary.queue.js';
import { downloadAudioFile, updateMeeting } from '../services/supabase.service.js';
import { transcribeAudio } from '../services/openai.service.js';
import {
  normalizeAudio,
  splitIntoChunks,
  ensureTmpDir,
  cleanupFiles,
} from '../utils/audio.utils.js';

const TMP_DIR = process.env.TMP_DIR ?? '/tmp/meetmind';

export async function transcriptionProcessor(job: Job<TranscriptionJobData>): Promise<void> {
  const { meetingId, audioFilePath, language, userId } = job.data;
  const filesToClean: string[] = [];

  try {
    ensureTmpDir();

    await updateMeeting(meetingId, { status: 'transcribing' });
    await job.updateProgress(10);

    // Download from Supabase Storage
    const rawPath = path.join(TMP_DIR, `${meetingId}_raw${path.extname(audioFilePath)}`);
    await downloadAudioFile(audioFilePath, rawPath);
    filesToClean.push(rawPath);
    await job.updateProgress(30);

    // Normalize to WAV 16kHz mono
    const normalizedPath = await normalizeAudio(rawPath);
    filesToClean.push(normalizedPath);
    await job.updateProgress(50);

    // Split if > 24MB
    const chunks = await splitIntoChunks(normalizedPath);
    filesToClean.push(...chunks.filter((c) => c !== normalizedPath));
    await job.updateProgress(60);

    // Transcribe each chunk
    const transcripts: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = chunks[i];
      if (!chunkPath) continue;
      const text = await transcribeAudio(chunkPath, language);
      transcripts.push(text);
      await job.updateProgress(60 + Math.floor((30 * (i + 1)) / chunks.length));
    }

    const fullTranscript = transcripts.join('\n\n');

    // Persist transcript and enqueue summary
    await updateMeeting(meetingId, {
      transcript: fullTranscript,
      status: 'summarizing',
    });

    const summaryJobData: SummaryJobData = {
      meetingId,
      transcript: fullTranscript,
      language: language === 'auto' ? 'en' : language,
      userId,
    };
    await summaryQueue.add(`summary:${meetingId}`, summaryJobData);
    await job.updateProgress(100);
  } finally {
    cleanupFiles(filesToClean);
  }
}
