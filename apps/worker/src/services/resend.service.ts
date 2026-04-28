import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface ActionItem {
  title: string;
  assignee_name?: string | null;
  assignee_email?: string | null;
  due_date?: string | null;
  priority: string;
  status: string;
}

interface SendMeetingSummaryParams {
  to: string[];
  subject: string;
  meetingTitle: string;
  meetingDate: string;
  summary: string;
  keyDecisions: string[];
  actionItems: ActionItem[];
}

export async function sendMeetingSummaryEmail(params: SendMeetingSummaryParams): Promise<string> {
  const client = getClient();

  const html = buildEmailHtml(params);

  const { data, error } = await client.emails.send({
    from: `${process.env.RESEND_FROM_NAME ?? 'MeetMind'} <${process.env.RESEND_FROM_EMAIL ?? 'noreply@meetmind.io'}>`,
    to: params.to,
    subject: params.subject,
    html,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  return data?.id ?? '';
}

function buildEmailHtml(params: SendMeetingSummaryParams): string {
  const decisionsHtml = params.keyDecisions.length
    ? `<ul style="margin:0;padding:0 0 0 20px;">${params.keyDecisions.map((d) => `<li style="margin-bottom:6px;color:#d1d5db;">${escapeHtml(d)}</li>`).join('')}</ul>`
    : '<p style="color:#6b7280;margin:0;">No key decisions recorded.</p>';

  const actionsHtml = params.actionItems.length
    ? params.actionItems
        .map(
          (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #1f2937;color:#e5e7eb;">${escapeHtml(item.title)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1f2937;color:#9ca3af;">${escapeHtml(item.assignee_name ?? '—')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1f2937;color:#9ca3af;">${item.due_date ? escapeHtml(item.due_date) : '—'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1f2937;">
            <span style="padding:2px 8px;border-radius:4px;font-size:12px;background:${priorityColor(item.priority)};color:#fff;">${escapeHtml(item.priority)}</span>
          </td>
        </tr>`
        )
        .join('')
    : `<tr><td colspan="4" style="padding:16px;color:#6b7280;text-align:center;">No action items.</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050506;font-family:'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:640px;margin:40px auto;background:#0a0a0f;border:1px solid #1a1a24;border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="padding:24px 32px;border-bottom:1px solid #1a1a24;display:flex;align-items:center;gap:12px;">
      <div style="width:32px;height:32px;border-radius:8px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);display:flex;align-items:center;justify-content:center;">
        <div style="width:8px;height:8px;border-radius:50%;background:#4ade80;"></div>
      </div>
      <span style="font-size:18px;font-weight:600;color:#f1f5f9;">MeetMind</span>
    </div>

    <!-- Meeting title -->
    <div style="padding:32px 32px 0;">
      <p style="margin:0 0 4px;font-size:12px;color:#4ade80;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Meeting Summary</p>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">${escapeHtml(params.meetingTitle)}</h1>
      <p style="margin:0;font-size:14px;color:#6b7280;">${escapeHtml(params.meetingDate)}</p>
    </div>

    <!-- Summary -->
    <div style="padding:24px 32px;">
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#4ade80;text-transform:uppercase;letter-spacing:0.06em;">Summary</h2>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#d1d5db;white-space:pre-wrap;">${escapeHtml(params.summary)}</p>
    </div>

    <!-- Key Decisions -->
    <div style="padding:0 32px 24px;">
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#4ade80;text-transform:uppercase;letter-spacing:0.06em;">Key Decisions</h2>
      ${decisionsHtml}
    </div>

    <!-- Action Items -->
    <div style="padding:0 32px 32px;">
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#4ade80;text-transform:uppercase;letter-spacing:0.06em;">Action Items</h2>
      <table style="width:100%;border-collapse:collapse;background:#111118;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#1a1a24;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:500;">Task</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:500;">Owner</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:500;">Due</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:500;">Priority</th>
          </tr>
        </thead>
        <tbody>${actionsHtml}</tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #1a1a24;text-align:center;">
      <p style="margin:0;font-size:12px;color:#374151;">Sent by <a href="https://meetmind.io" style="color:#4ade80;text-decoration:none;">MeetMind</a></p>
    </div>
  </div>
</body>
</html>`;
}

function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    low: '#374151',
    medium: '#d97706',
    high: '#dc2626',
    urgent: '#7c3aed',
  };
  return map[priority] ?? '#374151';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
