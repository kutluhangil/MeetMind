import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { target: 'slack' | 'notion' };
  const target = body.target;

  // 1. Fetch meeting & action items
  const [meetingRes, actionItemsRes, profileRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', params.id).eq('user_id', user.id).single(),
    supabase.from('action_items').select('*').eq('meeting_id', params.id),
    supabase.from('profiles').select('slack_webhook_url, notion_api_key, notion_database_id').eq('id', user.id).single(),
  ]);

  if (meetingRes.error || !meetingRes.data) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }

  const meeting = meetingRes.data;
  const actionItems = actionItemsRes.data ?? [];
  const profile = profileRes.data;

  if (!profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  const dateStr = new Date(meeting.created_at).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const decisionsText = Array.isArray(meeting.key_decisions) && meeting.key_decisions.length > 0
    ? (meeting.key_decisions as string[]).map((d) => `• ${d}`).join('\n')
    : 'No decisions recorded.';

  const actionsText = actionItems.length > 0
    ? actionItems.map((a) => `• [${a.status.toUpperCase()}] ${a.title}${a.assignee_name ? ` (Assignee: ${a.assignee_name})` : ''}`).join('\n')
    : 'No action items.';

  // 2. Dispatch to Slack
  if (target === 'slack') {
    const webhookUrl = profile.slack_webhook_url;
    if (!webhookUrl) {
      return NextResponse.json({ error: 'Slack webhook URL not configured' }, { status: 400 });
    }

    const slackPayload = {
      text: `*Meeting Summary: ${meeting.title}*`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📝 Meeting Minutes: ${meeting.title}`,
            emoji: true,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `📅 *Date:* ${dateStr}`,
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*AI Summary:*\n${meeting.summary ?? 'No summary available.'}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Key Decisions:*\n${decisionsText}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Action Items:*\n${actionsText}`,
          },
        },
      ],
    };

    try {
      const slackRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      });

      if (!slackRes.ok) {
        const errText = await slackRes.text();
        throw new Error(`Slack responded with ${slackRes.status}: ${errText}`);
      }

      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to post to Slack',
      }, { status: 500 });
    }
  }

  // 3. Dispatch to Notion
  if (target === 'notion') {
    const notionKey = profile.notion_api_key;
    const notionDbId = profile.notion_database_id;

    if (!notionKey || !notionDbId) {
      return NextResponse.json({ error: 'Notion configuration missing' }, { status: 400 });
    }

    // Prepare notion blocks, splitting long texts if needed
    const summaryText = meeting.summary ?? 'No summary available.';
    const summaryChunks = summaryText.match(/[\s\S]{1,1900}/g) || [summaryText];

    const childrenBlocks = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'AI Summary' } }],
        },
      },
      ...summaryChunks.map((chunk) => ({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: chunk } }],
        },
      })),
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Key Decisions' } }],
        },
      },
      ...(Array.isArray(meeting.key_decisions) && meeting.key_decisions.length > 0
        ? (meeting.key_decisions as string[]).map((decision) => ({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ type: 'text', text: { content: decision } }],
            },
          }))
        : [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: 'No decisions recorded.' } }],
              },
            },
          ]),
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Action Items' } }],
        },
      },
      ...(actionItems.length > 0
        ? actionItems.map((item) => ({
            object: 'block',
            type: 'to_do',
            to_do: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: `${item.title}${item.assignee_name ? ` (Assignee: ${item.assignee_name})` : ''}`,
                  },
                },
              ],
              checked: item.status === 'completed',
            },
          }))
        : [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: 'No action items.' } }],
              },
            },
          ]),
    ];

    const notionPayload = {
      parent: { database_id: notionDbId },
      properties: {
        // Notion database title property is commonly named "Name" or "title" or "Title"
        // Standard database schemas use "Name" or "title" as the primary title
        Name: {
          title: [
            {
              text: {
                content: `${meeting.title} (${dateStr})`,
              },
            },
          ],
        },
      },
      children: childrenBlocks,
    };

    try {
      const notionRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notionPayload),
      });

      if (!notionRes.ok) {
        const errText = await notionRes.text();
        throw new Error(`Notion responded with ${notionRes.status}: ${errText}`);
      }

      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to export to Notion',
      }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
}
