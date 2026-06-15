import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: {
    id: string;
    locale: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  const meetingId = params.id;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch message history for this meeting
  const { data: messages, error } = await supabase
    .from('meeting_messages')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  const meetingId = params.id;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { content: string };
  if (!body.content || !body.content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  // 1. Fetch meeting context (transcript and summary)
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('title, transcript, summary')
    .eq('id', meetingId)
    .single();

  if (meetingError || !meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }

  if (!meeting.transcript) {
    return NextResponse.json({ error: 'Meeting transcript is not ready yet' }, { status: 400 });
  }

  // 2. Save user message to database
  const { data: userMsg, error: userMsgError } = await supabase
    .from('meeting_messages')
    .insert({
      meeting_id: meetingId,
      user_id: user.id,
      role: 'user',
      content: body.content.trim()
    })
    .select()
    .single();

  if (userMsgError) {
    return NextResponse.json({ error: userMsgError.message }, { status: 500 });
  }

  // 3. Fetch recent message history for context (last 10 messages)
  const { data: history } = await supabase
    .from('meeting_messages')
    .select('role, content')
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true })
    .limit(10);

  const formattedHistory = (history ?? []).map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content
  }));

  // 4. Build OpenAI payload
  const systemPrompt = `You are MeetMind AI, an expert meeting assistant. You have access to the following meeting data:
- Title: ${meeting.title}
- Summary: ${meeting.summary ?? 'No summary available.'}
- Transcript:
"""
${meeting.transcript}
"""

Answer the user's questions about this meeting accurately, basing your responses strictly on the provided context (transcript and summary). If the answer cannot be found in the context, politely say so. Keep your responses concise, direct, and refer to specific parts or speakers when helpful. Response language should match the user's query language (e.g. answer in Turkish if asked in Turkish, in English if asked in English).`;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured on the server');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedHistory
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`OpenAI API request failed: ${errorDetail}`);
    }

    const aiResult = await response.json() as {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    };

    const aiAnswer = aiResult.choices[0]?.message?.content;
    if (!aiAnswer) {
      throw new Error('Empty response from OpenAI');
    }

    // 5. Save assistant message to database
    const { data: assistantMsg, error: assistantMsgError } = await supabase
      .from('meeting_messages')
      .insert({
        meeting_id: meetingId,
        user_id: user.id,
        role: 'assistant',
        content: aiAnswer.trim()
      })
      .select()
      .single();

    if (assistantMsgError) {
      return NextResponse.json({ error: assistantMsgError.message }, { status: 500 });
    }

    return NextResponse.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg
    });
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Internal Server Error'
    }, { status: 500 });
  }
}
