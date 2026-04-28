import { Job } from 'bullmq';
import { EmailJobData } from '../queues/email.queue.js';
import {
  getMeeting,
  getActionItemsForMeeting,
  insertEmailLog,
} from '../services/supabase.service.js';
import { sendMeetingSummaryEmail } from '../services/resend.service.js';

export async function emailProcessor(job: Job<EmailJobData>): Promise<void> {
  const { meetingId, userId, recipients, subject, includeTranscript } = job.data;

  await job.updateProgress(10);

  const meeting = await getMeeting(meetingId);
  const actionItems = await getActionItemsForMeeting(meetingId);

  await job.updateProgress(30);

  const emailSubject = subject ?? `Meeting Summary: ${meeting.title}`;
  const meetingDate = new Date(meeting.meeting_date ?? meeting.created_at).toLocaleDateString(
    'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  let resendId: string | null = null;
  let emailError: string | null = null;

  try {
    resendId = await sendMeetingSummaryEmail({
      to: recipients,
      subject: emailSubject,
      meetingTitle: meeting.title,
      meetingDate,
      summary: meeting.summary ?? '',
      keyDecisions: (meeting.key_decisions as string[]) ?? [],
      actionItems: actionItems.map((a) => ({
        title: a.title,
        assignee_name: a.assignee_name,
        assignee_email: a.assignee_email,
        due_date: a.due_date,
        priority: a.priority,
        status: a.status,
      })),
    });

    await job.updateProgress(90);
  } catch (err) {
    emailError = err instanceof Error ? err.message : String(err);
  }

  await insertEmailLog({
    meeting_id: meetingId,
    user_id: userId,
    recipients,
    subject: emailSubject,
    resend_id: resendId,
    status: emailError ? 'failed' : 'sent',
    sent_at: emailError ? null : new Date().toISOString(),
    error: emailError,
  });

  if (emailError) throw new Error(emailError);
  await job.updateProgress(100);
}
