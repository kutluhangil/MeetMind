import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import http from 'http';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const transcriptionQueue = new Queue('transcription', { connection });
export const summaryQueue       = new Queue('summary',       { connection });
export const emailQueue         = new Queue('email',         { connection });

const transcriptionWorker = new Worker(
  'transcription',
  async (job) => {
    console.log(`[transcription] Processing job ${job.id}`);
    // Phase 4: transcription.processor.ts
  },
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '3'),
    limiter: { max: 10, duration: 60_000 },
  }
);

const summaryWorker = new Worker(
  'summary',
  async (job) => {
    console.log(`[summary] Processing job ${job.id}`);
    // Phase 4: summary.processor.ts
  },
  { connection, concurrency: 5 }
);

const emailWorker = new Worker(
  'email',
  async (job) => {
    console.log(`[email] Processing job ${job.id}`);
    // Phase 4: email.processor.ts
  },
  { connection, concurrency: 10 }
);

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', queues: ['transcription', 'summary', 'email'] }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3002, () => {
  console.log('🔍 Health check listening on :3002');
});

[transcriptionWorker, summaryWorker, emailWorker].forEach((worker) => {
  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });
  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });
});

console.log('🚀 MeetMind Worker started');
