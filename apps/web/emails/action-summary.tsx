// React Email template — used for email preview in the UI
// The actual sending is handled by apps/worker/src/services/resend.service.ts

export interface ActionSummaryEmailProps {
  meetingTitle: string;
  meetingDate: string;
  summary: string;
  keyDecisions: string[];
  actionItems: Array<{
    title: string;
    assignee_name?: string | null;
    due_date?: string | null;
    priority: string;
  }>;
}

export function ActionSummaryEmail({
  meetingTitle,
  meetingDate,
  summary,
  keyDecisions,
  actionItems,
}: ActionSummaryEmailProps) {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: '0 auto',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: '#0a0a0f',
        border: '1px solid #1a1a24',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #1a1a24' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9' }}>MeetMind</span>
      </div>

      <div style={{ padding: '32px' }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Meeting Summary
        </p>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>
          {meetingTitle}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>{meetingDate}</p>

        <h2 style={{ margin: '24px 0 12px', fontSize: 13, fontWeight: 600, color: '#4ade80', textTransform: 'uppercase' }}>
          Summary
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: '#d1d5db' }}>{summary}</p>

        {keyDecisions.length > 0 && (
          <>
            <h2 style={{ margin: '24px 0 12px', fontSize: 13, fontWeight: 600, color: '#4ade80', textTransform: 'uppercase' }}>
              Key Decisions
            </h2>
            <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
              {keyDecisions.map((d, i) => (
                <li key={i} style={{ marginBottom: 6, color: '#d1d5db', fontSize: 14 }}>{d}</li>
              ))}
            </ul>
          </>
        )}

        {actionItems.length > 0 && (
          <>
            <h2 style={{ margin: '24px 0 12px', fontSize: 13, fontWeight: 600, color: '#4ade80', textTransform: 'uppercase' }}>
              Action Items
            </h2>
            {actionItems.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  marginBottom: 8,
                  background: '#111118',
                  border: '1px solid #1f2937',
                  borderRadius: 8,
                }}
              >
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#e5e7eb' }}>{item.title}</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {item.assignee_name && (
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>→ {item.assignee_name}</span>
                  )}
                  {item.due_date && (
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{item.due_date}</span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ padding: '20px 32px', borderTop: '1px solid #1a1a24', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#374151' }}>
          Sent by <a href="https://meetmind.io" style={{ color: '#4ade80' }}>MeetMind</a>
        </p>
      </div>
    </div>
  );
}
