export interface InviteEmailProps {
  inviterName: string;
  orgName: string;
  inviteUrl: string;
}

export function InviteEmail({ inviterName, orgName, inviteUrl }: InviteEmailProps) {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: '#0a0a0f',
        border: '1px solid #1a1a24',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #1a1a24' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9' }}>MeetMind</span>
      </div>

      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#4ade80' }} />
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
          You&apos;re invited!
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#9ca3af', lineHeight: 1.6 }}>
          <strong style={{ color: '#e5e7eb' }}>{inviterName}</strong> has invited you to join{' '}
          <strong style={{ color: '#e5e7eb' }}>{orgName}</strong> on MeetMind.
        </p>
        <a
          href={inviteUrl}
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            borderRadius: 12,
            background: '#4ade80',
            color: '#050506',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          Accept Invitation
        </a>
      </div>

      <div style={{ padding: '20px 32px', borderTop: '1px solid #1a1a24', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#374151' }}>
          MeetMind — AI Meeting Intelligence
        </p>
      </div>
    </div>
  );
}
