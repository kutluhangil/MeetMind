export function buildSummaryPrompt(
  transcript: string,
  language: 'tr' | 'en',
  templateType: string = 'general'
): string {
  const templateInstructions: Record<string, { tr: string; en: string }> = {
    general: {
      tr: 'Bu genel bir toplantıdır. Ana konuları, kararları ve önemli noktaları özetle.',
      en: 'This is a general meeting. Summarize the main topics, decisions, and highlights.'
    },
    standup: {
      tr: 'Bu bir günlük standup (ayakta) toplantısıdır. Bireysel güncellemelere, dün ne yapıldığına, bugün ne yapılacağına ve varsa engellere (blockers) odaklanarak özetle.',
      en: 'This is a daily standup meeting. Focus the summary on individual updates, what was done yesterday, what is planned for today, and any blockers/impediments.'
    },
    sales: {
      tr: 'Bu bir satış / müşteri görüşmesidir. Müşterinin ihtiyaçlarına, karşılaştığı zorluklara, bütçe/fiyat tartışmalarına, itirazlara ve atılacak bir sonraki adımlara odaklanarak özetle.',
      en: 'This is a sales or client call. Focus the summary on customer needs, pain points, pricing discussions, objections, and next steps.'
    },
    brainstorm: {
      tr: 'Bu bir beyin fırtınası toplantısıdır. Ortaya atılan fikirleri, önerileri, tartışılan alternatifleri ve bunların artı/eksi yönlerini detaylandırarak özetle.',
      en: 'This is a brainstorming session. Focus the summary on ideas generated, suggestions, alternatives discussed, and their pros/cons.'
    },
    interview: {
      tr: 'Bu bir iş görüşmesi veya birebir (1-on-1) görüşmedir. Adayın/çalışanın geri bildirimlerine, güçlü/zayıf yönlerine, performans değerlendirmesine ve kararlaştırılan aksiyonlara odaklanarak özetle.',
      en: 'This is an interview or 1-on-1 meeting. Focus the summary on candidate/employee feedback, strengths, weaknesses, performance discussion, and key actions.'
    }
  };

  const selectedInstructions = (templateInstructions[templateType] || templateInstructions.general) as { tr: string; en: string };

  const instructions = {
    tr: `Sen bir toplantı asistanısın. Verilen toplantı transkripsiyonunu analiz et.
Toplantı Türü: ${templateType.toUpperCase()}
Özel Talimat: ${selectedInstructions.tr}
Transkripsiyonu konuşma akışına göre segmentlere ayır ve her segmentin kime ait olduğunu tahmin et (Konuşmacı A, Konuşmacı B veya isimleri konuşmada geçiyorsa gerçek isimleri şeklinde).
Yanıtını SADECE geçerli JSON formatında ver, başka hiçbir şey ekleme.`,
    en: `You are a meeting assistant. Analyze the given meeting transcript.
Meeting Type: ${templateType.toUpperCase()}
Special Instructions: ${selectedInstructions.en}
Segment the transcript by conversational turns and attribute each turn to the correct speaker (e.g., "Speaker A", "Speaker B", or their real names if mentioned in the conversation).
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
  "sentiment": "positive | neutral | negative | mixed",
  "transcript_segments": [
    {
      "speaker": "string (name or Speaker A/B)",
      "text": "string (text spoken)"
    }
  ]
}`;

  return `${instructions[language]}

TRANSCRIPT:
${transcript}

EXPECTED JSON SCHEMA:
${schema}`;
}
