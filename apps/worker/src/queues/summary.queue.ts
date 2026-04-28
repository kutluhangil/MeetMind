import { Queue } from 'bullmq';
import { connection } from './transcription.queue.js';

export const summaryQueue = new Queue('summary', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export interface SummaryJobData {
  meetingId: string;
  transcript: string;
  language: 'tr' | 'en';
  userId: string;
}
