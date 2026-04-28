import { Job } from 'bullmq';
import { SummaryJobData } from '../queues/summary.queue.js';
import { updateMeeting, insertActionItems } from '../services/supabase.service.js';
import { summarizeMeeting } from '../services/openai.service.js';

export async function summaryProcessor(job: Job<SummaryJobData>): Promise<void> {
  const { meetingId, transcript, language, userId } = job.data;

  await job.updateProgress(10);

  const result = await summarizeMeeting(transcript, language);
  await job.updateProgress(60);

  await updateMeeting(meetingId, {
    summary: result.summary,
    key_decisions: result.key_decisions,
    participants: result.participants,
    status: 'completed',
  });
  await job.updateProgress(80);

  if (result.action_items.length > 0) {
    await insertActionItems(
      result.action_items.map((item) => ({
        meeting_id: meetingId,
        user_id: userId,
        title: item.title,
        description: item.description ?? null,
        assignee_name: item.assignee_name ?? null,
        assignee_email: item.assignee_email ?? null,
        due_date: item.due_date ?? null,
        priority: item.priority,
        confidence: item.confidence ?? null,
        ai_extracted: true,
      }))
    );
  }

  await job.updateProgress(100);
}
