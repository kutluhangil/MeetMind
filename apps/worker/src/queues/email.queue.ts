import { Queue } from 'bullmq';
import { connection } from './transcription.queue.js';

export const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 500,
    removeOnFail: 200,
  },
});

export interface EmailJobData {
  meetingId: string;
  userId: string;
  recipients: string[];
  subject?: string;
  includeTranscript?: boolean;
}
