export function buildSummaryPrompt(transcript: string, language: 'tr' | 'en'): string {
  const instructions = {
    tr: `Sen bir toplantı asistanısın. Verilen toplantı transkripsiyonunu analiz et.
Yanıtını SADECE geçerli JSON formatında ver, başka hiçbir şey ekleme.`,
    en: `You are a meeting assistant. Analyze the given meeting transcript.
Return ONLY valid JSON, nothing else.`,
  };

  const schema = `{
  "summary": "string (3-5 paragraphs covering main topics and decisions)",
  "key_decisions": ["string", "string"],
  "action_items": [
    {
      "title": "string (short task title)",
      "description": "string or null",
      "assignee_name": "string or null",
      "assignee_email": "string or null",
      "due_date": "YYYY-MM-DD or null",
      "priority": "low | medium | high | urgent",
      "confidence": 0.0
    }
  ],
  "participants": [
    { "name": "string", "role": "string or null" }
  ],
  "meeting_duration_estimate": "string",
  "sentiment": "positive | neutral | negative | mixed"
}`;

  return `${instructions[language]}

TRANSCRIPT:
${transcript}

EXPECTED JSON SCHEMA:
${schema}`;
}
