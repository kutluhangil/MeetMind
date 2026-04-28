import OpenAI from 'openai';
import fs from 'fs';
import { buildSummaryPrompt } from '../utils/prompt.utils.js';

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export async function transcribeAudio(
  filePath: string,
  language: 'tr' | 'en' | 'auto'
): Promise<string> {
  const client = getClient();
  const fileStream = fs.createReadStream(filePath);

  const response = await client.audio.transcriptions.create({
    file: fileStream,
    model: 'whisper-1',
    ...(language !== 'auto' && { language }),
    response_format: 'text',
  });

  return response as unknown as string;
}

export interface SummaryResult {
  summary: string;
  key_decisions: string[];
  action_items: Array<{
    title: string;
    description: string | null;
    assignee_name: string | null;
    assignee_email: string | null;
    due_date: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    confidence: number;
  }>;
  participants: Array<{ name: string; role: string | null }>;
  meeting_duration_estimate: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
}

export async function summarizeMeeting(
  transcript: string,
  language: 'tr' | 'en'
): Promise<SummaryResult> {
  const client = getClient();
  const prompt = buildSummaryPrompt(transcript, language);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('GPT-4o returned empty response');

  return JSON.parse(content) as SummaryResult;
}
