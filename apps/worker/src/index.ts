import { Worker, Queue } from 'bullmq';
import http from 'http';
import { connection, transcriptionQueue } from './queues/transcription.queue.js';
import { summaryQueue } from './queues/summary.queue.js';
import { emailQueue } from './queues/email.queue.js';
import { transcriptionProcessor } from './processors/transcription.processor.js';
import { summaryProcessor } from './processors/summary.processor.js';
import { emailProcessor } from './processors/email.processor.js';

export { transcriptionQueue, summaryQueue, emailQueue };

const transcriptionWorker = new Worker('transcription', transcriptionProcessor, {
  connection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '3'),
  limiter: { max: 10, duration: 60_000 },
});

const summaryWorker = new Worker('summary', summaryProcessor, {
  connection,
  concurrency: 5,
});

const emailWorker = new Worker('email', emailProcessor, {
  connection,
  concurrency: 10,
});

const QUEUES: Record<string, Queue> = {
  transcription: transcriptionQueue,
  summary: summaryQueue,
  email: emailQueue,
};

const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', queues: ['transcription', 'summary', 'email'] }));
    return;
  }

  if (req.url === '/enqueue' && req.method === 'POST') {
    const secret = req.headers['x-worker-secret'];
    if (secret !== process.env.WORKER_API_SECRET) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const { queue: queueName, jobName, data } = JSON.parse(body) as {
          queue: string;
          jobName: string;
          data: unknown;
        };
        const queue = QUEUES[queueName];
        if (!queue) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Unknown queue: ${queueName}` }));
          return;
        }
        const job = await queue.add(jobName, data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jobId: job.id }));
      } catch (err) {
        console.error('Enqueue error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(3002, () => {
  console.log('🔍 Health check listening on :3002');
});

[transcriptionWorker, summaryWorker, emailWorker].forEach((worker) => {
  worker.on('failed', (job, err) => {
    console.error(`[${worker.name}] Job ${job?.id} failed:`, err.message);
  });
  worker.on('completed', (job) => {
    console.log(`[${worker.name}] Job ${job.id} completed`);
  });
  worker.on('error', (err) => {
    console.error(`[${worker.name}] Worker error:`, err.message);
  });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing workers...');
  await Promise.all([
    transcriptionWorker.close(),
    summaryWorker.close(),
    emailWorker.close(),
  ]);
  process.exit(0);
});

console.log('🚀 MeetMind Worker started');
