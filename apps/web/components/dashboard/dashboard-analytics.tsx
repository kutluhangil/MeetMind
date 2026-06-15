'use client';

import { useState } from 'react';

interface MeetingData {
  title: string;
  audio_duration: number | null;
  sentiment: string | null;
  created_at: string;
}

interface ActionItemData {
  status: string;
}

interface DashboardAnalyticsProps {
  meetings: MeetingData[];
  actionItems: ActionItemData[];
  locale: string;
}

export function DashboardAnalytics({ meetings, actionItems, locale }: DashboardAnalyticsProps) {
  const [hoveredMeetingIndex, setHoveredMeetingIndex] = useState<number | null>(null);

  const isTr = locale === 'tr';

  // 1. Filter completed meetings with durations
  const completedMeetings = meetings
    .filter((m) => m.audio_duration !== null)
    .slice(0, 7) // Take last 7 meetings
    .reverse(); // Chronological order

  // 2. Action item stats
  const totalActions = actionItems.length;
  const completedActions = actionItems.filter((a) => a.status === 'completed').length;
  const completionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Donut chart calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  // 3. Sentiment breakdown
  const sentimentCounts: Record<string, number> = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
  meetings.forEach((m) => {
    const s = m.sentiment ?? 'neutral';
    sentimentCounts[s] = (sentimentCounts[s] ?? 0) + 1;
  });

  const totalMeetingsWithSentiment = meetings.length;

  const sentimentPercentages = {
    positive: totalMeetingsWithSentiment > 0 ? Math.round(((sentimentCounts['positive'] ?? 0) / totalMeetingsWithSentiment) * 100) : 0,
    neutral: totalMeetingsWithSentiment > 0 ? Math.round(((sentimentCounts['neutral'] ?? 0) / totalMeetingsWithSentiment) * 100) : 0,
    negative: totalMeetingsWithSentiment > 0 ? Math.round(((sentimentCounts['negative'] ?? 0) / totalMeetingsWithSentiment) * 100) : 0,
    mixed: totalMeetingsWithSentiment > 0 ? Math.round(((sentimentCounts['mixed'] ?? 0) / totalMeetingsWithSentiment) * 100) : 0,
  };

  // SVG Line Chart coordinates for meeting duration
  const chartHeight = 120;
  const chartWidth = 320;
  const paddingX = 30;
  const paddingY = 20;

  const maxDuration = completedMeetings.length > 0
    ? Math.max(...completedMeetings.map((m) => (m.audio_duration ?? 0) / 60))
    : 0;

  const points = completedMeetings.map((m, idx) => {
    const durationMin = (m.audio_duration ?? 0) / 60;
    const x = paddingX + (idx / Math.max(1, completedMeetings.length - 1)) * (chartWidth - paddingX * 2);
    const y = maxDuration > 0
      ? chartHeight - paddingY - (durationMin / maxDuration) * (chartHeight - paddingY * 2)
      : chartHeight / 2;
    return { x, y, duration: durationMin, title: m.title };
  });

  const pathD = points.length > 0
    ? `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}`
    : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Chart 1: Duration Trend */}
      <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5 flex flex-col justify-between h-72 group hover:border-obsidian-500 transition-all duration-300">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isTr ? 'Toplantı Süreleri (Dk)' : 'Meeting Duration Trend (Min)'}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            {isTr ? 'Son 7 toplantının süre trendi' : 'Duration change for last 7 meetings'}
          </p>
        </div>

        <div className="relative flex-1 flex items-center justify-center my-2">
          {completedMeetings.length === 0 ? (
            <p className="text-xs text-slate-600 italic">{isTr ? 'Henüz veri yok' : 'No data available'}</p>
          ) : (
            <div className="w-full h-full relative">
              <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                {/* Horizontal Guide Lines */}
                {[0, 0.5, 1].map((ratio, idx) => {
                  const y = paddingY + ratio * (chartHeight - paddingY * 2);
                  return (
                    <line
                      key={idx}
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Path line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={2}
                    className="transition-all duration-500"
                  />
                )}

                {/* Dots on line */}
                {points.map((p, idx) => (
                  <g key={idx} className="cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredMeetingIndex === idx ? 6 : 4}
                      fill={hoveredMeetingIndex === idx ? '#10b981' : '#047857'}
                      stroke="rgba(16, 185, 129, 0.2)"
                      strokeWidth={hoveredMeetingIndex === idx ? 8 : 4}
                      onMouseEnter={() => setHoveredMeetingIndex(idx)}
                      onMouseLeave={() => setHoveredMeetingIndex(null)}
                      className="transition-all duration-200"
                    />
                  </g>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredMeetingIndex !== null && points[hoveredMeetingIndex] && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-obsidian-950 border border-obsidian-500 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 pointer-events-none shadow-lg z-10 transition-all duration-150">
                  <p className="font-semibold truncate max-w-[180px]">{points[hoveredMeetingIndex].title}</p>
                  <p className="text-emerald-400 mt-0.5">{points[hoveredMeetingIndex].duration.toFixed(1)} min</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-600 flex justify-between px-1">
          <span>{isTr ? 'Eski' : 'Oldest'}</span>
          <span>{isTr ? 'Yeni' : 'Newest'}</span>
        </div>
      </div>

      {/* Chart 2: Task Completion Donut */}
      <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5 flex flex-col justify-between h-72 group hover:border-obsidian-500 transition-all duration-300">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isTr ? 'Görev Tamamlama Oranı' : 'Action Item Completion'}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            {isTr ? 'Çıkarılan aksiyonların bitirilme oranı' : 'Ratio of completed action items'}
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center relative my-2">
          {totalActions === 0 ? (
            <p className="text-xs text-slate-600 italic">{isTr ? 'Aksiyon maddesi yok' : 'No action items'}</p>
          ) : (
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                {/* Background Circle */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="6"
                />
                {/* Progress Circle */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-100">{completionRate}%</span>
                <span className="text-[9px] text-slate-600 uppercase font-semibold">
                  {completedActions}/{totalActions} {isTr ? 'Tamamlandı' : 'Done'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-600 text-center">
          {isTr
            ? `${totalActions} aksiyon maddesinden ${completedActions} tanesi tamamlandı`
            : `${completedActions} out of ${totalActions} actions completed`}
        </div>
      </div>

      {/* Chart 3: Sentiment Breakdown */}
      <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5 flex flex-col justify-between h-72 group hover:border-obsidian-500 transition-all duration-300">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isTr ? 'Toplantı Duygu Durumu' : 'Meeting Sentiment'}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            {isTr ? 'Toplantıların genel ton dağılımı' : 'Tone distribution across meetings'}
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-3 my-2 px-1">
          {totalMeetingsWithSentiment === 0 ? (
            <p className="text-xs text-slate-600 italic self-center">{isTr ? 'Analiz yok' : 'No sentiments analyzed'}</p>
          ) : (
            <>
              {/* Positive */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-emerald-400 font-medium">{isTr ? 'Pozitif' : 'Positive'}</span>
                  <span className="text-slate-400 font-semibold">{sentimentPercentages.positive}%</span>
                </div>
                <div className="h-1.5 w-full bg-obsidian-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${sentimentPercentages.positive}%` }}
                  />
                </div>
              </div>

              {/* Neutral */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-blue-400 font-medium">{isTr ? 'Nötr' : 'Neutral'}</span>
                  <span className="text-slate-400 font-semibold">{sentimentPercentages.neutral}%</span>
                </div>
                <div className="h-1.5 w-full bg-obsidian-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${sentimentPercentages.neutral}%` }}
                  />
                </div>
              </div>

              {/* Negative */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-red-400 font-medium">{isTr ? 'Negatif' : 'Negative'}</span>
                  <span className="text-slate-400 font-semibold">{sentimentPercentages.negative}%</span>
                </div>
                <div className="h-1.5 w-full bg-obsidian-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${sentimentPercentages.negative}%` }}
                  />
                </div>
              </div>

              {/* Mixed */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-purple-400 font-medium">{isTr ? 'Karışık' : 'Mixed'}</span>
                  <span className="text-slate-400 font-semibold">{sentimentPercentages.mixed}%</span>
                </div>
                <div className="h-1.5 w-full bg-obsidian-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${sentimentPercentages.mixed}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="text-[10px] text-slate-600 text-center">
          {isTr ? 'Yapay zeka duygu analiz raporu' : 'AI sentiment scoring'}
        </div>
      </div>
    </div>
  );
}
